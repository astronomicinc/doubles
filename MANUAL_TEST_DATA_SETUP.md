# Manual Test Data Setup (Option 1: Through Application Flow)

## Overview
This guide walks you through creating test data by using the actual application as users would. This ensures the data flows through all real business logic and RLS policies.

---

## Prerequisites

Before starting, ensure:
- ✅ Vercel deployment is live and working
- ✅ You can access the application at `https://doubles-chrisbeaman-astronomic.vercel.app` (or your custom domain)
- ✅ You have admin access (can see `/admin/volumes`)
- ✅ You have multiple test email addresses or can create accounts quickly

---

## Step 1: Create a Test Volume

### 1.1 Navigate to Create Volume
```
URL: /admin/volumes (or use dashboard)
Click: "Create New Event" button
(if not visible, you may need to add this button or use Supabase admin panel)
```

### 1.2 Fill in Volume Details
```
Event Name: "Test Event - Phase 4A"
Event Number: 1
Doors Date: June 15, 2026 (or today's date + 2 weeks)
Capacity: 15 (smaller than production for easier testing)
Description: "Test event for analytics validation"
Status: "active"

Save Volume
```

### 1.3 Record the Volume ID
The volume should now be listed in `/admin/volumes`. Record its ID:
```
Volume ID: vol_[xxx]
```

---

## Step 2: Create Test User Accounts

You'll need multiple test accounts to simulate different user types. Create at least 12 accounts:

### 2.1 Create Users via Email
Use test emails in this format:
```
testuser1@example.com
testuser2@example.com
testuser3@example.com
... up to testuser12@example.com
```

For each user:
1. Go to app sign-up page
2. Enter email
3. Set password (use same password like "TestPassword123!" for simplicity)
4. Confirm email (if email verification required, check inbox or admin panel)

### 2.2 Record User IDs
After creating users, you may need to get their IDs from the admin panel or Supabase. Record:
```
User 1 (testuser1): id = user_1
User 2 (testuser2): id = user_2
... up to User 12
```

---

## Step 3: Have Users Apply to the Event

This creates application records.

### 3.1 First 12 Applications (Mixed Approval Status)

**Scenario:** Create 12 applications to reach 20 total in test data
- Plan to approve: 7 users
- Plan to reject: 3 users (for rejection reason variety)
- Plan to keep pending: 2 users

For each user (testuser1 through testuser12):

1. **Log in as User**
   - Go to homepage
   - Click "Login"
   - Enter email: `testuser[n]@example.com`
   - Enter password: `TestPassword123!`

2. **Find and Apply to Test Event**
   - Browse events or search for "Test Event - Phase 4A"
   - Click "Apply"
   - Fill out application form:
     - Age: 28-35 (valid)
     - Bio: "Test user [n]"
     - Looking for: Any option
     - Accept terms: Yes
   - Click "Submit Application"

3. **Repeat for Users 1-12**

**After 12 applications, log out.**

---

## Step 4: Admin Approves/Rejects Applications

### 4.1 Go to Admin Panel
```
URL: /admin/volumes/[volumeId]
```

You should see applications listed in the "Applications" section.

### 4.2 Approve/Reject Mix

From your 12 applications:

**Approve 7 users:**
```
testuser1 ✅ Approve
testuser2 ✅ Approve
testuser3 ✅ Approve
testuser4 ✅ Approve
testuser5 ✅ Approve
testuser6 ✅ Approve
testuser7 ✅ Approve
```

**Reject 3 users (with different reasons):**
```
testuser8 ❌ Reject - Reason: "age" (too young or old)
testuser9 ❌ Reject - Reason: "not_aligned" (preferences don't match)
testuser10 ❌ Reject - Reason: "other"
```

**Leave 2 pending:**
```
testuser11 ⏳ Pending (don't approve/reject)
testuser12 ⏳ Pending (don't approve/reject)
```

**Result after Step 4:**
- Total Applications: 12
- Approved: 7
- Rejected: 3
- Pending: 2
- Approval Rate: 7/12 = 58%

---

## Step 5: Approved Users Confirm Attendance

This creates attendance records.

### 5.1 Users Confirm or Decline
For the 7 approved users:

1. **Log in as testuser1**
2. Navigate to "My Applications" or event details
3. Click "Confirm Attendance"
4. Fill in attendance preferences (if any)
5. Click "Confirm"
6. Log out

**Repeat for testuser2 through testuser7**

**Attendance Confirmation Scenario:**
```
testuser1 ✅ Confirm
testuser2 ✅ Confirm
testuser3 ✅ Confirm
testuser4 ✅ Confirm
testuser5 ✅ Confirm
testuser6 ❌ Decline (or don't confirm - no attendance record)
testuser7 ✅ Confirm
```

**Result after Step 5:**
- Confirmed Attendees: 6
- No Confirmation: 1
- Check-in Rate (calculation basis): 6 confirmed

---

## Step 6: Event Day - Users Check In

This creates checked_in status and enables spark picks.

### 6.1 Admin Marks Users as Checked In

On admin dashboard or event check-in page, mark confirmed attendees:

```
testuser1 ✅ Checked In
testuser2 ✅ Checked In
testuser3 ✅ Checked In
testuser4 ✅ Checked In
testuser5 ❌ Did Not Check In (confirmed but absent)
testuser7 ✅ Checked In
```

**Result after Step 6:**
- Total Checked In: 5
- Check-in Rate: 5/6 = 83%

---

## Step 7: Users Make Spark Picks

This creates spark picks records.

### 7.1 During Event - Users Pick Sparks

For each checked-in user (1, 2, 3, 4, 7):

1. **Log in as testuser[n]**
2. Navigate to "Make Spark Picks" or event sparks page
3. **Pick 3 sparks** (like/connect) on other attendees:
   - testuser1 picks: testuser2, testuser3, testuser4
   - testuser2 picks: testuser1, testuser3, testuser7
   - testuser3 picks: testuser1, testuser2, testuser4
   - testuser4 picks: testuser1, testuser3, testuser7
   - testuser7 picks: testuser1, testuser2, testuser3

4. **Pick 1 conversation starter:**
   - Each user picks 1 person for "conversation starter" question

5. Log out

**Result after Step 7:**
```
Total Spark Picks: 15 (5 users × 3 picks)
Conversation Starters: 5 (1 per user)

Most Picked Users:
- testuser1: 4 times (picked by 2, 3, 4, 7)
- testuser3: 4 times (picked by 1, 2, 4, 7)
- testuser2: 3 times (picked by 1, 3, 7)
- testuser4: 2 times (picked by 1, 3)
- testuser7: 2 times (picked by 2, 4)
```

---

## Step 8: Generate Mutual Matches

This creates intro records (mutual matches).

### 8.1 Admin Calculates Matches

The system should automatically detect mutual picks and create intros. If this is manual in your code:

Admin navigates to: `/admin/volumes/[volumeId]` → "Generate Matches"

OR

Check if an API endpoint exists: `POST /api/admin/volumes/[volumeId]/generate-matches`

**Expected Mutual Matches:**
```
testuser1 ↔ testuser2: mutual ✓ (1→2, 2→1)
testuser1 ↔ testuser3: mutual ✓ (1→3, 3→1)
testuser1 ↔ testuser4: mutual ✓ (1→4, 4→1)
testuser2 ↔ testuser3: mutual ✓ (2→3, 3→2)
testuser2 ↔ testuser7: mutual ✓ (2→7, 7→2)
testuser3 ↔ testuser4: mutual ✓ (3→4, 4→3)

Total Mutual Matches: 6
```

**Result after Step 8:**
- Total Intros (matches): 6
- Match Rate: 6/5 = 120% (some users matched multiple times, which is valid)
- OR Match Rate: (6 intros representing 10 unique user-pairs) / (5 users) = 67%

---

## Step 9: Record Payments

This creates payment records (financial metrics).

### 9.1 Users Who Checked In Pay

For the 5 checked-in users:

**Option A: Manual Payment Entry (Admin Panel)**
1. Admin panel → Event → "Payments"
2. For each checked-in user, create payment record:
   ```
   User: testuser1
   Amount: $110
   Status: succeeded
   Date: [Event Date]
   ```
3. Repeat for testuser2, testuser3, testuser4, testuser7

**Option B: Users Pay via Checkout**
1. Log in as testuser1
2. Navigate to "Event Payment" or checkout page
3. Enter payment method (test card: 4242 4242 4242 4242)
4. Complete payment
5. System records payment in `payments` table

**Result after Step 9:**
```
Total Payments: 5
Total Revenue: 5 × $110 = $550
Payment Success Rate: 5/5 = 100%
```

---

## Step 10: Record Engagement (Optional)

This creates engagement records (optional for testing).

### 10.1 Profile Views
If you have engagement tracking:

Admin panel → "Mark User Engagement" OR system auto-tracks:
```
testuser1: viewed 8 profiles
testuser2: viewed 5 profiles
testuser3: viewed 3 profiles
testuser4: viewed 1 profile
testuser7: viewed 0 profiles

Total Views: 17
View Rate: 4/5 = 80%
```

If not tracking, this section will show $0 and can be marked as "not implemented."

---

## Step 11: Verify Analytics Dashboard

### 11.1 Navigate to Single Event Page
```
URL: /admin/volumes/[volumeId]
Expected: Analytics dashboard loads with calculated metrics
```

### 11.2 Verify Metrics Match Expected Values

Compare what you see on the dashboard to these expected values:

```
APPLICATIONS
├─ Total: 12 ✅
├─ Approved: 7 ✅
├─ Rejection Rate: 25% (3/12) ✅
├─ Pending: 2 ✅
└─ Approval Rate: 58% (7/12) ✅

ATTENDANCE
├─ Confirmed: 6 ✅
├─ Checked In: 5 ✅
└─ Check-in Rate: 83% (5/6) ✅

SPARK PICKS
├─ Total Picks: 20 (15 sparks + 5 starters) ✅
├─ Spark Picks: 15 ✅
├─ Conversation Starters: 5 ✅
└─ Most Picked: testuser1 or testuser3 (4 times) ✅

MUTUAL MATCHES
├─ Total Matches: 6 ✅
├─ Match Rate: 67% (using formula: 6 matches / 9 unique users involved) ✅
└─ Users Matched: 5 out of 5 checked-in users ✅

FINANCIAL
├─ Total Revenue: $550 ✅
├─ Revenue per Attendee: $110 (550/5) ✅
└─ Payment Success Rate: 100% (5/5) ✅
```

### 11.3 Document Any Discrepancies
If calculated values don't match:
```
Expected: 58% approval rate
Actual: [what you see]
Difference: [amount]
Possible cause: [formula issue, missing data, rounding]
```

---

## Step 12: Create Additional Test Events (for Phase 4B)

Repeat Steps 1-11 to create **2 more test events** with slightly different metrics to test historical trends.

### Event 2: "Growing Momentum"
Use the same structure but adjust:
- More applications (14 total)
- Higher approval rate (11 approved, 60%)
- Better attendance (10 confirmed, 9 checked in, 90%)
- Similar or higher matches
- Higher revenue ($990)

### Event 3: "Peak Performance"
- Even more applications (16 total)
- Even higher approval rate (65%)
- Best attendance and matches
- Highest revenue ($1,210)

---

## Step 13: Verify Trends on Comparison Page

### 13.1 Navigate to Comparison Page
```
URL: /admin/compare
Expected: Shows all 3 events with trends
```

### 13.2 Verify Trend Calculations

```
Event 2 vs Event 1:
├─ Approval Rate: 60% vs 58% = +2% ✅ (neutral or slight up)
├─ Check-in Rate: 90% vs 83% = +7% ✅ (up)
├─ Match Rate: Similar or higher ✅
└─ Revenue: $990 vs $550 = +80% ✅ (significant up)

Event 3 vs Event 2:
├─ Approval Rate: 65% vs 60% = +5% ✅ (up)
├─ Check-in Rate: Similar or higher ✅
├─ Match Rate: Similar or higher ✅
└─ Revenue: $1,210 vs $990 = +22% ✅ (up)

Overall Trend Direction:
├─ All metrics improving ✅ (should show "↑ Improving")
├─ Summary cards show correct averages ✅
└─ Events listed newest first ✅
```

---

## Troubleshooting

### Issue: Applications aren't appearing in admin panel

**Solution:**
- Verify user accounts were created (check auth/users in Supabase)
- Ensure applications were submitted (check `applications` table in Supabase)
- Verify volume ID is correct
- Check browser console for errors

### Issue: Attendance records not creating when users confirm

**Solution:**
- Check if confirm attendance button/flow exists
- Verify `attendance` table has records
- Check RLS policies allow creation
- May need to manually create attendance records via Supabase

### Issue: Metrics not calculating correctly

**Solution:**
- Verify data exists in Supabase tables
- Check server action queries return correct data
- Review analytics.ts formulas match documentation
- Check TypeScript error messages in build logs

### Issue: Trends showing incorrect direction

**Solution:**
- Verify trend calculation formula in analytics.ts
- Check that events are sorted chronologically
- Ensure previous/current event values are correct
- Verify rounding logic (±2% = neutral)

---

## Manual Testing Notes

**Pro Tips:**
1. Take screenshots of each step for documentation
2. Note exact timestamps when creating records
3. Keep a spreadsheet of user→email→ID mappings
4. Save admin panel screenshots showing expected metrics
5. Compare actual dashboard values to your spreadsheet calculations

**Time Estimate:**
- Steps 1-5: 30 minutes
- Steps 6-9: 20 minutes
- Step 10: 5 minutes
- Step 11: 10 minutes
- Steps 12-13: 45 minutes

**Total: ~2 hours for full 3-event testing setup**

---

## Next Steps After Manual Testing

Once manual data is created and verified:

1. ✅ Screenshot analytics dashboard with all metrics
2. ✅ Document any discrepancies found
3. ✅ Verify Phase 4C (single event) calculations match
4. ✅ Verify Phase 4B (trends) calculations match
5. ✅ Run automated tests from PHASE_4A_E2E_TESTING.md
6. ✅ Test responsive design on mobile/tablet
7. ✅ Test accessibility (keyboard nav, screen reader)
8. ✅ Performance check in DevTools
9. ✅ Sign off when all tests pass

---

## Data Cleanup

When testing is complete, you can delete test data:

**In Supabase SQL:**
```sql
-- Delete test volume and cascade delete related data
DELETE FROM volumes WHERE id = 'vol_test_001';
```

OR

**Keep test data for regression testing** (recommended for ongoing QA)
