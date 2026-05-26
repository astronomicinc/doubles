# Phase 2 Complete Implementation Plan

**Status**: Plan Only (Ready for Review & Approval)  
**Scope**: Migrate 19 remaining dynamic pages to Next.js  
**Estimated Total Effort**: 18-24 hours  
**Approach**: Token replacement + Supabase queries, pixel-perfect rendering

---

## Overview

All 19 remaining dynamic pages will use the same proven pattern:
1. Extract page-specific `<style>` tags from HTML
2. Read HTML file from `public/`
3. Replace `{{tokens}}` with dynamic data from Supabase
4. Render via `dangerouslySetInnerHTML`
5. Preserve exact pixel-perfect layout

---

## Page Migration Map

### TIER 1: Core Platform Pages (High Priority)
These pages are essential for the platform to function.

#### 1. **Events** (`/events`)
- **Current File**: `public/events.html`
- **New Route**: `app/events/page.tsx` + `app/events/layout.tsx`
- **Dynamic Data**:
  - `{{volume_list}}` — Loop of all volumes (name, date, location, seats remaining)
- **Supabase Queries**:
  - `listVolumes()` — SELECT * FROM volumes ORDER BY doors_date DESC
  - `getVolumeSeats(volumeId)` for each volume
- **Complexity**: 🟡 Medium (list rendering, loop template)
- **Dependencies**: None
- **Effort**: 1.5-2 hours
- **Test Strategy**: 
  - Verify all volumes render
  - Verify seat counts update when applications change
  - Compare layout to static HTML

#### 2. **Apply** (`/apply`)
- **Current File**: `public/apply.html`
- **New Route**: `app/apply/page.tsx` + `app/apply/layout.tsx`
- **Dynamic Data**:
  - `{{volume_name}}` — Current volume name
  - `{{volume_date}}` — Formatted event date
  - `{{volume_neighborhood}}` — Venue location
- **Supabase Queries**:
  - `getVolumeDetails(volumeId)` — Get name, date, location
- **Form Handling**:
  - Change `<form>` action from `apply.html` → `/api/apply`
  - Server action will: validate → create Stripe payment intent → insert to DB → send email
- **Complexity**: 🔴 High (Stripe integration, form submission, DB write)
- **Dependencies**: None (but requires `/api/apply` route in Phase 3)
- **Effort**: 2-3 hours
- **Test Strategy**:
  - Verify volume data displays correctly
  - Test form submission (will error until Phase 3 API is ready)
  - Verify Stripe Elements mount correctly

#### 3. **Events List (Admin)** (`/admin/volumes`)
- **Current File**: `public/admin-volumes.html`
- **New Route**: `app/admin/volumes/page.tsx`
- **Dynamic Data**:
  - `{{volumes_list}}` — Table of all volumes (id, name, date, capacity, status)
  - `{{volume_actions}}` — Edit/delete buttons per volume
- **Supabase Queries**:
  - `listAllVolumes()` — SELECT * FROM volumes (admin view, no filtering)
  - `deleteVolume(volumeId)` — Server action
  - `updateVolumeStatus(volumeId, status)` — Server action
- **Complexity**: 🟡 Medium (list rendering, admin actions)
- **Dependencies**: Admin auth check (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify all volumes display
  - Test edit/delete buttons (will error until Phase 3 routes exist)

---

### TIER 2: Auth-Gated Member Pages
These require user authentication and personalized data.

#### 4. **Status** (`/status`)
- **Current File**: `public/status.html`
- **New Route**: `app/status/page.tsx`
- **Dynamic Data**:
  - `{{application_status}}` — "pending" | "accepted" | "rejected"
  - `{{application_date}}` — When they applied
  - `{{volume_name}}` — Their event name
  - `{{pair_info}}` — Name of their paired friend (if accepted)
- **Supabase Queries**:
  - `getUserApplication(userId)` — Get user's most recent application
  - `getApplicationStatus(applicationId)` — Get detailed status
- **Auth Required**: Yes (magic link or session)
- **Complexity**: 🟡 Medium (conditional rendering, user lookup)
- **Dependencies**: Auth system (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Test as authenticated user
  - Verify each status (pending/accepted/rejected) shows correct content
  - Verify pair info displays

#### 5. **Accepted** (`/accepted`)
- **Current File**: `public/accepted.html`
- **New Route**: `app/accepted/page.tsx`
- **Dynamic Data**:
  - `{{event_date}}` — Formatted date
  - `{{event_time}}` — Time range
  - `{{venue_name}}` — Location name
  - `{{venue_address}}` — Full address
  - `{{pair_name}}` — Name of matched friend
  - `{{pair_intro}}` — Bio/intro of pair
  - `{{dress_code}}` — From volume settings
  - `{{what_to_bring}}` — From volume settings
- **Supabase Queries**:
  - `getAcceptedApplication(userId)` — Get their accepted app
  - `getVolumeDetails(volumeId)` — Event details
  - `getUserProfile(pairUserId)` — Pair's profile info
- **Auth Required**: Yes
- **Complexity**: 🟡 Medium (multiple lookups, user data)
- **Dependencies**: User profile system (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Test as accepted applicant
  - Verify all event details display
  - Verify pair info displays correctly

#### 6. **Confirmation** (`/confirmation`)
- **Current File**: `public/confirmation.html`
- **New Route**: `app/confirmation/page.tsx`
- **Dynamic Data**:
  - `{{event_date}}` — Event date
  - `{{hours_until_reveal}}` — Dynamic countdown
  - `{{show_pair_info}}` — Boolean (T-48h reveal)
  - `{{pair_name}}` (conditional) — Show only if T-48h passed
  - `{{pair_bio}}` (conditional)
- **Supabase Queries**:
  - `getAcceptedApplication(userId)` — Get their app
  - `getVolumeDetails(volumeId)` — Get doors_date
  - `isRevealTimeReached(doorsDate)` — Check if T-48h passed
- **Auth Required**: Yes
- **Complexity**: 🟡 Medium (time-based conditional, dynamic countdown)
- **Dependencies**: Server time logic (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify countdown displays
  - Test reveal toggle at T-48h
  - Verify pair info hidden/shown correctly

#### 7. **Manage Seat** (`/manage-seat`)
- **Current File**: `public/manage-seat.html`
- **New Route**: `app/manage-seat/page.tsx`
- **Dynamic Data**:
  - `{{user_name}}` — Their name
  - `{{event_date}}` — Event date
  - `{{current_plus_one}}` — Name of current plus-one (if set)
  - `{{can_change}}` — Boolean (if event is before T-5days)
- **Supabase Queries**:
  - `getUserApplication(userId)` — Get their app
  - `getApplicationPlusOne(applicationId)` — Who they brought
  - `getVolumeDetails(volumeId)` — Event date
  - `canChangePlusOne(eventDate)` — Check if still time
- **Form Handling**:
  - POST `/api/manage-seat` — Update plus-one
- **Auth Required**: Yes
- **Complexity**: 🟡 Medium (time-based logic, conditional form)
- **Dependencies**: Form API (Phase 3)
- **Effort**: 1-1.5 hours
- **Test Strategy**:
  - Verify current plus-one displays
  - Test form submission
  - Verify cutoff logic works

#### 8. **Friend Invite** (`/friend-invite`)
- **Current File**: `public/friend-invite.html`
- **New Route**: `app/friend-invite/[token]/page.tsx`
- **Dynamic Data**:
  - `{{inviter_name}}` — Person who invited them
  - `{{inviter_role}}` — "founder" | "investor" | etc
  - `{{event_date}}` — Event they're invited to
  - `{{event_location}}` — Venue
  - `{{invitation_expires}}` — When invitation expires
  - `{{token}}` — In URL for claiming
- **Supabase Queries**:
  - `getInvitationByToken(token)` — Get invite details
  - `getUserProfile(inviterId)` — Get inviter's info
  - `getVolumeDetails(volumeId)` — Get event details
  - `isTokenValid(token)` — Check expiry
- **Form Handling**:
  - POST `/api/claim-invitation` — Accept invite, create account
- **Auth Required**: No (public link)
- **Complexity**: 🔴 High (token validation, dynamic routing, new account creation)
- **Dependencies**: Token validation system (Phase 3)
- **Effort**: 2-3 hours
- **Test Strategy**:
  - Test with valid token
  - Test with expired token
  - Test form submission
  - Verify account creation flow

#### 9. **Application Submitted** (`/application-submitted`)
- **Current File**: `public/application-submitted.html`
- **New Route**: `app/application-submitted/page.tsx`
- **Dynamic Data**:
  - `{{submitted_time}}` — When they submitted
  - `{{review_timeline}}` — "48 hours"
  - `{{volume_name}}` — Event name
- **Supabase Queries**:
  - `getUserLatestApplication(userId)` — Get their submission
  - `getVolumeDetails(volumeId)`
- **Auth Required**: Yes
- **Complexity**: 🟢 Low (simple data display)
- **Dependencies**: None
- **Effort**: 0.5-1 hour
- **Test Strategy**:
  - Verify submitted timestamp displays
  - Verify event name displays

---

### TIER 3: Post-Event Pages
Pages shown after the event, require post-event data computation.

#### 10. **Post-Event: Sparks** (`/post-event/sparks`)
- **Current File**: `public/post-event-sparks.html`
- **New Route**: `app/post-event/sparks/page.tsx`
- **Dynamic Data**:
  - `{{sparks_list}}` — People they "sparked" with
  - `{{spark_count}}` — Number of sparks
  - `{{spark_actions}}` — Toggle buttons per person
- **Supabase Queries**:
  - `getUserSparks(userId, volumeId)` — Get people they marked as interested
  - `getMutualSparks(userId, volumeId)` — Mutual interests
- **Form Handling**:
  - POST `/api/update-spark` — Toggle spark on/off
- **Auth Required**: Yes
- **Complexity**: 🟡 Medium (list rendering, toggle actions)
- **Dependencies**: Spark data model (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify sparks list loads
  - Test toggle buttons
  - Verify mutual sparks highlight

#### 11. **Post-Event: Match** (`/post-event/match`)
- **Current File**: `public/post-event-match.html`
- **New Route**: `app/post-event/match/page.tsx`
- **Dynamic Data**:
  - `{{matches_list}}` — Mutual sparks (they sparked, other person sparked back)
  - `{{match_count}}` — Number of matches
  - `{{match_contact}}` — Contact info for each match
- **Supabase Queries**:
  - `getMutualSparks(userId, volumeId)` — Get mutual matches
  - `getUserContactInfo(userId)` for each match
- **Auth Required**: Yes
- **Complexity**: 🟡 Medium (list rendering, filtered data)
- **Dependencies**: Spark data model (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify mutual matches display
  - Verify contact info shows
  - Test filtering logic

#### 12. **Post-Event: No Mutuals** (`/post-event/no-mutuals`)
- **Current File**: `public/post-event-no-mutuals.html`
- **New Route**: `app/post-event/no-mutuals/page.tsx`
- **Dynamic Data**:
  - `{{next_event_date}}` — Date of next event
  - `{{encouragement_message}}` — Personalized message
- **Supabase Queries**:
  - `getNextVolume()` — Get upcoming event
  - `getPostEventSurveyAnswers(userId)` — For personalization
- **Auth Required**: Yes
- **Complexity**: 🟢 Low (simple messaging)
- **Dependencies**: None
- **Effort**: 0.5-1 hour
- **Test Strategy**:
  - Verify next event displays
  - Verify message personalizes

#### 13. **Recap** (`/recap/vol-01`)
- **Current File**: `public/recap-vol-01.html`
- **New Route**: `app/recap/[volumeId]/page.tsx`
- **Dynamic Data**:
  - `{{event_summary}}` — Event highlights
  - `{{attendee_count}}` — How many came
  - `{{photos}}` — Photo gallery from event
  - `{{testimonials}}` — User testimonials
  - `{{stats}}` — Matches made, etc
- **Supabase Queries**:
  - `getVolumeRecap(volumeId)` — Get all recap data
  - `getVolumePhotos(volumeId)` — Photo gallery
  - `getVolumeTestimonials(volumeId)` — User quotes
- **Auth Required**: No (public page)
- **Complexity**: 🟡 Medium (many data points, gallery rendering)
- **Dependencies**: Photo/testimonial system (Phase 3)
- **Effort**: 2-2.5 hours
- **Test Strategy**:
  - Verify all recap data displays
  - Test photo gallery
  - Verify testimonials render

---

### TIER 4: Operations Pages
Pages used by admins/operators during events.

#### 14. **Dispatch** (`/dispatch`)
- **Current File**: `public/dispatch.html`
- **New Route**: `app/dispatch/page.tsx`
- **Dynamic Data**:
  - `{{issues_list}}` — List of reported issues
  - `{{issue_status}}` — "open" | "resolved"
  - `{{issue_actions}}` — Mark resolved buttons
- **Supabase Queries**:
  - `listDispatchIssues(volumeId)` — Get all reported issues
  - `updateIssueStatus(issueId, status)` — Server action
- **Form Handling**:
  - POST `/api/report-issue` — Report new issue
- **Auth Required**: Yes (admin only)
- **Complexity**: 🟡 Medium (list rendering, admin actions)
- **Dependencies**: Admin auth (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify issues load
  - Test status updates
  - Test report form

#### 15. **Door Checkin** (`/door-checkin`)
- **Current File**: `public/door-checkin.html`
- **New Route**: `app/door-checkin/page.tsx`
- **Dynamic Data**:
  - `{{checkin_count}}` — How many checked in
  - `{{checkin_list}}` — Names of who's arrived
  - `{{pending_list}}` — Who hasn't arrived yet
  - `{{search_box}}` — Search/lookup by name
- **Supabase Queries**:
  - `getVolumeAttendees(volumeId)` — All registered
  - `getVolumeCheckins(volumeId)` — Who's checked in
  - `searchAttendee(volumeId, name)` — Real-time search
- **Form Handling**:
  - POST `/api/checkin` — Mark person as arrived
- **Auth Required**: Yes (door staff only)
- **Complexity**: 🟡 Medium (list filtering, real-time search)
- **Dependencies**: Checkin data model (Phase 3)
- **Effort**: 2-2.5 hours
- **Test Strategy**:
  - Verify attendee list loads
  - Test search functionality
  - Test checkin submission

---

### TIER 5: Admin Dashboard Pages
Full admin interface for event management.

#### 16. **Admin: Dashboard** (`/admin`)
- **Current File**: `public/admin-dashboard.html`
- **New Route**: `app/admin/page.tsx`
- **Dynamic Data**:
  - `{{events_summary}}` — Upcoming events list
  - `{{applications_pending}}` — Count + list
  - `{{today_checkins}}` — Event happening today stats
  - `{{quick_actions}}` — Links to key pages
- **Supabase Queries**:
  - `getAdminDashboardData()` — All dashboard stats
  - `listUpcomingVolumes()`
  - `countPendingApplications()`
  - `getTodaysEvent()`
- **Auth Required**: Yes (admin only)
- **Complexity**: 🟡 Medium (multiple data sources)
- **Dependencies**: None
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify all stats load
  - Verify links navigate correctly
  - Verify data updates

#### 17. **Admin: Inbox** (`/admin/inbox`)
- **Current File**: `public/admin-inbox.html`
- **New Route**: `app/admin/inbox/page.tsx`
- **Dynamic Data**:
  - `{{applications_list}}` — Pending applications with score
  - `{{applicant_info}}` — Name, age, role, intro
  - `{{approve_button}}` — Approve with fee capture
  - `{{reject_button}}` — Reject with message
- **Supabase Queries**:
  - `listPendingApplications()` — Get all pending
  - `getApplicationDetails(appId)` — Full details
  - `approveApplication(appId)` — Server action (triggers Stripe)
  - `rejectApplication(appId, reason)` — Server action
- **Complexity**: 🔴 High (Stripe capture, complex workflow)
- **Dependencies**: Stripe integration (Phase 3)
- **Effort**: 2.5-3 hours
- **Test Strategy**:
  - Verify applications load
  - Test approve (will error until Stripe route ready)
  - Test reject with message

#### 18. **Admin: Applications** (`/admin/application/[id]`)
- **Current File**: `public/admin-application.html`
- **New Route**: `app/admin/application/[appId]/page.tsx`
- **Dynamic Data**:
  - `{{applicant_full_profile}}` — Photo, bio, links
  - `{{plus_one_info}}` — Who they're bringing
  - `{{notes}}` — Admin notes
  - `{{application_history}}` — If applied before
  - `{{decision_buttons}}` — Approve/reject
- **Supabase Queries**:
  - `getApplicationWithProfile(appId)` — Full details
  - `getUserProfile(userId)` — Their profile
  - `getUserProfile(plusOneId)` — Plus-one's profile
  - `getAdminNotes(appId)`
  - `getUserApplicationHistory(userId)`
- **Complexity**: 🟡 Medium (single record detail view)
- **Dependencies**: User profiles (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify full profile loads
  - Verify plus-one info displays
  - Verify approve/reject buttons work

#### 19. **Admin: Roster** (`/admin/roster`)
- **Current File**: `public/admin-roster.html`
- **New Route**: `app/admin/roster/page.tsx`
- **Dynamic Data**:
  - `{{roster_table}}` — All attendees (name, pair, status)
  - `{{filter_options}}` — By volume, status, etc
  - `{{export_button}}` — Export to CSV
- **Supabase Queries**:
  - `getVolumeRoster(volumeId)` — All attendees
  - `getApplicationWithPair(appId)` — With pair info
- **Complexity**: 🟡 Medium (table rendering, filtering)
- **Dependencies**: None
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify full roster loads
  - Test filtering
  - Test export functionality

#### 20. **Admin: Volumes** (`/admin/volumes`)
- *Already listed in Tier 1 as #3*

#### 21. **Admin: Intros** (`/admin/intros`)
- **Current File**: `public/admin-intros.html`
- **New Route**: `app/admin/intros/page.tsx`
- **Dynamic Data**:
  - `{{intros_list}}` — All user-requested intros
  - `{{intro_pairs}}` — Who they want intros to
  - `{{approve_button}}` — Send intro (triggers email)
  - `{{skip_button}}` — Decline intro
- **Supabase Queries**:
  - `listPendingIntroRequests()` — Get all
  - `getIntroRequest(introId)` — Full details
  - `approveIntro(introId)` — Server action (sends Resend email)
  - `skipIntro(introId)` — Server action
- **Complexity**: 🟡 Medium (list actions, email triggers)
- **Dependencies**: Email system (Phase 3)
- **Effort**: 1.5-2 hours
- **Test Strategy**:
  - Verify intros load
  - Test approve (will error until email route ready)
  - Test skip

---

## Required Supabase Queries (Full List)

All query functions will live in `app/lib/supabase.ts` alongside the existing `getVolumeSeats()`.

### Volume Queries
- `listVolumes()` — All volumes
- `getVolumeDetails(volumeId)` — Name, date, location, dress code, etc
- `getVolumeSeats(volumeId)` — ✅ Already exists
- `getVolumeRoster(volumeId)` — All attendees
- `getVolumeRecap(volumeId)` — Recap data
- `getVolumePhotos(volumeId)` — Photo gallery
- `getVolumeTestimonials(volumeId)` — User testimonials
- `getNextVolume()` — Upcoming event
- `listAllVolumes()` — Admin view (no filtering)
- `getTodaysEvent()` — Event happening now

### Application Queries
- `getUserApplication(userId)` — User's most recent app
- `getApplicationStatus(appId)` — Detailed status
- `getAcceptedApplication(userId)` — Their accepted app
- `listPendingApplications()` — For admin inbox
- `getApplicationDetails(appId)` — Full details
- `getApplicationWithProfile(appId)` — With user profile
- `getApplicationWithPair(appId)` — With pair info
- `getUserApplicationHistory(userId)` — All past apps
- `countPendingApplications()` — For dashboard

### User Queries
- `getUserProfile(userId)` — Name, photo, bio, links
- `getUserContactInfo(userId)` — Email, phone
- `getUserSparks(userId, volumeId)` — People they marked
- `getMutualSparks(userId, volumeId)` — Mutual matches
- `searchAttendee(volumeId, name)` — Real-time search
- `getVolumeCheckins(volumeId)` — Who checked in
- `getPostEventSurveyAnswers(userId)` — For personalization

### Admin/Operational Queries
- `listDispatchIssues(volumeId)` — Reported issues
- `updateIssueStatus(issueId, status)` — Server action
- `getApplicationPlusOne(applicationId)` — Who they're bringing
- `canChangePlusOne(eventDate)` — Time-based logic
- `isRevealTimeReached(doorsDate)` — T-48h check
- `listPendingIntroRequests()` — Intro requests
- `getIntroRequest(introId)` — Details
- `getAdminNotes(appId)` — Notes from admins
- `getAdminDashboardData()` — Dashboard stats

### Token Validation
- `getInvitationByToken(token)` — Get invite details
- `isTokenValid(token)` — Check expiry

---

## Implementation Order & Dependencies

### Phase 2A: Independent Pages (No Dependencies)
✅ Homepage — DONE
1. Events (volumes list)
2. Admin: Dashboard
3. Admin: Volumes
4. Recap (public page)
5. Application Submitted (simple display)
6. Post-Event: No Mutuals (simple messaging)

**Effort**: ~8-10 hours  
**Dependencies**: Supabase queries only

### Phase 2B: Auth-Gated Pages (Need Auth System)
7. Status (requires user auth)
8. Accepted (requires user auth)
9. Confirmation (requires user auth)
10. Manage Seat (requires user auth + form)
11. Friend Invite (requires token validation)

**Effort**: ~7-9 hours  
**Dependencies**: Magic-link auth (Phase 3)

### Phase 2C: Form-Dependent Pages (Need API Routes)
12. Apply (form → `/api/apply`)
13. Dispatch (form → `/api/report-issue`)
14. Door Checkin (form → `/api/checkin`)
15. Admin: Inbox (form → `/api/approve-app`, `/api/reject-app`)
16. Admin: Application (form → approve/reject)
17. Admin: Intros (form → `/api/approve-intro`)

**Effort**: ~10-12 hours  
**Dependencies**: Form API routes (Phase 3)

### Phase 2D: Complex Data Pages (Need Multiple Systems)
18. Post-Event: Sparks (needs spark data model + toggles)
19. Post-Event: Match (needs mutual spark computation)
20. Admin: Roster (needs roster view + filtering + export)

**Effort**: ~5-7 hours  
**Dependencies**: Post-event data model (Phase 3)

---

## Testing Strategy (Per Batch)

### Before Deployment
1. Build locally: `npm run build`
2. Start dev server: `npm run dev`
3. Navigate to each page at `localhost:3000/<page>`
4. Compare visually to `public/<page>.html` in browser
5. Check browser console for errors
6. Check network tab for failed queries (OK if they fail — Phase 3 will wire backend)

### After Deployment
1. Wait for Vercel build (2-3 min)
2. Navigate to `https://doubles.singles/<page>`
3. Verify page loads
4. Verify styling matches
5. Take screenshot and compare to Phase 1 static version

---

## Estimated Timeline

| Phase | Pages | Effort | Time | Status |
|-------|-------|--------|------|--------|
| 2A | 6 pages | 8-10h | 2-3 sessions | Ready |
| 2B | 5 pages | 7-9h | 2-3 sessions | Blocked on Auth |
| 2C | 6 pages | 10-12h | 3-4 sessions | Blocked on Forms |
| 2D | 3 pages | 5-7h | 1-2 sessions | Blocked on Backend |
| **Total** | **19 pages** | **30-38h** | **8-12 sessions** | Ready to start |

---

## Critical Dependencies for Full Completion

**Phase 2 can proceed independently on Pages 1-6 (Phase 2A) with no backend.**

**Remaining pages require Phase 3:**
- **Auth System**: Status, Accepted, Confirmation, Manage Seat, Friend Invite
- **Form APIs**: Apply, Dispatch, Door Checkin, Admin Inbox, Admin Application, Admin Intros
- **Data Models**: Post-Event Sparks/Matches, Recap data

---

## Next Steps

**To Proceed:**
1. Review this plan
2. Approve the approach (same token-replacement pattern for all)
3. Choose which phase to start with:
   - **2A Only** (6 pages, 8-10h, no backend needed) — Execute this session
   - **2A + 2B** (11 pages, 15-19h) — Requires auth mockup
   - **All** (19 pages, 30-38h) — Requires both auth and form APIs

---

**Ready for approval. Which phase(s) should I execute?**
