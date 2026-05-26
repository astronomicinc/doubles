'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for server-side operations (can bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ApplicationSubmitData {
  applicantName: string;
  applicantEmail: string;
  applicantAge: number;
  applicantGender: string;
  friendName: string;
  friendEmail: string;
  friendGender: string;
  whyVouch: string;
  paymentIntentId: string;
  volumeId: string;
}

/**
 * submitApplication: Create application record and plus_one record
 * Returns the application ID on success
 */
export async function submitApplication(data: ApplicationSubmitData): Promise<string> {
  const {
    applicantName,
    applicantEmail,
    applicantAge,
    applicantGender,
    friendName,
    friendEmail,
    friendGender,
    whyVouch,
    paymentIntentId,
    volumeId,
  } = data;

  try {
    // Step 1: Create or get applicant user via Supabase Auth API
    // Try to create user (will fail if already exists)
    let applicantUserId: string | undefined;
    let createError: Error | null = null;

    try {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: applicantEmail,
        email_confirm: false, // They'll confirm via magic link
        user_metadata: {
          name: applicantName,
          age: applicantAge,
          gender: applicantGender,
        },
      });

      if (error) {
        createError = error as Error;
      } else if (newUser?.user?.id) {
        applicantUserId = newUser.user.id;
      }
    } catch (e) {
      createError = e as Error;
    }

    // If create failed due to duplicate, try to get user by email via listUsers
    if (!applicantUserId && createError) {
      try {
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError && users?.users) {
          const existingUser = users.users.find(u => u.email === applicantEmail);
          if (existingUser) {
            applicantUserId = existingUser.id;
          }
        }
      } catch (e) {
        console.log('Could not lookup existing user, continuing with new user creation');
      }
    }

    // If still no user ID, the creation truly failed
    if (!applicantUserId && createError) {
      throw new Error(`Failed to create or find user: ${createError.message}`);
    }

    // If we still don't have an ID, something went wrong
    if (!applicantUserId) {
      throw new Error('Failed to create or find user: unknown error');
    }

    // Step 2: Create application record
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        volume_id: volumeId,
        applicant_user_id: applicantUserId,
        applicant_payment_intent_id: paymentIntentId,
        applicant_status: 'pending',
        plus_one_status: 'invited',
      })
      .select('id')
      .single();

    if (appError) {
      throw new Error(`Failed to create application: ${appError.message}`);
    }

    const applicationId = application.id;

    // Step 3: Create plus_one record
    const { error: plusOneError } = await supabase
      .from('plus_ones')
      .insert({
        application_id: applicationId,
        email: friendEmail,
        name: friendName,
        gender: friendGender,
        why_vouch: whyVouch,
        status: 'invited',
      });

    if (plusOneError) {
      throw new Error(`Failed to create plus_one record: ${plusOneError.message}`);
    }

    // Step 4: Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        application_id: applicationId,
        stripe_intent_id: paymentIntentId,
        amount_cents: 14500,
        currency: 'usd',
        status: 'pending',
      });

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    return applicationId;
  } catch (error) {
    console.error('Submit application error:', error);
    throw error;
  }
}

/**
 * getPlusOneInvitation: Fetch plus_one record by invitation ID (used for friend invite link)
 */
export async function getPlusOneInvitation(plusOneId: string) {
  const { data, error } = await supabase
    .from('plus_ones')
    .select('id, application_id, email, name, status, why_vouch')
    .eq('id', plusOneId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch plus_one invitation: ${error.message}`);
  }

  return data;
}

/**
 * acceptPlusOneInvitation: Mark plus_one as accepted and link to authenticated user
 */
export async function acceptPlusOneInvitation(
  plusOneId: string,
  userId: string,
  userData?: { name?: string; gender?: string }
) {
  const updateData: any = {
    user_id: userId,
    status: 'accepted',
    responded_at: new Date().toISOString(),
  };

  if (userData?.name) {
    updateData.name = userData.name;
  }
  if (userData?.gender) {
    updateData.gender = userData.gender;
  }

  const { data, error } = await supabase
    .from('plus_ones')
    .update(updateData)
    .eq('id', plusOneId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to accept plus_one invitation: ${error.message}`);
  }

  return data;
}

/**
 * getApplicationByPaymentIntent: Look up application by Stripe payment intent ID
 * Used for admin operations (approve/reject)
 */
export async function getApplicationByPaymentIntent(paymentIntentId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('id, applicant_user_id, applicant_status, admin_decision')
    .eq('applicant_payment_intent_id', paymentIntentId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  return data;
}

/**
 * updateApplicationStatus: Update application admin decision and status
 */
export async function updateApplicationStatus(
  applicationId: string,
  decision: 'approved' | 'rejected',
  reason?: string
) {
  const updateData: any = {
    admin_decision: decision,
    applicant_status: decision === 'approved' ? 'confirmed' : 'cancelled',
  };

  if (reason) {
    updateData.rejection_reason = reason;
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update application status: ${error.message}`);
  }

  return data;
}

/**
 * checkInAttendee: Mark an attendee as checked in
 */
export async function checkInAttendee(applicationId: string, userId: string, role: 'applicant' | 'plus_one') {
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      application_id: applicationId,
      user_id: userId,
      role,
      checked_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // If already checked in, update the checked_in_at timestamp
    if (error.message?.includes('duplicate')) {
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to check in attendee: ${updateError.message}`);
      }
      return updated;
    }

    throw new Error(`Failed to check in attendee: ${error.message}`);
  }

  // Also update the checked_in flag on the application
  const { error: appError } = await supabase
    .from('applications')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (appError) {
    throw new Error(`Failed to update application checked_in status: ${appError.message}`);
  }

  return data;
}

/**
 * getEventAttendees: Fetch all confirmed, checked-in attendees for an event
 * Excludes the current user (no picking self)
 * Returns array of attendee objects with user metadata
 */
export async function getEventAttendees(volumeId: string, currentUserId: string) {
  try {
    // Get all confirmed applications for this volume that have checked in
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id, applicant_user_id, plus_one_user_id, checked_in')
      .eq('volume_id', volumeId)
      .eq('applicant_status', 'confirmed')
      .eq('checked_in', true);

    if (appError) {
      throw new Error(`Failed to fetch applications: ${appError.message}`);
    }

    // Collect all attendee user IDs (applicants + plus-ones who checked in)
    const attendeeIds = new Set<string>();

    applications?.forEach(app => {
      if (app.applicant_user_id && app.applicant_user_id !== currentUserId) {
        attendeeIds.add(app.applicant_user_id);
      }
      if (app.plus_one_user_id && app.plus_one_user_id !== currentUserId) {
        attendeeIds.add(app.plus_one_user_id);
      }
    });

    // If no attendees, return empty array
    if (attendeeIds.size === 0) {
      return [];
    }

    // Fetch user metadata from Supabase auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users) {
      throw new Error('Failed to fetch user details');
    }

    // Build attendee list with role context
    const attendees = users
      .filter(u => attendeeIds.has(u.id))
      .map(u => {
        // Determine if this user was an applicant or plus-one
        const asApplicant = applications?.find(app => app.applicant_user_id === u.id);
        const asPlusOne = applications?.find(app => app.plus_one_user_id === u.id);

        const role: 'Applicant' | 'Plus-One' | 'Attendee' = asApplicant ? 'Applicant' : asPlusOne ? 'Plus-One' : 'Attendee';

        return {
          id: u.id,
          name: u.user_metadata?.name || 'Attendee',
          email: u.email || '',
          role,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    return attendees;
  } catch (error) {
    console.error('Get event attendees error:', error);
    throw error;
  }
}

/**
 * getMyPicks: Fetch current user's spark picks for an event
 * Returns map of { [pickedUserId]: kind } for easy lookup in UI
 */
export async function getMyPicks(volumeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch all picks for this user in this event
    const { data: picks, error } = await supabase
      .from('sparks_picks')
      .select('picked_user_id, kind')
      .eq('picker_user_id', user.id)
      .eq('volume_id', volumeId);

    if (error) {
      throw new Error(`Failed to fetch picks: ${error.message}`);
    }

    // Transform to map for easy lookup: { [pickedUserId]: kind }
    const picksMap: Record<string, string> = {};
    picks?.forEach(pick => {
      picksMap[pick.picked_user_id] = pick.kind;
    });

    return picksMap;
  } catch (error) {
    console.error('Get my picks error:', error);
    throw error;
  }
}

/**
 * getMutualMatches: Fetch current user's mutual matches for an event
 * Returns array of intro records where the user is either party
 */
export async function getMutualMatches(volumeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch intros where user is either user_a or user_b
    const { data: intros, error } = await supabase
      .from('intros')
      .select('id, user_a_id, user_b_id, kind_a, kind_b, email_sent_at, user_a_viewed_at, user_b_viewed_at')
      .eq('volume_id', volumeId)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return intros || [];
  } catch (error) {
    console.error('Get mutual matches error:', error);
    throw error;
  }
}

/**
 * getMyMatches: Fetch current user's mutual matches with enriched user data
 * Returns array of match objects with name, email, and kind information
 */
export async function getMyMatches(volumeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch intros
    const intros = await getMutualMatches(volumeId);

    if (intros.length === 0) {
      return [];
    }

    // Collect all matched user IDs
    const matchedUserIds = new Set<string>();
    intros.forEach(intro => {
      if (intro.user_a_id !== user.id) matchedUserIds.add(intro.user_a_id);
      if (intro.user_b_id !== user.id) matchedUserIds.add(intro.user_b_id);
    });

    // Fetch user details
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users) {
      throw new Error('Failed to fetch user details');
    }

    // Build user map
    const userMap: Record<string, any> = {};
    users.forEach(u => {
      if (matchedUserIds.has(u.id)) {
        userMap[u.id] = {
          id: u.id,
          name: u.user_metadata?.name || u.email,
          email: u.email,
        };
      }
    });

    // Enrich intros with user data
    const enrichedMatches = intros
      .map(intro => {
        const isUserA = intro.user_a_id === user.id;
        const matchedUserId = isUserA ? intro.user_b_id : intro.user_a_id;
        const matchedUser = userMap[matchedUserId];

        if (!matchedUser) return null;

        return {
          id: intro.id,
          matchedUser,
          kindMyPick: isUserA ? intro.kind_a : intro.kind_b,
          kindTheirPick: isUserA ? intro.kind_b : intro.kind_a,
          emailSentAt: intro.email_sent_at,
          iViewed: isUserA ? intro.user_a_viewed_at : intro.user_b_viewed_at,
          theyViewed: isUserA ? intro.user_b_viewed_at : intro.user_a_viewed_at,
        };
      })
      .filter((m): m is Exclude<typeof m, null> => m !== null)
      .sort((a, b) => new Date(b.emailSentAt).getTime() - new Date(a.emailSentAt).getTime());

    return enrichedMatches;
  } catch (error) {
    console.error('Get my matches error:', error);
    throw error;
  }
}

/**
 * recordIntroViewed: Mark an intro as viewed by the current user
 */
export async function recordIntroViewed(introId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch the intro to determine which column to update
    const { data: intro, error: fetchError } = await supabase
      .from('intros')
      .select('user_a_id, user_b_id')
      .eq('id', introId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch intro: ${fetchError.message}`);
    }

    let updateData: any = { updated_at: new Date().toISOString() };

    if (intro.user_a_id === user.id) {
      updateData.user_a_viewed_at = new Date().toISOString();
    } else if (intro.user_b_id === user.id) {
      updateData.user_b_viewed_at = new Date().toISOString();
    } else {
      throw new Error('User is not a party to this intro');
    }

    // Update the viewed_at timestamp
    const { data, error } = await supabase
      .from('intros')
      .update(updateData)
      .eq('id', introId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record view: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Record intro viewed error:', error);
    throw error;
  }
}
