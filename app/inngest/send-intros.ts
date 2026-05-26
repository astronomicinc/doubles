import { inngest } from '@/.inngest/client';
import { createClient } from '@supabase/supabase-js';
import { sendIntroEmail } from '@/app/actions/emails';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Inngest job: sendIntrosForVolume
 *
 * Flow:
 * 1. Fetch all confirmed, checked-in attendees for the volume
 * 2. Fetch all spark picks for the volume
 * 3. Compute mutual matches (A picked B AND B picked A)
 * 4. Create intro records with normalized pair ordering (A < B)
 * 5. Send intro emails to both parties
 * 6. Mark intros as sent
 */
export const sendIntrosForVolume = inngest.createFunction(
  { id: 'send-intros-for-volume', triggers: [{ event: 'intros/send' }] },
  async ({ event }) => {
    const { volumeId } = event.data;

    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Step 1: Fetch all confirmed, checked-in attendees for the volume
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('id, applicant_user_id, plus_one_user_id, checked_in')
        .eq('volume_id', volumeId)
        .eq('applicant_status', 'confirmed')
        .eq('checked_in', true);

      if (appError) {
        throw new Error(`Failed to fetch applications: ${appError.message}`);
      }

      // Collect all attendee user IDs
      const attendeeIds = new Set<string>();
      applications?.forEach(app => {
        if (app.applicant_user_id) attendeeIds.add(app.applicant_user_id);
        if (app.plus_one_user_id) attendeeIds.add(app.plus_one_user_id);
      });

      if (attendeeIds.size === 0) {
        console.log(`No attendees found for volume ${volumeId}`);
        return {
          success: true,
          message: 'No attendees to process',
          introsCreated: 0,
        };
      }

      // Step 2: Fetch all spark picks for the volume
      const { data: allPicks, error: picksError } = await supabase
        .from('sparks_picks')
        .select('picker_user_id, picked_user_id, kind')
        .eq('volume_id', volumeId);

      if (picksError) {
        throw new Error(`Failed to fetch picks: ${picksError.message}`);
      }

      // Step 3: Compute mutual matches
      // Map each user's picks: { [pickedUserId]: kind }
      const picksByUser: Record<string, Record<string, string>> = {};
      allPicks?.forEach(pick => {
        if (!picksByUser[pick.picker_user_id]) {
          picksByUser[pick.picker_user_id] = {};
        }
        picksByUser[pick.picker_user_id][pick.picked_user_id] = pick.kind;
      });

      const mutuals: Array<{
        userAId: string;
        userBId: string;
        kindA: string;
        kindB: string;
      }> = [];

      // Find mutual pairs (A picked B AND B picked A)
      for (const userA of attendeeIds) {
        const userAPicks = picksByUser[userA] || {};
        for (const userB of Object.keys(userAPicks)) {
          if (attendeeIds.has(userB)) {
            const userBPicks = picksByUser[userB] || {};
            if (userBPicks[userA]) {
              // Mutual match found! Normalize pair ordering (smaller ID first)
              const userANorm = userA < userB ? userA : userB;
              const userBNorm = userA < userB ? userB : userA;
              const kindANorm = userA < userB ? userAPicks[userB] : userBPicks[userA];
              const kindBNorm = userA < userB ? userBPicks[userA] : userAPicks[userB];

              // Check if we already added this pair (avoid duplicates)
              const alreadyAdded = mutuals.some(
                m => m.userAId === userANorm && m.userBId === userBNorm
              );

              if (!alreadyAdded) {
                mutuals.push({
                  userAId: userANorm,
                  userBId: userBNorm,
                  kindA: kindANorm,
                  kindB: kindBNorm,
                });
              }
            }
          }
        }
      }

      if (mutuals.length === 0) {
        console.log(`No mutual matches found for volume ${volumeId}`);
        return {
          success: true,
          message: 'No mutual matches found',
          introsCreated: 0,
        };
      }

      // Step 4: Fetch user details (email, name) for all attendees
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError || !users) {
        throw new Error('Failed to fetch user details');
      }

      const userMap: Record<string, any> = {};
      users.forEach(u => {
        userMap[u.id] = {
          email: u.email,
          name: u.user_metadata?.name || u.email,
        };
      });

      // Step 5 & 6: Create intro records and send emails
      const introsToCreate: Array<{
        volume_id: string;
        user_a_id: string;
        user_b_id: string;
        kind_a: string;
        kind_b: string;
      }> = [];

      for (const mutual of mutuals) {
        const userA = userMap[mutual.userAId];
        const userB = userMap[mutual.userBId];

        if (!userA || !userB) {
          console.warn(
            `Missing user data for pair ${mutual.userAId} - ${mutual.userBId}`
          );
          continue;
        }

        // Send intro emails
        try {
          await sendIntroEmail(
            userA.email,
            userA.name,
            userB.email,
            userB.name,
            mutual.kindA,
            mutual.kindB,
            volumeId
          );

          introsToCreate.push({
            volume_id: volumeId,
            user_a_id: mutual.userAId,
            user_b_id: mutual.userBId,
            kind_a: mutual.kindA,
            kind_b: mutual.kindB,
          });
        } catch (emailError) {
          console.error(
            `Failed to send intro email to ${userA.email} and ${userB.email}:`,
            emailError
          );
          // Continue with other pairs even if one fails
        }
      }

      // Batch insert intro records with email_sent_at timestamp
      if (introsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('intros')
          .insert(
            introsToCreate.map(intro => ({
              ...intro,
              email_sent_at: new Date().toISOString(),
            }))
          );

        if (insertError && !insertError.message?.includes('duplicate')) {
          throw new Error(`Failed to create intro records: ${insertError.message}`);
        }

        console.log(`Created ${introsToCreate.length} intro records for volume ${volumeId}`);
      }

      return {
        success: true,
        message: `Processed ${mutuals.length} mutual matches`,
        introsCreated: introsToCreate.length,
        emailsSent: introsToCreate.length * 2, // 2 emails per intro
      };
    } catch (error) {
      console.error('sendIntrosForVolume job error:', error);
      throw error;
    }
  }
);

/**
 * Inngest function to trigger the send-intros job
 * Called via admin endpoint
 */
export async function triggerSendIntrosForVolume(volumeId: string) {
  try {
    const result = await inngest.send({
      name: 'intros/send',
      data: { volumeId },
    });

    console.log(`Triggered send-intros job for volume ${volumeId}:`, result);
    return result;
  } catch (error) {
    console.error('Failed to trigger send-intros job:', error);
    throw error;
  }
}
