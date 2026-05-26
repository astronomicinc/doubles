# Phase 4A: End-to-End Testing for Analytics System

## Overview
This document provides comprehensive testing validation for the analytics system (Phase 4C & 4B). Each test includes:
- Expected formula/calculation
- Sample data scenario
- Validation method
- Expected output

---

## Part 1: Single-Event Analytics (Phase 4C)

### Test Scenario: "Deuce #1: Summer Launch"
**Volume Setup:**
- Volume ID: `vol_001`
- Volume Name: "Summer Launch"
- Volume Number: 1
- Doors Date: 2026-06-15
- Status: active
- Capacity: 30 attendees (15 pairs)

---

## Test 1.1: Application Metrics

### Setup
Create 20 applications across the volume:
- 12 approved (status: 'approved')
- 5 rejected (status: 'rejected') with reasons: ['age', 'age', 'not_aligned', 'not_aligned', 'other']
- 3 pending (status: 'pending')

### Expected Calculations

**Total Applications:**
```
total = 20 (12 approved + 5 rejected + 3 pending)
Expected: 20
```

**Approved Count:**
```
approved = 12
Expected: 12
```

**Approval Rate:**
```
approvalRate = (approved / total) × 100
            = (12 / 20) × 100
            = 60%
Expected: 60%
```

**Rejection Rate:**
```
rejectionRate = (rejected / total) × 100
             = (5 / 20) × 100
             = 25%
Expected: 25%
```

**Pending Count:**
```
pending = 3
Expected: 3
```

**Rejection Reasons Breakdown:**
```
rejectionReasons = {
  age: 2,           // 40% of rejections
  not_aligned: 2,   // 40% of rejections
  other: 1          // 20% of rejections
}
Expected: { age: 2, not_aligned: 2, other: 1 }
```

### Validation Steps
1. ✅ Query applications table: `SELECT COUNT(*) FROM applications WHERE volume_id = 'vol_001'` → Should return 20
2. ✅ Query approved: `SELECT COUNT(*) FROM applications WHERE volume_id = 'vol_001' AND status = 'approved'` → Should return 12
3. ✅ Verify approval rate: 12/20 = 0.6 = 60%
4. ✅ Verify rejection reasons: Group by reason, count each

### Database Query (from analytics.ts)
```typescript
const applicationsData = await supabase
  .from('applications')
  .select('status, rejection_reason')
  .eq('volume_id', volumeId);

// Calculate: total, approved, rejected, pending, approvalRate, rejectionRate, rejectionReasons
```

---

## Test 1.2: Attendance Metrics

### Setup
From the 12 approved applications, 10 users confirmed attendance and 9 actually checked in:
- 10 confirmed (status: 'confirmed')
- 2 did not confirm (no attendance record)
- 9 checked in (checked_in: true)
- 1 confirmed but didn't check in (checked_in: false)

### Expected Calculations

**Confirmed Count:**
```
confirmed = 10
Expected: 10
```

**Checked-In Count:**
```
checkedIn = 9
Expected: 9
```

**Check-In Rate:**
```
checkInRate = (checkedIn / confirmed) × 100
           = (9 / 10) × 100
           = 90%
Expected: 90%
```

**Attendance Rate (of approved):**
```
attendanceRate = (confirmed / approved) × 100
              = (10 / 12) × 100
              = 83.33%
Expected: ~83%
```

### Validation Steps
1. ✅ Query attendance: `SELECT COUNT(*) FROM attendance WHERE volume_id = 'vol_001' AND status = 'confirmed'` → Should return 10
2. ✅ Query checked in: `SELECT COUNT(*) FROM attendance WHERE volume_id = 'vol_001' AND checked_in = true` → Should return 9
3. ✅ Verify check-in rate: 9/10 = 0.9 = 90%

### Database Query (from analytics.ts)
```typescript
const attendanceData = await supabase
  .from('attendance')
  .select('user_id, checked_in, status')
  .eq('volume_id', volumeId);

// Calculate: confirmed, checkedIn, checkInRate
```

---

## Test 1.3: Spark Picks Metrics

### Setup
9 attendees checked in. Each attendee picks 3 spark picks (kind: 'spark') and 1 conversation starter (kind: 'conversation_starter'). Total: 9 × 4 = 36 picks.

Spark picks distribution:
- User A: picked 4 times
- User B: picked 3 times
- User C: picked 3 times
- User D: picked 2 times
- User E: picked 2 times
- User F: picked 2 times
- User G: picked 2 times
- User H: picked 2 times
- User I: picked 2 times
- User J: picked 2 times
- User K: picked 2 times
- User L: picked 2 times

Conversation starter picks: 9 total (1 per attendee)

### Expected Calculations

**Total Spark Picks:**
```
totalSparkPicks = 27 (3 per 9 attendees)
Expected: 27
```

**Total Conversation Starters:**
```
totalConversationStarters = 9 (1 per 9 attendees)
Expected: 9
```

**Average Sparks per Attendee:**
```
avgSparksPerAttendee = totalSparkPicks / checkedIn
                     = 27 / 9
                     = 3.0
Expected: 3.0
```

**Most-Picked User:**
```
mostPicked = User A with 4 picks
Expected: 4 picks
```

**Spark Picks by Kind:**
```
byKind = {
  spark: 27,
  conversation_starter: 9
}
Expected: { spark: 27, conversation_starter: 9 }
```

### Validation Steps
1. ✅ Query sparks: `SELECT COUNT(*) FROM sparks_picks WHERE volume_id = 'vol_001' AND kind = 'spark'` → Should return 27
2. ✅ Query conversations: `SELECT COUNT(*) FROM sparks_picks WHERE volume_id = 'vol_001' AND kind = 'conversation_starter'` → Should return 9
3. ✅ Verify avg: 27/9 = 3.0
4. ✅ Find max picks: `SELECT picked_user_id, COUNT(*) FROM sparks_picks WHERE volume_id = 'vol_001' GROUP BY picked_user_id ORDER BY COUNT DESC LIMIT 1` → User A with 4

### Database Query (from analytics.ts)
```typescript
const sparkData = await supabase
  .from('sparks_picks')
  .select('kind, picked_user_id')
  .eq('volume_id', volumeId);

// Calculate: total, average, byKind, mostPicked
```

---

## Test 1.4: Mutual Matches Metrics

### Setup
From 9 attendees who checked in and made picks:
- Create mutual intros (user_a ↔ user_b where both picked each other)
- 9 attendees total
- 6 mutual intros formed (12 users involved, assuming some users match with multiple people)

Scenario:
- User A ↔ User B: mutual match ✓
- User C ↔ User D: mutual match ✓
- User E ↔ User F: mutual match ✓
- User G ↔ User H: mutual match ✓
- User I ↔ User A: mutual match ✓ (User A matched twice)
- User B ↔ User C: mutual match ✓ (User B and C matched twice)

Users with matches: A(2), B(2), C(2), D(1), E(1), F(1), G(1), H(1), I(1) = 9 total
Users without matches: None (all 9 matched)

### Expected Calculations

**Total Mutual Matches:**
```
totalMatches = 6
Expected: 6
```

**Match Rate:**
```
matchRate = (totalMatches / totalAttendees) × 100
         = (6 / 9) × 100
         = 66.67%
Expected: ~67%
```

**Users with at Least One Match:**
```
usersMatched = 9 (all attendees have matches)
Expected: 9
```

**Unmatched Users:**
```
unmatched = 0
Expected: 0
```

**Average Matches per User:**
```
avgMatchesPerUser = totalMatches / totalAttendees
                  = 6 / 9
                  = 0.67
Expected: 0.67
```

### Validation Steps
1. ✅ Query intros: `SELECT COUNT(*) FROM intros WHERE volume_id = 'vol_001'` → Should return 6
2. ✅ Count unique users: `SELECT COUNT(DISTINCT CASE WHEN user_a_id IN (SELECT id FROM ...) THEN user_a_id ELSE user_b_id END) FROM intros WHERE volume_id = 'vol_001'` → Should return 9
3. ✅ Verify match rate: 6/9 = 0.667 = 67%
4. ✅ Find unmatched: Attendees not in intros table

### Database Query (from analytics.ts)
```typescript
const introsData = await supabase
  .from('intros')
  .select('user_a_id, user_b_id')
  .eq('volume_id', volumeId);

// Calculate: total, rate, unique users matched
```

---

## Test 1.5: Engagement Metrics

### Setup
9 attendees checked in. Track who viewed profiles before the event:
- User A: viewed profiles 12 times
- User B: viewed profiles 8 times
- User C: viewed profiles 5 times
- User D: viewed profiles 3 times
- User E: viewed profiles 2 times
- User F: viewed profiles 1 time
- User G: viewed profiles 0 times
- User H: viewed profiles 0 times
- User I: viewed profiles 0 times

Total views: 31 across 9 users

### Expected Calculations

**Total Profile Views:**
```
totalViews = 31
Expected: 31
```

**Users Who Viewed (at least 1):**
```
usersWhoViewed = 6
Expected: 6
```

**View Rate:**
```
viewRate = (usersWhoViewed / totalAttendees) × 100
        = (6 / 9) × 100
        = 66.67%
Expected: ~67%
```

**Average Views per User:**
```
avgViewsPerUser = totalViews / totalAttendees
               = 31 / 9
               = 3.44
Expected: 3.44
```

### Validation Steps
1. ✅ Query engagement: `SELECT COUNT(*) FROM user_engagement WHERE volume_id = 'vol_001' AND action = 'profile_view'` → Should return 31
2. ✅ Count unique viewers: `SELECT COUNT(DISTINCT user_id) FROM user_engagement WHERE volume_id = 'vol_001' AND action = 'profile_view'` → Should return 6
3. ✅ Verify view rate: 6/9 = 0.667 = 67%

### Database Query (from analytics.ts)
```typescript
const engagementData = await supabase
  .from('user_engagement')
  .select('user_id, action')
  .eq('volume_id', volumeId)
  .eq('action', 'profile_view');

// Calculate: totalViews, viewRate
```

---

## Test 1.6: Financial Metrics

### Setup
9 attendees who checked in had applied and been approved.
9 successful payments recorded:
- User A: $110
- User B: $110
- User C: $110
- User D: $110
- User E: $110
- User F: $110
- User G: $110
- User H: $110
- User I: $110

Total revenue: $990

### Expected Calculations

**Total Revenue:**
```
totalRevenue = 990
Expected: $990
```

**Revenue per Attendee:**
```
revenuePerAttendee = totalRevenue / checkedIn
                   = 990 / 9
                   = 110
Expected: $110
```

**Successful Payments:**
```
successfulPayments = 9
Expected: 9
```

**Payment Success Rate:**
```
paymentSuccessRate = (successfulPayments / checkedIn) × 100
                   = (9 / 9) × 100
                   = 100%
Expected: 100%
```

### Validation Steps
1. ✅ Query payments: `SELECT SUM(amount) FROM payments WHERE volume_id = 'vol_001' AND status = 'succeeded'` → Should return 990
2. ✅ Count successful: `SELECT COUNT(*) FROM payments WHERE volume_id = 'vol_001' AND status = 'succeeded'` → Should return 9
3. ✅ Verify per-attendee: 990/9 = 110
4. ✅ Verify success rate: 9/9 = 100%

### Database Query (from analytics.ts)
```typescript
const paymentsData = await supabase
  .from('payments')
  .select('amount, status')
  .eq('volume_id', volumeId)
  .eq('status', 'succeeded');

// Calculate: totalRevenue, paymentSuccessRate
```

---

## Test 1.7: Summary Output for Single Event

**Expected `/admin/volumes/vol_001` Page Output:**

```
HEADER
Title: "Summer Launch"
Date: June 15, 2026
Status: active

METRIC CARDS
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Approval Rate    │ Check-in Rate    │ Match Rate       │ Total Revenue    │
│ 60%              │ 90%              │ 67%              │ $990             │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

APPLICATIONS SECTION
├─ Total: 20
├─ Approved: 12 (60%)
├─ Rejected: 5 (25%)
│  ├─ Age: 2
│  ├─ Not Aligned: 2
│  └─ Other: 1
└─ Pending: 3

ATTENDANCE SECTION
├─ Confirmed: 10 (83%)
├─ Checked In: 9 (90% of confirmed)
└─ Did Not Show: 1

SPARK PICKS SECTION
├─ Total Picks: 36
├─ Spark Picks: 27
├─ Conversation Starters: 9
└─ Most Picked User: User A (4 times)

MUTUAL MATCHES SECTION
├─ Total Matches: 6
├─ Match Rate: 67%
├─ Users Matched: 9 (100%)
└─ Average Matches per User: 0.67

ENGAGEMENT SECTION
├─ Total Profile Views: 31
├─ Users Who Viewed: 6 (67%)
└─ Average Views per User: 3.44

FINANCIAL SECTION
├─ Total Revenue: $990
├─ Revenue per Attendee: $110
├─ Successful Payments: 9
└─ Payment Success Rate: 100%
```

---

## Part 2: Historical Comparison & Trends (Phase 4B)

### Test Scenario: Three Events with Trend Analysis

**Event 1 (Deuce #1): Early Launch**
- Date: 2026-05-01
- Approval Rate: 55%
- Check-in Rate: 85%
- Match Rate: 60%
- Revenue: $800

**Event 2 (Deuce #2): Growing Momentum**
- Date: 2026-06-01
- Approval Rate: 60% (↑ +5% vs Event 1)
- Check-in Rate: 90% (↑ +5% vs Event 1)
- Match Rate: 67% (↑ +7% vs Event 1)
- Revenue: $990 (↑ +23.75% vs Event 1)

**Event 3 (Deuce #3): Peak Performance**
- Date: 2026-07-01
- Approval Rate: 65% (↑ +5% vs Event 2)
- Check-in Rate: 92% (↑ +2% vs Event 2)
- Match Rate: 70% (↑ +3% vs Event 2)
- Revenue: $1,210 (↑ +22% vs Event 2)

---

## Test 2.1: Trend Calculation Formula

### Trend Indicator Calculation
```typescript
function calculateTrend(current: number, previous: number): TrendIndicator {
  if (previous === 0) return { value: 0, direction: 'neutral' };
  
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  
  if (rounded > 2) direction = 'up';
  else if (rounded < -2) direction = 'down';
  else direction = 'neutral';
  
  return { value: rounded, direction };
}
```

### Test Cases

**Event 2 vs Event 1:**

```
Approval Rate Trend:
  change = ((60 - 55) / 55) × 100 = 9.09%
  rounded = 9%
  direction = 'up' (> 2%)
  Expected: { value: 9, direction: 'up' }

Check-in Rate Trend:
  change = ((90 - 85) / 85) × 100 = 5.88%
  rounded = 6%
  direction = 'up' (> 2%)
  Expected: { value: 6, direction: 'up' }

Match Rate Trend:
  change = ((67 - 60) / 60) × 100 = 11.67%
  rounded = 12%
  direction = 'up' (> 2%)
  Expected: { value: 12, direction: 'up' }

Revenue Trend:
  change = ((990 - 800) / 800) × 100 = 23.75%
  rounded = 24%
  direction = 'up' (> 2%)
  Expected: { value: 24, direction: 'up' }
```

**Event 3 vs Event 2:**

```
Approval Rate Trend:
  change = ((65 - 60) / 60) × 100 = 8.33%
  rounded = 8%
  direction = 'up'
  Expected: { value: 8, direction: 'up' }

Check-in Rate Trend:
  change = ((92 - 90) / 90) × 100 = 2.22%
  rounded = 2%
  direction = 'neutral' (not > 2%)
  Expected: { value: 2, direction: 'neutral' }

Match Rate Trend:
  change = ((70 - 67) / 67) × 100 = 4.48%
  rounded = 4%
  direction = 'up'
  Expected: { value: 4, direction: 'up' }

Revenue Trend:
  change = ((1210 - 990) / 990) × 100 = 22.22%
  rounded = 22%
  direction = 'up'
  Expected: { value: 22, direction: 'up' }
```

### Validation Steps
1. ✅ Verify trend calculation formula matches above
2. ✅ Test with positive changes (should show 'up')
3. ✅ Test with negative changes (should show 'down')
4. ✅ Test with small changes like ±2% (should show 'neutral')
5. ✅ Test with zero previous value (should show 'neutral')

---

## Test 2.2: Historical Summary Calculations

### Aggregate Metrics (All 3 Events)

**Total Events:**
```
eventsTotal = 3
Expected: 3
```

**Average Approval Rate:**
```
averageApprovalRate = (55 + 60 + 65) / 3
                    = 180 / 3
                    = 60%
Expected: 60%
```

**Average Check-in Rate:**
```
averageCheckInRate = (85 + 90 + 92) / 3
                   = 267 / 3
                   = 89%
Expected: 89%
```

**Average Match Rate:**
```
averageMatchRate = (60 + 67 + 70) / 3
                = 197 / 3
                = 65.67%
Expected: ~66%
```

**Total Revenue (Cumulative):**
```
totalRevenue = 800 + 990 + 1210
             = 3000
Expected: $3,000
```

**Total Applications (Cumulative):**
```
totalApplications = 20 (Event 1) + 20 (Event 2) + 18 (Event 3)
                  = 58
Expected: 58
```

**Total Matches (Cumulative):**
```
totalMatches = 6 (Event 1) + 6 (Event 2) + 6 (Event 3)
             = 18
Expected: 18
```

**Date Range:**
```
earliest = 2026-05-01 (Event 1)
latest = 2026-07-01 (Event 3)
Expected: May 1, 2026 to July 1, 2026
```

### Trend Direction Calculation

Compare recent 3 events vs earlier 3 events. With only 3 events total:
```
Recent 3 = [Event 1, Event 2, Event 3] average
Earlier 3 = [Event 1, Event 2, Event 3] average (same, since only 3 events)

In real scenario with 6+ events:
Recent 3 = Events 4, 5, 6
Earlier 3 = Events 1, 2, 3

Compare averages:
trendDirection = 'improving' if recentAvg > earlierAvg
               = 'declining' if recentAvg < earlierAvg
               = 'stable' if approximately equal
```

**For this test (3 events):**
```
All metrics trending up across all 3 events
Expected trendDirection: 'improving'
```

### Validation Steps
1. ✅ Calculate average approval rate: (55+60+65)/3 = 60%
2. ✅ Calculate average check-in rate: (85+90+92)/3 = 89%
3. ✅ Calculate average match rate: (60+67+70)/3 = 66%
4. ✅ Sum all revenues: 800+990+1210 = 3000
5. ✅ Verify date range spans events correctly
6. ✅ Verify trend direction shows 'improving' (all metrics increasing)

---

## Test 2.3: Comparison Page Output

**Expected `/admin/compare` Page Output:**

```
HEADER
Title: "Event Comparison & Trends"
Subtitle: "Historical view of all 3 events"

SUMMARY CARDS
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Events     │ Avg Approval Rate│ Avg Check-in Rate│ Total Revenue    │
│ 3                │ 60%              │ 89%              │ $3,000           │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

OVERALL TREND
↑ Improving

ALL EVENTS (newest first)
───────────────────────────────────────────────────────────────────────────

DEUCE #3: Peak Performance
📅 July 1, 2026 | Status: active

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Approval Rate│ Check-in Rate│ Match Rate   │ Total Rev    │ Applications │ Matches      │
│ 65% ↑ +8%    │ 92% → +2%    │ 70% ↑ +4%    │ $1,210 ↑ +22%│ 18           │ 6            │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
[View Details →]

───────────────────────────────────────────────────────────────────────────

DEUCE #2: Growing Momentum
📅 June 1, 2026 | Status: active

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Approval Rate│ Check-in Rate│ Match Rate   │ Total Rev    │ Applications │ Matches      │
│ 60% ↑ +9%    │ 90% ↑ +6%    │ 67% ↑ +12%   │ $990 ↑ +24%  │ 20           │ 6            │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
[View Details →]

───────────────────────────────────────────────────────────────────────────

DEUCE #1: Early Launch
📅 May 1, 2026 | Status: completed

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Approval Rate│ Check-in Rate│ Match Rate   │ Total Rev    │ Applications │ Matches      │
│ 55%          │ 85%          │ 60%          │ $800         │ 20           │ 6            │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
[View Details →]
```

---

## Test 2.4: Trend Direction Edge Cases

### Edge Case 1: Declining Trend
```
Event 1: 60% approval, $1000 revenue
Event 2: 55% approval, $900 revenue
Event 3: 50% approval, $800 revenue

Expected trendDirection: 'declining'
Visual: ↓ Declining
```

### Edge Case 2: Stable Trend
```
Event 1: 60% approval, $1000 revenue
Event 2: 59% approval, $1010 revenue
Event 3: 60% approval, $1000 revenue

Expected trendDirection: 'stable'
Visual: → Stable
```

### Edge Case 3: Mixed Metrics
```
Event 1: 60% approval, 80% check-in
Event 2: 65% approval, 75% check-in
Event 3: 70% approval, 80% check-in

Approval: improving (60→65→70)
Check-in: mixed (80→75→80)
Overall: Still 'improving' because majority of metrics improving
```

### Validation
1. ✅ Verify declining trend detects when metrics drop
2. ✅ Verify stable trend with flat metrics
3. ✅ Verify mixed scenarios choose correct overall direction

---

## Part 3: Admin Authorization Testing

## Test 3.1: Non-Admin Access Control

### Setup
Create two users:
- User A: `is_admin = false`
- User B: `is_admin = true` (in admin_roles table)

### Test Case 1: Non-Admin Visits Analytics Page
```
Action: Non-admin user navigates to /admin/volumes
Expected: Error page displayed
Error Message: "Unauthorized: Admin access required"
```

### Test Case 2: Admin Visits Analytics Page
```
Action: Admin user navigates to /admin/volumes
Expected: Volumes list loads successfully
Status: 200 OK
```

### Test Case 3: Non-Admin Calls Server Action
```
Action: Non-admin calls getVolumeAnalytics(volumeId)
Expected: Server action throws error
Error: "Admin access required"
Database: No data returned
```

### Validation Steps
1. ✅ Verify `getCurrentUser()` returns correct admin status
2. ✅ Verify server actions check `isAdmin` before proceeding
3. ✅ Verify error message returned to UI on unauthorized access
4. ✅ Verify no data leakage on failed auth

### Code Check (from analytics.ts)
```typescript
const user = await getCurrentUser();
if (!user.isAdmin) {
  throw new Error('Admin access required');
}
```

---

## Part 4: UI Responsiveness Testing

## Test 4.1: Volumes List Page (`/admin/volumes`)

### Desktop (1280px)
```
✅ Volumes list displays
✅ "View Analytics" buttons visible
✅ "📊 View Trends" button visible in header
✅ Status badges display correctly (active/completed)
✅ Font sizes: titles 18px, labels 14px, status 11px
✅ Spacing: 20px card padding, 16px gaps
```

### Tablet (768px)
```
✅ List still readable
✅ Buttons still clickable (min 44px height)
✅ Font scaling via clamp() works
✅ No horizontal scroll needed
```

### Mobile (375px)
```
✅ Cards stack vertically
✅ Buttons full-width or stacked
✅ Font sizes readable (no smaller than 14px)
✅ Touch targets >= 44px
```

### Validation Steps
1. ✅ Resize browser to desktop/tablet/mobile
2. ✅ Verify layout adapts correctly
3. ✅ Verify text doesn't overflow
4. ✅ Verify buttons remain clickable

---

## Test 4.2: Comparison Page (`/admin/compare`)

### Desktop (1280px)
```
✅ Summary cards display in 4-column grid
✅ Event cards display with 6 metrics per row
✅ Trend indicators visible and colored correctly
✅ "View Details" links visible on right side
✅ Overall trend indicator centered and prominent
✅ Timeline flows top-to-bottom
```

### Tablet (768px)
```
✅ Summary cards adapt to 2-3 columns
✅ Event metrics display as 3 per row (instead of 6)
✅ Layout remains readable
✅ All content accessible without horizontal scroll
```

### Mobile (375px)
```
✅ Summary cards stack vertically (1 per row)
✅ Event metrics display as 2 per row or less
✅ Trend indicators still visible
✅ "View Details" links positioned correctly
✅ Overall trend indicator full-width
```

### Validation Steps
1. ✅ Test at multiple viewport widths
2. ✅ Verify CSS Grid auto-fit working
3. ✅ Check minmax constraints
4. ✅ Verify clamp() font scaling

---

## Test 4.3: Single Event Page (`/admin/volumes/[volumeId]`)

### Layout Sections
```
✅ Header (title, date, status) displays
✅ 4 metric cards display in responsive grid
✅ 8 detail sections display with proper spacing
✅ Each section has clear label and data
✅ No overlapping elements
✅ Consistent color scheme and typography
```

### Loading State
```
✅ Suspense fallback shows "Loading volumes..."
✅ Fallback appears briefly before data loads
✅ No layout shift when data loads
```

### Error State
```
✅ If volume not found, error message displays
✅ Error has clear red background (#FF6B6B)
✅ Error message explains what went wrong
✅ Back link available to return to volumes list
```

---

## Part 5: Data Integrity Testing

## Test 5.1: Null/Missing Data Handling

### Scenario 1: No Applications
```
Volume with 0 applications
Expected outputs:
- Total: 0
- Approval Rate: 0% (or "N/A")
- No division by zero error
Status: ✅
```

### Scenario 2: No Attendance
```
Volume with applications but no attendance data
Expected outputs:
- Check-in Rate: 0%
- Confirmed: 0
- No division by zero error
Status: ✅
```

### Scenario 3: No Matches
```
Volume with attendance but no mutual matches
Expected outputs:
- Match Rate: 0%
- Total Matches: 0
- Unmatched Users: total attendees
Status: ✅
```

### Scenario 4: Missing Financial Data
```
Volume with no payment records
Expected outputs:
- Total Revenue: $0
- Revenue per Attendee: $0
- No errors from sum() on null
Status: ✅
```

### Validation Steps
1. ✅ Create test volume with each edge case
2. ✅ Verify metrics display safely
3. ✅ Verify no TypeScript errors
4. ✅ Verify UI displays "0" or "—" appropriately

---

## Test 5.2: Data Type Consistency

### Expected Type Validations
```typescript
// Numbers should be numbers, not strings
approval_rate: 60 (not "60")

// Dates should be ISO 8601
doors_date: "2026-06-15T00:00:00Z"

// Currency should be numeric cents
amount: 11000 (not "110.00", stored as cents)

// Percentages 0-100
approval_rate: 60 (0 ≤ value ≤ 100)

// Boolean flags
checked_in: true | false
is_admin: true | false
```

### Validation Steps
1. ✅ Check TypeScript interfaces match data types
2. ✅ Verify Supabase column types match queries
3. ✅ Test formatting on display (currency, percentage, date)

---

## Test 5.3: Calculation Precision

### Rounding Rules
```typescript
Percentages: Round to nearest integer (60.5% → 61%)
Averages: Round to 2 decimal places (3.44, not 3.44444)
Currency: Display in dollars ($1,210, not $1210.00)
Trends: Round to nearest integer percent (9.09% → 9%)
```

### Validation Steps
1. ✅ Test with values that have .5 decimal
2. ✅ Verify consistent rounding across all metrics
3. ✅ Test large numbers (revenue > $10,000)
4. ✅ Test very small percentages (0.1% → 0%)

---

## Part 6: Performance Testing

## Test 6.1: Page Load Time

### Expected Performance
```
/admin/volumes: < 1.5s first paint (with Suspense)
/admin/compare: < 2.0s first paint (fetches 2 server actions in parallel)
/admin/volumes/[id]: < 1.5s first paint

Metrics measured:
- Time to First Byte (TTFB): < 100ms
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2s
```

### Validation Steps
1. ✅ Open DevTools → Performance tab
2. ✅ Measure load time with network throttling (fast 3G)
3. ✅ Verify Suspense fallback displays quickly
4. ✅ Verify data loads and page updates
5. ✅ Check for layout shifts during load

### Database Query Optimization
```typescript
// Verify queries are efficient:
// ✅ Single table queries (not N+1)
// ✅ Indexed columns (volume_id, status, etc.)
// ✅ Aggregations done in database, not application
// ✅ No fetching unused columns
```

---

## Test 6.2: Bundle Size Check

### Expected Asset Sizes
```
Page CSS: < 50KB (Vercel builds with inline CSS)
Page JS: < 500KB (Next.js optimized)
Total FCP: < 100KB (critical path)
```

### Validation Steps
1. ✅ Run `npm run build` and check output sizes
2. ✅ Verify no unused dependencies
3. ✅ Check that Chart.js/D3 NOT included (we use simple HTML/CSS)

---

## Part 7: Browser Compatibility Testing

## Test 7.1: Core Functionality

### Browsers to Test
```
✅ Chrome 90+
✅ Safari 14+
✅ Firefox 88+
✅ Edge 90+
```

### Features to Verify
```
✅ CSS Grid (auto-fit, minmax)
✅ Flexbox layouts
✅ CSS custom properties (--serif, --teal, etc.)
✅ Responsive design (clamp(), viewport units)
✅ Server components (Next.js 13+)
✅ Suspense boundaries
```

### Known Limitations
```
IE 11: Not supported (uses CSS Grid)
Mobile Safari < 14: Not tested
```

---

## Part 8: Accessibility Testing

## Test 8.1: Keyboard Navigation

```
✅ Tab through all clickable elements
✅ Enter/Space activates buttons
✅ Links are focusable
✅ Focus visible (outline or highlight)
✅ Tab order is logical (top to bottom, left to right)
```

## Test 8.2: Screen Reader (VoiceOver/NVDA)

```
✅ Page title announced
✅ Headings properly labeled (h1, h2, h3)
✅ Links have meaningful text ("View Analytics", not "Click Here")
✅ Data tables have headers
✅ Form labels associated with inputs
✅ Status badges announced (e.g., "Status: active")
```

## Test 8.3: Color Contrast

```
✅ Text on background: 4.5:1 minimum (WCAG AA)
✅ Trend indicators not only color (include text/icons)
✅ Status badges readable: "active" (#D4F748) vs "completed" (#E8E8E8)
```

---

## Execution Checklist

### Pre-Testing
- [ ] Fresh Vercel deployment successful
- [ ] Database seeded with test data (3 volumes, multiple events)
- [ ] All server actions updated (Phase 4C & 4B)
- [ ] All pages updated (`/admin/volumes`, `/admin/volumes/[id]`, `/admin/compare`)
- [ ] Suspense boundaries in place
- [ ] Error handling for missing volumes
- [ ] Admin authorization working

### Functional Testing
- [ ] Test 1.1: Application metrics (approval, rejection, pending)
- [ ] Test 1.2: Attendance metrics (confirmed, check-in, rate)
- [ ] Test 1.3: Spark picks metrics (total, by kind, most picked)
- [ ] Test 1.4: Mutual matches metrics (total, rate, users matched)
- [ ] Test 1.5: Engagement metrics (views, view rate)
- [ ] Test 1.6: Financial metrics (revenue, success rate)
- [ ] Test 2.1: Trend calculations (direction, percentage)
- [ ] Test 2.2: Historical summary (aggregates, trend direction)
- [ ] Test 2.3: Comparison page rendering
- [ ] Test 3.1: Admin authorization (non-admin blocks, admin allows)

### UI/UX Testing
- [ ] Test 4.1: Volumes list responsive design
- [ ] Test 4.2: Comparison page responsive design
- [ ] Test 4.3: Single event page layouts
- [ ] Test 4.3: Loading states display correctly
- [ ] Test 4.3: Error states display correctly

### Data Integrity
- [ ] Test 5.1: Null/missing data handled safely
- [ ] Test 5.2: Data types consistent with interfaces
- [ ] Test 5.3: Calculations precise (rounding, currency format)

### Performance
- [ ] Test 6.1: Page load times < thresholds
- [ ] Test 6.2: Bundle sizes acceptable

### Browser/Accessibility
- [ ] Test 7.1: Works in Chrome, Safari, Firefox, Edge
- [ ] Test 8.1: Keyboard navigation works
- [ ] Test 8.2: Screen reader announces content
- [ ] Test 8.3: Color contrast meets WCAG AA

---

## Test Data Summary

For testing purposes, here's the minimal test data needed:

### Volumes
```sql
-- Volume 1
INSERT INTO volumes (id, name, number, doors_date, status, capacity)
VALUES ('vol_001', 'Summer Launch', 1, '2026-06-15', 'active', 30);

-- Volume 2
INSERT INTO volumes (id, name, number, doors_date, status, capacity)
VALUES ('vol_002', 'Growing Momentum', 2, '2026-07-01', 'active', 30);

-- Volume 3
INSERT INTO volumes (id, name, number, doors_date, status, capacity)
VALUES ('vol_003', 'Peak Performance', 3, '2026-08-01', 'completed', 30);
```

### Applications, Attendance, Spark Picks, Intros, Payments
Create as documented in Test Scenarios above. Each table needs appropriate foreign keys and timestamps.

---

## Sign-Off Criteria

All tests pass when:
- ✅ All 8 test sections executed with expected outputs
- ✅ No TypeScript errors or warnings
- ✅ No runtime errors in browser console
- ✅ All pages load within performance thresholds
- ✅ Admin authorization enforced correctly
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Accessibility features work (keyboard, screen reader)
- ✅ No data integrity issues (null handling, rounding, formats)
- ✅ Trends calculate accurately
- ✅ Page layouts match design specifications
