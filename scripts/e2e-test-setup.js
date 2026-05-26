const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data for analytics...\n');

    // 1. Create test volume
    console.log('1️⃣  Creating test volume...');
    const { data: volumeData, error: volumeError } = await supabase
      .from('volumes')
      .insert({
        number: 999,
        name: 'Test Deuce #999 - Analytics Testing',
        status: 'active',
        doors_date: new Date().toISOString().split('T')[0],
        doors_time_start: '19:00:00',
        doors_time_end: '22:00:00',
        venue_name: 'Test Analytics Venue',
        venue_address: '123 Analytics Test St, SF',
        capacity: 30,
      })
      .select()
      .single();

    if (volumeError) throw volumeError;
    const volumeId = volumeData.id;
    console.log(`✓ Volume created: ${volumeId}\n`);

    // 2. Create test users and applications
    console.log('2️⃣  Creating test users and applications...');
    const testNames = [
      { applicant: 'Alice Chen', friend: 'Bob Smith' },
      { applicant: 'Carol Davis', friend: 'David Lee' },
      { applicant: 'Eve Johnson', friend: 'Frank Wilson' },
      { applicant: 'Grace Kim', friend: 'Henry Brown' },
      { applicant: 'Iris Zhang', friend: 'Jack Miller' },
      { applicant: 'Julia Lopez', friend: 'Kevin Martin' },
      { applicant: 'Kate Anderson', friend: 'Liam Taylor' },
      { applicant: 'Megan White', friend: 'Noah Garcia' },
      { applicant: 'Olivia Harris', friend: 'Paul Thomas' },
      { applicant: 'Quinn Moore', friend: 'Ryan Jackson' },
    ];

    const applications = [];
    for (let i = 0; i < testNames.length; i++) {
      const { applicant, friend } = testNames[i];
      const applicantEmail = `test-applicant-${i}@example.com`;
      const friendEmail = `test-friend-${i}@example.com`;

      // Create applicant user
      let applicantUserId;
      const { data: appUser, error: appUserError } = await supabase.auth.admin.createUser({
        email: applicantEmail,
        email_confirm: true,
        user_metadata: { name: applicant, gender: i % 2 === 0 ? 'Female' : 'Male' },
      });

      if (appUserError && !appUserError.message.includes('already exists')) throw appUserError;
      if (appUser?.user?.id) {
        applicantUserId = appUser.user.id;
      } else {
        applicantUserId = await getExistingUserId(applicantEmail);
      }

      // Create friend user
      let friendUserId;
      const { data: friendUser, error: friendUserError } = await supabase.auth.admin.createUser({
        email: friendEmail,
        email_confirm: true,
        user_metadata: { name: friend, gender: i % 2 === 1 ? 'Female' : 'Male' },
      });

      if (friendUserError && !friendUserError.message.includes('already exists')) throw friendUserError;
      if (friendUser?.user?.id) {
        friendUserId = friendUser.user.id;
      } else {
        friendUserId = await getExistingUserId(friendEmail);
      }

      // Create application
      const { data: app, error: appError } = await supabase
        .from('applications')
        .insert({
          volume_id: volumeId,
          applicant_user_id: applicantUserId,
          applicant_status: 'pending',
          applicant_payment_intent_id: `test_intent_${Date.now()}_${i}`,
        })
        .select()
        .single();

      if (appError) throw appError;

      // Create plus_one
      const { error: plusOneError } = await supabase
        .from('plus_ones')
        .insert({
          application_id: app.id,
          user_id: friendUserId,
          email: friendEmail,
          name: friend,
          gender: friendUser?.user?.user_metadata?.gender || 'Other',
          status: 'pending',
        });

      if (plusOneError) throw plusOneError;

      applications.push({
        id: app.id,
        applicantUserId,
        friendUserId,
        index: i,
      });
    }
    console.log(`✓ Created ${applications.length} applications\n`);

    // 3. Approve/reject with mix (approvals: 0-6, rejections: 7-8, pending: 9)
    console.log('3️⃣  Approving/rejecting applications...');
    const approvalRejectionMap = [
      { index: 0, decision: 'approved' },
      { index: 1, decision: 'approved' },
      { index: 2, decision: 'approved' },
      { index: 3, decision: 'approved' },
      { index: 4, decision: 'approved' },
      { index: 5, decision: 'approved' },
      { index: 6, decision: 'approved' },
      { index: 7, decision: 'rejected', reason: 'Incomplete application' },
      { index: 8, decision: 'rejected', reason: 'Did not meet criteria' },
      { index: 9, decision: null }, // pending
    ];

    for (const item of approvalRejectionMap) {
      const app = applications[item.index];
      const updateData = { admin_decision: item.decision };
      if (item.decision === 'approved') {
        updateData.applicant_status = 'confirmed';
      } else if (item.decision === 'rejected') {
        updateData.applicant_status = 'cancelled';
        updateData.rejection_reason = item.reason;
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', app.id);

      if (updateError) throw updateError;
    }
    console.log(`✓ Approved: 7, Rejected: 2, Pending: 1\n`);

    // 4. Create payments for approved applications
    console.log('4️⃣  Creating payment records...');
    for (let i = 0; i < 7; i++) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          application_id: applications[i].id,
          stripe_intent_id: `test_payment_${Date.now()}_${i}`,
          amount_cents: 11000, // $110
          currency: 'usd',
          status: i < 6 ? 'succeeded' : 'processing', // 6 succeeded, 1 processing
        });

      if (paymentError) throw paymentError;
    }
    console.log(`✓ Created payments: 6 succeeded, 1 processing\n`);

    // 5. Check in 5 attendees (from approved applications)
    console.log('5️⃣  Checking in attendees...');
    for (let i = 0; i < 5; i++) {
      const app = applications[i];

      // Check in applicant
      const { error: appCheckError } = await supabase
        .from('attendance')
        .insert({
          application_id: app.id,
          user_id: app.applicantUserId,
          role: 'applicant',
          checked_in_at: new Date().toISOString(),
        });

      if (appCheckError && !appCheckError.message.includes('duplicate')) throw appCheckError;

      // Check in friend
      const { error: friendCheckError } = await supabase
        .from('attendance')
        .insert({
          application_id: app.id,
          user_id: app.friendUserId,
          role: 'plus_one',
          checked_in_at: new Date().toISOString(),
        });

      if (friendCheckError && !friendCheckError.message.includes('duplicate')) throw friendCheckError;
    }
    console.log(`✓ Checked in 10 attendees (5 pairs)\n`);

    // 6. Submit spark picks
    console.log('6️⃣  Submitting spark picks...');
    let pickCount = 0;
    for (let i = 0; i < 5; i++) {
      const picker = applications[i];
      const targetIndices = [(i + 1) % 5, (i + 2) % 5, (i + 3) % 5];

      for (const targetIdx of targetIndices) {
        const target = applications[targetIdx];
        const kind = ['date', 'connect', 'both'][Math.floor(Math.random() * 3)];

        const { error: pickError } = await supabase
          .from('sparks_picks')
          .insert({
            picker_user_id: picker.applicantUserId,
            picked_user_id: target.applicantUserId,
            volume_id: volumeId,
            kind,
          });

        // Ignore duplicates
        if (pickError && !pickError.message.includes('duplicate')) throw pickError;
        pickCount++;
      }
    }
    console.log(`✓ Created spark picks (${pickCount} total)\n`);

    // 7. Create some intros (mutual matches)
    console.log('7️⃣  Creating mutual intros...');
    const intros = [
      {
        user_a_id: applications[0].applicantUserId,
        user_b_id: applications[1].applicantUserId,
        kind_a: 'date',
        kind_b: 'date',
      },
      {
        user_a_id: applications[0].applicantUserId,
        user_b_id: applications[2].applicantUserId,
        kind_a: 'both',
        kind_b: 'both',
      },
      {
        user_a_id: applications[1].applicantUserId,
        user_b_id: applications[3].applicantUserId,
        kind_a: 'connect',
        kind_b: 'date',
      },
      {
        user_a_id: applications[2].applicantUserId,
        user_b_id: applications[4].applicantUserId,
        kind_a: 'both',
        kind_b: 'connect',
      },
    ];

    for (const intro of intros) {
      const [userA, userB] = intro.user_a_id < intro.user_b_id
        ? [intro.user_a_id, intro.user_b_id]
        : [intro.user_b_id, intro.user_a_id];

      const { error: introError } = await supabase
        .from('intros')
        .insert({
          volume_id: volumeId,
          user_a_id: userA,
          user_b_id: userB,
          kind_a: intro.kind_a,
          kind_b: intro.kind_b,
          email_sent_at: new Date().toISOString(),
        });

      if (introError && !introError.message.includes('duplicate')) throw introError;
    }
    console.log(`✓ Created ${intros.length} intros\n`);

    // 8. Mark some intros as viewed
    console.log('8️⃣  Marking some intros as viewed...');
    const { data: allIntros, error: introsError } = await supabase
      .from('intros')
      .select('id')
      .eq('volume_id', volumeId)
      .limit(2);

    if (!introsError && allIntros) {
      for (let i = 0; i < allIntros.length; i++) {
        const { error: viewError } = await supabase
          .from('intros')
          .update({ user_a_viewed_at: new Date().toISOString() })
          .eq('id', allIntros[i].id);

        if (viewError) throw viewError;
      }
    }
    console.log(`✓ Marked intros as viewed\n`);

    console.log('✅ TEST DATA SETUP COMPLETE\n');
    console.log(`📊 Test Data Summary:`);
    console.log(`   Volume ID: ${volumeId}`);
    console.log(`   Applications: 10 (7 approved, 2 rejected, 1 pending)`);
    console.log(`   Approval Rate: 70%`);
    console.log(`   Attendees checked in: 10 (5 approved pairs)`);
    console.log(`   Check-in Rate: 100% (10/10 confirmed)`);
    console.log(`   Spark picks: ~${pickCount}`);
    console.log(`   Intros created: 4`);
    console.log(`   Intros viewed: 2`);
    console.log(`   Revenue: $660 (6 x $110 succeeded)`);
    console.log(`\n🔗 View dashboard: https://doubles.singles/admin/volumes/${volumeId}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function getExistingUserId(email) {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === email);
  return user?.id;
}

setupTestData();
