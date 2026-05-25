# DOUBLES — Comprehensive Strategic Plan (Option C)

**Document Version:** 1.0  
**Date:** May 24, 2026  
**Status:** Phase 0 Planning (Pre-Implementation)

---

## Executive Summary

Doubles is a **curated, quarterly dating event platform for founders, investors, and operators in SF**. The product exists as:
- 34 fully designed HTML pages (Claude Design handoff)
- PostgreSQL schema (10 tables via Supabase)
- Tech stack (Next.js 14, Supabase, Stripe, Resend, Twilio, Inngest)
- Business model ($145/person payment holds, quarterly volumes, organic growth via vetting)

**This document maps:**
1. All interfaces & user journeys
2. All technologies & integrations
3. Complete operating model
4. Implementation roadmap (10 phases, 12-16 weeks)

---

## TABLE OF CONTENTS

1. [Interfaces & User Journeys](#interfaces--user-journeys)
2. [Technology Stack](#technology-stack)
3. [Integrations & APIs](#integrations--apis)
4. [Marketing & Growth Strategy](#marketing--growth-strategy)
5. [Operating Model](#operating-model)
6. [Data Flows & Automation](#data-flows--automation)
7. [Security & Privacy](#security--privacy)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Critical Success Factors](#critical-success-factors)
10. [Open Questions](#open-questions)

---

## INTERFACES & USER JOURNEYS

### 1. Public/Marketing Pages (12 pages) — **Anonymous**

| Page | Purpose | Key Data | Status |
|---|---|---|---|
| `index.html` | Homepage hero | Vol. 01 seats remaining (live count) | ✅ Designed |
| `about.html` | Founder story + photo gallery | Static + future team photos | ✅ Designed |
| `events.html` | Volumes calendar + featured event | Pulls from `volumes` table | ✅ Designed |
| `volley.html` | Format explainer (60-min opener) | Static | ✅ Designed |
| `faq.html` | FAQ accordion | Static | ✅ Designed |
| `contact.html` | Contact info + form | Static + Resend form submission | ✅ Designed |
| `code-of-conduct.html` | Community standards | Static markdown | ✅ Designed |
| `terms.html` | ToS | Static markdown | ✅ Designed |
| `privacy.html` | Privacy policy | Static markdown | ✅ Designed |
| `press.html` | Press kit (logos, copy) | Static file downloads | ✅ Designed |
| `speak.html` | Speaker nomination form | Form → `speaker_pitches` table | ✅ Designed |
| `dispatch.html` | Newsletter archive | Lists from `dispatch_issues` table | ✅ Designed |
| `recap-vol-0X.html` | Per-volume recap (post-event) | Vol. metadata, stats, quotes, photos | ✅ Designed |
| `404.html` | Error page | Static branded | ✅ Designed |

**Key interactions:**
- Newsletter signup (Dispatch footer)
- Social share buttons on recap pages
- Referral tracking via URL params (`/r/[name]`)

---

### 2. Application Flow (8 pages) — **Member-Facing**

#### APPLICANT PATH

| Page | Purpose | Data | State |
|---|---|---|---|
| `apply.html` | 3-step form | Applicant info (name, email, dietary, photo consent) + Stripe PaymentIntent | Form state machine |
| `application-submitted.html` | Post-submit thank-you | Real status: "Friend invited," countdown to decision | Application state |
| `friend-invite.html` | Friend lands via emailed token URL | 7-day expiry, friend's info form | Token validation |
| `check-your-email.html` | Magic-link interstitial | None (post-login check) | Rate-limited |
| `accepted.html` | "You're in" + preferences | Preferences form (dietary, photo, SMS, room-tease), .ics download | Application state |
| `confirmation.html` | T-48h night brief | Address, time, venue rules, guest info, print-friendly | Printable |
| `not-this-volume.html` | Rejection + refund | Refund status, auto-roll to next volume | Graceful rejection |
| `manage-seat.html` | Swap +1, cancel, update prefs | Three action buttons | Post-accept |

**Key interactions:**
- Stripe Elements integration (payment form)
- Friend invite email with tokenized link
- Magic-link auth (Supabase)
- .ics file generation for calendar sync
- Optimistic UI for preference saves

---

### 3. Member Pages — **Authenticated Only**

| Page | Purpose | Data | Key Actions |
|---|---|---|---|
| `status.html` | Member home: application status + past volumes | `applications` table (filtered by `auth.uid()`), past volumes attended | Login with magic link, check status |

---

### 4. Post-Event Experience (3 pages) — **T+1 to T+14**

| Page | Purpose | Data | Trigger |
|---|---|---|---|
| `post-event-sparks.html` | One-way picks ("date" / "connect" / "both") | User's own picks (read-write), running count | T+1 email prompt (Sunday 9 AM) |
| `post-event-match.html` | Mutual reveal ("you both said yes") | Mutual record (computed), intro eligibility check | T+3 (Tuesday, after mutuals computed) |
| `post-event-no-mutuals.html` | Graceful "no connections this time" | Attendee's own pick count (never show whether picked) | T+3 if zero mutuals |

**Key interactions:**
- Auto-save per pick (optimistic)
- No UI ever shows inbound one-way picks (privacy contract)
- Send-intro confirmation modal
- Mutual hold until T+7 (email intro on day 7 if held)

---

### 5. Admin Suite (6 pages) — **Founder/Operator**

#### FOUNDER DASHBOARD

| Page | Purpose | Data | Real-Time |
|---|---|---|---|
| `admin-dashboard.html` | Founder home: pulse, activity feed, current volume hero | Seat count, applications pending, friend-invite status, door checkin arrivals | ✅ Supabase Realtime |
| `admin-inbox.html` | Applications review queue | `applications` (filtered: awaiting, flagged, friend-pending), applicant details | Pagination + filters |
| `admin-application.html` | Pair detail + decision | Full applicant info, vouch text, friend info, payment status, sticky decision bar (A/R/F), keyboard nav | Approve/Reject/Flag |
| `admin-roster.html` | Confirmed attendees + composition | `applications` (status = accepted), breakdown by demo, dietary, photo consent, CSV/PDF export | Search + sort |
| `admin-volumes.html` | Volume CRUD | `volumes` table, create/edit/publish, speaker management | Inline editing |
| `admin-intros.html` | Post-event mutual intro queue | `mutuals` table ONLY (never sparks_picks), one-way picks NEVER shown, intro hold countdown | Send intro (T+7) |

**Key interactions:**
- Keyboard nav: `A` (Approve), `R` (Reject), `F` (Flag), `J` (next pair)
- Sticky decision bar with confirmation modal
- Real-time activity feed
- CSV/PDF export for kitchen brief (roster) + confirmation sheet (attendees)
- Search via Postgres full-text or Typesense

---

### 6. Night-of Operations (1 page)

| Page | Purpose | Device | Data |
|---|---|---|---|
| `door-checkin.html` | Mobile/tablet check-in at the door | Tablet or phone | Real-time attendee search, mark arrived, arrival count |

**Key interactions:**
- Optimistic mark-arrived (POST)
- Auto-refresh stats every 30s
- Mobile-first design
- No network offline mode (sync on reconnect)

---

## TECHNOLOGY STACK

### Core Framework & Hosting

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSG for marketing pages, SSR for member pages, API routes for webhooks |
| **Hosting** | Vercel | Auto-deploys from git, serverless functions, edge middleware for auth |
| **Database** | Supabase (Postgres) | Built-in auth, RLS for privacy, real-time subscriptions, storage for photos |
| **Auth** | Supabase Magic Links | No passwords, SMS not needed for login, 30-day session token via JWT |
| **CSS** | CSS Modules + CSS Variables | Preserve brand tokens, not Tailwind (intentional decision) |
| **Type Safety** | TypeScript (strict) | All files `.ts`/`.tsx` |

---

### Payments & Financial

| Service | Purpose | Config |
|---|---|---|
| **Stripe** | Payment holds + capture | `PaymentIntent`, `capture_method: manual`, $145 (14500 cents), one per app side |
| **Webhooks** | Payment state tracking | `payment_intent.requires_capture`, `payment_intent.canceled`, `charge.refunded` |

**Flow:**
1. Applicant fills form → Stripe.confirmCardPayment() (hold, not charge)
2. Admin approves → paymentIntent.capture() (both sides atomic)
3. Admin rejects → paymentIntent.cancel() (refund automatic)
4. Member cancels >72h before → refund.create() (manual)
5. Member cancels <72h before → case-by-case reply-to email

---

### Communication

| Service | Purpose | Use Case |
|---|---|---|
| **Resend** | Transactional email | 10 email templates (React Email components) |
| **React Email** | Email template building | Mirror `email-templates.html` design in components |
| **Twilio** | SMS | Day-of address SMS (optional), founder hotline (single number) |
| **Resend Audiences** | Newsletter list | Dispatch subscribers (unified email provider, lower CAC) |

**Email triggers:** See Background Jobs section below.

---

### Analytics & Monitoring

| Service | Purpose | What We Track |
|---|---|---|
| **Plausible** | Privacy-respecting analytics | Page views, funnel (home → apply → submit → accepted → attended) |
| **PostHog** | Product analytics (alternative) | User behavior, feature usage, cohort analysis |
| **Sentry** | Error monitoring | Frontend + serverless errors, performance metrics |
| **Cloudflare** | CDN + DDoS | Free tier sufficient; WAF optional |

**What we DON'T track:**
- ❌ Facebook Pixel
- ❌ Google Analytics
- ❌ Hotjar / session replay
- ❌ Intercom (chat widgets)

---

### Background Jobs & Scheduling

| Service | Purpose | Jobs |
|---|---|---|
| **Inngest** | Scheduled jobs + retries | 9 critical jobs (friend reminders, address reveal, sparks prompt, mutual compute, etc.) |
| **Trigger.dev** | Alternative | Same capabilities if Inngest unavailable |

---

### Image & Media Hosting

| Service | Purpose | Use |
|---|---|---|
| **Cloudinary** | Image storage + transforms | Founder photos, event photos, smart cropping |
| **Vercel Blob** | Alternative | Simpler, tighter Vercel integration |
| **@vercel/og** | OG card generation | Dynamic per-recap cards for social share |

---

### Search (Optional, Phase 3+)

| Service | Purpose | When |
|---|---|---|
| **Postgres full-text** | Admin roster search | Good enough for <500 attendees |
| **Typesense** | Semantic search | Upgrade if search becomes critical |

---

## INTEGRATIONS & APIs

### Authentication & Authorization

**Model:** Supabase Auth + RLS (Row-Level Security)

```
User Roles:
- Public (anonymous)
  → Can access: marketing pages, apply form, friend-invite link
  → Cannot access: member pages, admin pages

- Member (authenticated)
  → Can access: status, accepted, confirmation, post-event pages
  → Can see: own applications, own sparks_picks, own mutuals
  → Cannot see: other members' data (enforced by RLS)

- Admin / Founder
  → Can access: all admin pages
  → Can see: all applications, all rosters, mutuals (NOT one-way sparks_picks)
  → Cannot see: individual sparks_picks (privacy contract)
```

**Magic-link flow:**
1. User enters email on `status.html`
2. Supabase sends magic link to email
3. User clicks link → redirected to `check-your-email.html` (interstitial)
4. Session created (JWT, 30-day expiry)
5. User can now access member pages

---

### Payment Processing

**Stripe Payment Intent Flow**

```
Application start:
POST /api/create-payment-intent
  ← Body: { user_id, volume_id, amount: 14500 }
  → Returns: { client_secret, publishable_key }

Front-end:
1. stripe.confirmCardPayment(client_secret, { payment_method: { card } })
2. Payment hold created (status: requires_capture)
3. Application saved with payment_intent_id
4. Applicant sees: "Application submitted. Waiting for review."

On admin accept:
POST /api/capture-payment-intent
  ← Body: { application_id }
  → stripe.paymentIntents.capture(payment_intent_id)
  → Status: succeeded (now charged)
  → Email sent to applicant + friend

On admin reject:
POST /api/cancel-payment-intent
  ← Body: { application_id }
  → stripe.paymentIntents.cancel(payment_intent_id)
  → Status: canceled (hold released, no charge)
  → Refund automatic; email sent
```

---

### Email Delivery

**Resend Integration**

```
Each email template = React Email component

Triggers:
1. application_received → Applicant submits → sends immediately
2. friend_invitation → Same → sends to friend (token URL embedded)
3. friend_reminder → T+48h (Inngest) → sends if friend hasn't submitted
4. friend_submitted → Friend fills form → sends to applicant
5. accepted → Admin approves → sends to both (personalized)
6. not_this_volume → Admin rejects → sends to both + refund info
7. address_reveal → T-48h (Inngest) → sends to confirmed attendees
8. day_of_sms → 10 AM day-of (Inngest) → Twilio SMS to opted-in attendees
9. sparks_prompt → T+1 Sunday 9 AM (Inngest) → sends link to post-event-sparks
10. mutual_match → T+3 Tuesday 8 AM (Inngest) → sends to both sides of mutual
    OR: no_mutuals → if zero mutuals, sends graceful page link

Subject lines, copy, design: mirror email-templates.html exactly.
```

---

### SMS (Optional)

**Twilio**

```
Two use cases:

1. Day-of address reveal
   - T-48h email sent automatically
   - T day-of 10 AM: SMS sent if sms_consent=true
   - Format: "Doubles Vol. 01 | Tonight 6 PM | [address] | See you soon!"

2. Founder hotline (single number)
   - One founder on-call night-of
   - Attendees text "Hi" for live support
   - Replies via Twilio dashboard or API
```

---

### Database Schema (10 Tables)

See `/Users/chrisbeaman/AI/doubles/supabase/migrations/20260524_initial_schema.sql` for full schema.

**Core tables:**

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Member profiles | `id`, `email`, `name`, `phone`, `dietary_restrictions`, `photo_consent`, `sms_consent` |
| `volumes` | Events (quarterly) | `id`, `number`, `name`, `status`, `doors_date`, `venue_name`, `capacity`, `speaker_id`, `speaker_public_at` |
| `applications` | Pair + payment | `id`, `volume_id`, `applicant_user_id`, `friend_user_id`, `status`, `applicant_payment_intent_id`, `friend_payment_intent_id`, `friend_invite_token`, `admin_decision`, `applicant_seat_number`, `friend_seat_number` |
| `sparks_picks` | One-way post-event picks | `id`, `picker_user_id`, `picked_user_id`, `volume_id`, `kind` ('date'\|'connect'\|'both'), RLS: **picker only can read own** |
| `mutuals` | Computed mutual connections | `id`, `volume_id`, `user_a_id`, `user_b_id`, `kind`, `computed_at`, `intro_held_until`, `intro_sent_at` |
| `reviews` | Admin decision log | `id`, `application_id`, `admin_user_id`, `decision`, `notes`, `decided_at` |
| `dispatch_issues` | Newsletter archive | `id`, `issue_number`, `title`, `body_md`, `published_at`, `status` |
| `speaker_pitches` | Speaker nominations | `id`, `name`, `email`, `role_title`, `story_pitch`, `status` |
| `photos` | Event gallery | `id`, `volume_id`, `url`, `caption`, `is_wide_shot`, `uploaded_at` |
| `emails_sent` | Audit log | `id`, `recipient_email`, `kind`, `volume_id`, `data` (JSONB), `sent_at`, `status` |

**RLS Policies (Critical):**
- `sparks_picks`: Picker can read own only. **Admins never see one-way picks.** Server-side mutual function has special access.
- `mutuals`: Admins see all; members see only their own mutuals
- `applications`: Members see own; admins see all
- `users`: Members see self; admins see all

---

## MARKETING & GROWTH STRATEGY

### Positioning

**Who:** Post-exit founders, investors, operators in SF (TAM: ~1,500 in PEF community)

**What:** Curated quarterly dating events (not apps, not algorithms, not generic singles events)

**Why:** Vetting through friendship is the moat. Quality > quantity.

**How:** 30-person events, held in founder homes (Agi House, your Portola house, others), bring-one-friend model

---

### Acquisition Strategy

**Phase 1 (Vol. 01):** Organic + founder network
- PEF WhatsApp group (1,500 pre-screened members)
- Personal outreach to your 4 hiking friends + their networks
- Zero CAC (owned network)

**Phase 2 (Vol. 02+):** Referral loop
- Attendees refer friends (built-in word-of-mouth)
- Post-event recap pages → social share → SEO
- "Join the founding launch" positioning

**Phase 3 (Vol. 04+):** Content gravity wells
- `recap-vol-0X.html` pages (10 by year 2) → editorial content → Google ranking
- `dispatch.html` + quarterly essays (Dispatch newsletter)
- Speaker reveals (post-event) = celebrity lift

---

### Marketing Channels

| Channel | Use | Volume |
|---|---|---|
| **PEF WhatsApp** | Direct recruitment | High (Vol. 01 target) |
| **Referral (URL)** | Post-event, attendee outreach | Growing (Vol. 02+) |
| **Twitter / LinkedIn** | Social share on recap pages | Medium (Vol. 02+) |
| **Dispatch Newsletter** | Quarterly essays + Vol. announcements | Building |
| **Organic search** | "Founder dating SF," "curated singles," recap SEO | Medium (Vol. 04+) |
| **PR / speakers** | Speaker reveals → press coverage | Optional |

---

### Marketing Tech Stack

| Tool | Purpose |
|---|---|
| **Plausible / PostHog** | Funnel tracking (home → apply → submit → accepted → attended) |
| **UTM params** | Dispatch email links (`?utm_source=dispatch&utm_campaign=04`) |
| **Referral URLs** | `/r/[name]` → cookie → apply page prefill |
| **Resend Audiences** | Newsletter list management |
| **@vercel/og** | Dynamic OG cards for social share |

**Don't use:**
- Facebook Pixel (wrong signal)
- Intercom (breaks editorial tone)
- Session replay (privacy violation)

---

## OPERATING MODEL

### Roles & Responsibilities

| Role | Responsibilities | Tools |
|---|---|---|
| **Founder (You)** | Strategy, speaker outreach, final approvals, night-of host | Stripe dashboard, Supabase, Inngest logs, email |
| **Admin reviewer** | Review applications, flag, message applicants | `admin-inbox.html`, `admin-application.html`, Resend |
| **Day-of ops** | Door check-in, host experience, Twilio hotline | `door-checkin.html`, Twilio dashboard |
| **Post-event** | Photo curation, quote collection, recap writing | Cloudinary, Notion, Resend |

---

### Per-Volume Operating Cadence

**~3-month cycle:**

| Timeline | Task | Tool |
|---|---|---|
| **Day 0** | Open applications | `admin-volumes.html` (set status: applications_open) |
| **Weeks 1–8** | Review apps as they come in | `admin-inbox.html`, `admin-application.html` |
| **Week 6** | Book speaker | Email/calendar |
| **Week 11** | Close apps (target 25 confirmed, 5-seat waitlist) | `admin-volumes.html` |
| **T-48h** | Address reveal email sent (automatic) | Verify in `admin-dashboard.html` |
| **T-24h** | Day-of SMS scheduled (automatic) | Verify Twilio queue |
| **T-2h** | Open `door-checkin.html` on tablet | Have backup phone ready |
| **Night of** | Host event, collect vouch quotes, capture photos | Notes app + Cloudinary |
| **T+1 (Sunday 9 AM)** | Sparks prompt email fires (automatic) | Verify in logs |
| **T+3 (Tuesday 8 AM)** | Mutuals computed (automatic) | Review `admin-intros.html`, skim matches |
| **T+7** | Intro emails sent to held mutuals (automatic) | Monitor Resend |
| **T+14** | Draft recap; publish `recap-vol-0X.html` | Write + publish |
| **T+90** | Quarterly Dispatch essay + Vol. announcement | Write + Resend Audiences send |

---

### Security & Privacy Operating Procedures

| Cadence | Task | Tool |
|---|---|---|
| **Daily** | Monitor Stripe disputes | Stripe dashboard |
| **Weekly** | Audit `sparks_picks` access logs | Supabase logs (verify only picker + server function read) |
| **Monthly** | Review email audit log (`emails_sent`) | Supabase query |
| **Quarterly** | Rotate magic-link signing secret | Supabase Settings |

---

## DATA FLOWS & AUTOMATION

### 9 Critical Background Jobs (Inngest)

| Job | Trigger | Action | Cadence |
|---|---|---|---|
| `friend_invite_reminder` | Application submitted | Send email if friend hasn't submitted | T+48h |
| `friend_invite_expire` | 7 days since invite | Release applicant's hold, mark app expired, email note | T+7d |
| `address_reveal` | Event date | Send address + confirmation details to confirmed attendees | T-48h |
| `day_of_sms` | Day of event | Send SMS to opted-in attendees | 10 AM, single send |
| `sparks_prompt` | Event end | Send post-event sparks form link | T+1 Sunday 9 AM |
| `compute_mutuals` | Day after sparks close | Compute mutuals from one-way picks, hold for 7d, send no_mutuals emails | T+3 Tuesday 8 AM |
| `intro_archive` | 7 days since mutual created | Archive mutual if intro hasn't been sent | T+7d (auto-expire) |
| `auto_roll_rejected` | New volume created | Add all rejected apps from previous volume to review pool | On-demand |
| `dispatch_send` | Manual trigger | Send Dispatch newsletter to Resend Audiences list | Quarterly, founder-triggered |

---

### State Machines

**Application Lifecycle:**
```
draft → submitted → friend_pending → both_submitted → reviewing
                                                        ↓
                                             accepted | rejected
                                                  ↓
                                   accepted_unconfirmed → accepted_confirmed
                                                          ↓
                                        accepted_address_sent (T-48h)
                                                          ↓
                                              attended | no_showed
```

**Volume Lifecycle:**
```
announced → applications_open → applications_closed → in_review
                                                       ↓
                                   confirmed_roster → completed
```

**Mutual Lifecycle:**
```
computed → intro_held (7d) → intro_sent | archived (auto-expire)
```

---

## SECURITY & PRIVACY

### Privacy Contract

**What Doubles promises:**
- We know only what you told us (no LinkedIn scraping, no background checks)
- One-way picks are your secret (admins never see them, only computed mutuals)
- Photos are opt-in (photo_consent flag)
- SMS is opt-in (sms_consent flag)

### Data Handling

| Data Type | Storage | Visibility | Retention |
|---|---|---|---|
| **One-way sparks_picks** | `sparks_picks` table | Picker only (RLS enforced) + server-side mutual function | Until mutual expired (7d+) |
| **Computed mutuals** | `mutuals` table | Admin view (admin-intros.html) ONLY | Until archived |
| **User PII** | `users` table | Member (self) + admin (all) | Until soft-delete |
| **Photos** | Cloudinary + `photos` table | Public if `is_wide_shot=true`, attendee-only if private | Per volume |
| **Email audit** | `emails_sent` table | Admin view only | 1 year (compliance) |

### RLS Policy Examples

```sql
-- sparks_picks: Picker can read own only
CREATE POLICY "sparks_picks_user_see_own"
  ON sparks_picks FOR SELECT
  USING (auth.uid() = picker_user_id);

-- mutuals: Admins see all; members see own only
CREATE POLICY "mutuals_admin_see_all"
  ON mutuals FOR SELECT
  USING (
    (SELECT auth.jwt()->>'role' = 'admin') OR
    auth.uid() = user_a_id OR
    auth.uid() = user_b_id
  );
```

---

## IMPLEMENTATION ROADMAP

### Phase 0: Foundation (Weeks 1–2) ← **WE ARE HERE**

**Objectives:**
- Extract & unify CSS from all 34 Claude Design files
- Rebuild key pages in React (index, apply, admin-dashboard, status)
- Verify pixel-perfect match to design
- Deploy to Vercel

**Deliverables:**
- `styles/design-system.css` (consolidated, all tokens)
- `app/(marketing)/page.tsx` (homepage)
- `app/(auth)/apply/page.tsx` (application form, Stripe placeholder)
- `app/(admin)/dashboard/page.tsx` (admin dashboard, static data)
- `app/(member)/status/page.tsx` (member status, static data)
- Public site live on Vercel

**Effort:** ~40 hours

---

### Phase 1: Marketing Pages (Weeks 3–4)

**Objectives:**
- Convert remaining 10 marketing pages to React (SSG)
- Wire newsletter signup
- SEO optimization (metadata, JSON-LD, sitemap)
- Deploy to Vercel with SSL

**Pages:**
- about.html, events.html, faq.html, contact.html, volley.html, press.html, speak.html, code-of-conduct.html, privacy.html, terms.html, dispatch.html, 404.html

**Deliverables:**
- All marketing pages as static routes
- Newsletter signup → Resend Audiences
- SEO tags + JSON-LD
- sitemap.xml + robots.txt
- Domain + SSL configured

**Effort:** ~30 hours

---

### Phase 2: Authentication Layer (Week 5)

**Objectives:**
- Supabase magic-link auth
- User sessions (30-day JWT)
- Member-only pages gated

**Deliverables:**
- `app/(auth)/login/page.tsx` (status page magic link entry)
- `app/(auth)/check-email/page.tsx` (interstitial)
- Auth middleware (protect member routes)
- RLS policies enforced in Supabase

**Effort:** ~20 hours

---

### Phase 3: Application Flow + Stripe (Weeks 6–8) ← **CRITICAL PATH**

**Objectives:**
- Multi-step application form (applicant info → friend invite → payment)
- Stripe PaymentIntent hold + capture/cancel flow
- Application state machine
- Friend invite with tokenized links (7-day expiry)
- Application status tracking

**Pages:**
- apply.html (form + Stripe Elements)
- application-submitted.html (status check)
- friend-invite.html (friend lands here)
- accepted.html (post-accept preferences)
- not-this-volume.html (rejection + refund)

**Deliverables:**
- Application CRUD in Supabase
- Stripe integration (create intent, confirm, capture, cancel)
- Email sending (Resend): application_received, friend_invitation, friend_reminder (Inngest), friend_submitted, accepted, not_this_volume
- Friend invite token generation + validation
- Webhook handlers: payment_intent.requires_capture, payment_intent.canceled, charge.refunded

**Effort:** ~60 hours

---

### Phase 4: Admin Approval System (Week 9)

**Objectives:**
- Admin inbox (applications queue)
- Application detail + decision making
- Approval/rejection with payment capture/cancel
- Admin dashboard (activity feed, volume hero)

**Pages:**
- admin-dashboard.html (Supabase Realtime)
- admin-inbox.html (queue + filters)
- admin-application.html (pair detail + decision bar)

**Deliverables:**
- Admin routes (role-gated)
- Applications queue filtering (awaiting, flagged, friend-pending)
- Decision workflow (approve → capture, reject → cancel)
- Real-time activity feed (Supabase Realtime)
- Keyboard nav (A/R/F keys)

**Effort:** ~40 hours

---

### Phase 5: Member Pages & Pre-Event (Week 10)

**Objectives:**
- Member home (status page)
- Acceptance confirmation + preferences
- Pre-event details (T-48h address reveal, confirmation sheet)
- Seat management (swap +1, cancel)

**Pages:**
- status.html (member home, login entry)
- accepted.html (preferences: dietary, photo, SMS, room-tease)
- confirmation.html (T-48h brief, printable, .ics calendar)
- manage-seat.html (swap +1, cancel, update prefs)

**Deliverables:**
- Member routes (auth-gated)
- Preference auto-save (optimistic UI)
- .ics file generation (calendar sync)
- Print stylesheets (confirmation, kitchen brief)
- Background jobs: address_reveal (T-48h), day_of_sms (10 AM)

**Effort:** ~35 hours

---

### Phase 6: Door Check-In & Night-Of (Week 11)

**Objectives:**
- Mobile-friendly check-in interface
- Real-time arrival tracking
- Founder hotline (SMS support)

**Pages:**
- door-checkin.html (optimistic UI, mobile-first)

**Deliverables:**
- Supabase Realtime arrivals count
- Twilio SMS integration (day-of SMS, founder hotline number)
- Offline mode (sync on reconnect)
- Search via full-text Postgres

**Effort:** ~20 hours

---

### Phase 7: Post-Event Matching (Weeks 12–13)

**Objectives:**
- Post-event sparks (one-way picks: date / connect / both)
- Compute mutuals (Tuesday cron)
- Mutual reveals + intro handling
- Graceful "no connections" state

**Pages:**
- post-event-sparks.html (T+1 form, auto-save)
- post-event-match.html (mutual reveal, send-intro action)
- post-event-no-mutuals.html (graceful page, show own pick count only)

**Deliverables:**
- Sparks form + auto-save per pick (optimistic)
- Background job: compute_mutuals (T+3 Tuesday 8 AM)
- Background job: sparks_prompt (T+1 Sunday 9 AM)
- Mutual intro holds (7-day hold before intro email)
- Email: mutual_match, no_mutuals
- RLS: sparks_picks picker-only visibility (admins NEVER see one-way picks)

**Effort:** ~40 hours

---

### Phase 8: Admin Suite Completion (Week 14)

**Objectives:**
- Full admin CRUD for volumes, rosters, intros
- CSV/PDF exports (kitchen brief, confirmation sheet)
- Mutual intro management (post-event intros queue)

**Pages:**
- admin-roster.html (confirmed attendees, composition, kitchen brief, CSV export)
- admin-volumes.html (volume CRUD, speaker management, secrecy indicators)
- admin-intros.html (mutuals queue, intro tracking, NEVER show sparks_picks)

**Deliverables:**
- Volume CRUD (create, edit, publish, speaker assignment)
- Roster filtering + search + sort
- CSV export (attendees) + PDF export (kitchen brief)
- Mutual intro queue (send intro, track delivery)
- Background job: intro_archive (T+7 auto-expire)

**Effort:** ~35 hours

---

### Phase 9: Volume Recap & Newsletter (Week 15)

**Objectives:**
- Per-volume recap page (post-event)
- Speaker reveal (public, only after event)
- Event stats + photos + quotes
- Dispatch newsletter archive

**Pages:**
- recap-vol-01.html (generated per volume)
- dispatch.html (newsletter archive)
- Individual dispatch issue pages (optional)

**Deliverables:**
- Recap page generation (volume metadata, stats, photos, quotes)
- Speaker reveal (public, T+event)
- Dynamic OG card generation (@vercel/og)
- Dispatch CRUD (create, edit, publish)
- Dispatch email sending (Inngest, manually triggered)
- Social share buttons (Twitter, LinkedIn)

**Effort:** ~30 hours

---

### Phase 10: Polish & Optimization (Week 16)

**Objectives:**
- Performance tuning (Lighthouse >90)
- Mobile responsiveness
- Error handling + edge cases
- Security audit (Stripe, RLS, tokens)
- Documentation + runbooks

**Deliverables:**
- Image optimization (Cloudinary transforms)
- Code splitting + lazy loading
- Error boundaries + graceful fallbacks
- Security audit (no PII in logs, token entropy, rate limiting)
- Operational runbooks (per-volume checklist, troubleshooting)
- Admin training guide

**Effort:** ~25 hours

---

### Total Effort Estimate

| Phase | Weeks | Hours | Cumulative |
|---|---|---|---|
| Phase 0: Foundation | 1–2 | 40 | 40 |
| Phase 1: Marketing Pages | 3–4 | 30 | 70 |
| Phase 2: Auth | 5 | 20 | 90 |
| Phase 3: Application + Stripe | 6–8 | 60 | 150 |
| Phase 4: Admin Approval | 9 | 40 | 190 |
| Phase 5: Member Pages | 10 | 35 | 225 |
| Phase 6: Door Check-In | 11 | 20 | 245 |
| Phase 7: Post-Event Matching | 12–13 | 40 | 285 |
| Phase 8: Admin Suite | 14 | 35 | 320 |
| Phase 9: Recap + Newsletter | 15 | 30 | 350 |
| Phase 10: Polish | 16 | 25 | 375 |

**Total: ~375 hours (~9.4 weeks full-time, or 16 weeks part-time)**

---

## CRITICAL SUCCESS FACTORS

### Technical

1. **RLS policies:** Sparks_picks picker-only visibility is not optional. Test in Supabase playground.
2. **Payment atomicity:** Both sides of pair must capture/cancel together (atomic transaction).
3. **Email deliverability:** Use Resend exclusively (not Mailchimp, not SendGrid). Templates must mirror design.
4. **Real-time dashboard:** Supabase Realtime for activity feed + arrival counts (not polling).
5. **Mobile-first checkin:** `door-checkin.html` must work offline with sync-on-reconnect.

### Business

1. **Vetting is the moat:** Don't skip this. Every person must be vouched by someone in the room.
2. **Speaker reveal timing:** Hold private until event night, then reveal publicly on recap page.
3. **Mutual privacy:** Never surface one-way picks to anyone (admins, matched users, founders).
4. **Approval SLA:** Target <3 days from application to decision (build urgency).
5. **Post-event momentum:** Sparks email T+1 and mutual compute T+3 must fire on time.

### Operational

1. **Per-volume checklist:** Create + maintain. Use for every volume (Part of Phase 10 deliverables).
2. **Admin training:** Document keyboard nav, decision workflow, permission model.
3. **Founder hotline:** Assign one founder on-call night-of. Script = "Hi, this is Doubles. How can I help?"
4. **Photo strategy:** Collect wide-shots only, no faces close-ups (privacy-respecting).
5. **Recap writing:** Draft within 72h of event while stories are fresh.

---

## OPEN QUESTIONS

| Question | Context | Resolution |
|---|---|---|
| **Speaker booking** | When do we book the first Vol. 01 speaker? | Target: Week 6 of volume cycle (6 weeks before event) |
| **Photo consent default** | Should photo_consent default to true or false? | Should default to **false** (opt-in, not opt-out) |
| **Referral tracking accuracy** | How do we attribute multi-device referrals? | Use email as primary key (safest, not URL params alone) |
| **Mutual hold duration** | Is 7 days the right intro hold time? | Test with Vol. 01; may adjust based on feedback |
| **Admin team structure** | Will you review all applications solo, or have a reviewer? | Solo for Vol. 01; build reviewer role if scaling to multiple volumes |
| **Venue strategy** | Are you targeting 3–4 founder homes for recurring venues? | Yes (Portola, Agi House, + 2 more by Vol. 04) |
| **Capacity target** | Is 30 the right size, or scale to 50+ later? | Stay at 30 for quality. Scale to multiple 30-person events in different neighborhoods (Vol. 05+) |
| **Newsletter cadence** | Is quarterly Dispatch the right frequency? | Yes, tie to each volume cycle. Consider monthly founder-only updates. |
| **Vendor management** | Who handles catering, photographer, venue logistics? | You (Vol. 01–02); hire ops person by Vol. 03 |

---

## IMPLEMENTATION STRATEGY

### Approach: Phase-Gated with Weekly Checkins

**Week 1–2 (Phase 0):** Build the visual foundation (all 34 pages converted to React, CSS unified)
- No backend wiring yet, just pixel-perfect designs
- Deploy to Vercel (live, public)
- Weekly checkin: Verify design fidelity, check Lighthouse scores

**Weeks 3–5 (Phases 1–2):** Marketing + Auth
- Public pages live (organic search, social share ready)
- Magic-link auth working (members can log in)
- Weekly checkin: Monitor early signups, verify email deliverability

**Weeks 6–14 (Phases 3–8):** Core product (apply → approve → attend)
- Full application flow (Stripe integrated)
- Admin approval system
- Pre-event + night-of operations
- Post-event matching
- Weekly checkin: Spot-check Stripe webhooks, RLS policies, email triggers

**Weeks 15–16 (Phases 9–10):** Polish + Launch
- Recap pages, newsletter
- Performance tuning
- Security audit
- Operational runbooks

### Testing Strategy

**Unit tests:**
- Payment intent creation, capture, cancel
- RLS policies (test that sparks_picks picker-only actually works)
- Email template rendering (React Email components)

**Integration tests:**
- Full application flow (apply → payment → friend invite → friend submit → admin approve → capture)
- Magic-link auth (request → email → click → session)
- Mutuals computation (picks → mutual → intro hold → intro send)

**E2E tests:**
- Critical paths only: apply → accept, admin approve, post-event sparks → mutual
- Use Playwright with real Supabase database (reset between runs)

**Manual testing (Vol. 01):**
- Founder + 2–3 trusted testers go through entire flow
- Target 1 week before launch

---

This plan is comprehensive, strategic, and ready for execution. 

**Next steps:**
1. Review this document for alignment
2. Confirm approach + timeline with team
3. Begin Phase 0 (Week 1) on Monday
4. Weekly 30-minute checkins to track progress

Questions? Let me know.

