# DOUBLES — Web App Handoff (v2)

> Comprehensive handoff for building the Doubles web app from the static design files in this folder. **Updated to reflect everything designed across Waves 1–3.**

---

## ⚡ Read this first

**Doubles** is a curated, quarterly dating event in San Francisco for founders, investors, and operators. Vol. 01 is **Saturday, June 21, in Twin Peaks**.

The 34 HTML files in this folder are the **production-ready design system**. Your job: convert them into a real web app — preserve the visual design exactly, replace static parts with backend-driven flows.

### ⚠️ This supersedes any earlier handoff

Treat these files as **the only source of truth**. Diff every file against your previous copy. Where copy, structure, or behavior conflicts with what you remember — **the files win**.

---

## Table of contents

1. [Page inventory (34 files)](#page-inventory)
2. [Changes since v1 handoff](#changes-since-v1-handoff)
3. [Brand system](#brand-system)
4. [User roles & permissions](#user-roles--permissions)
5. [APIs & SaaS integrations](#apis--saas-integrations)
6. [Database](#database)
7. [Background jobs & automation](#background-jobs--automation)
8. [Email & SMS triggers](#email--sms-triggers)
9. [Pattern library & CSS](#pattern-library--css)
10. [JavaScript & interaction design](#javascript--interaction-design)
11. [SEO strategy](#seo-strategy)
12. [Marketing integrations](#marketing-integrations)
13. [Luma integration](#luma-integration)
14. [User flow & state machines](#user-flow--state-machines)
15. [Functional requirements per page](#functional-requirements-per-page)
16. [Operating instructions for maintenance](#operating-instructions-for-maintenance)
17. [Additional functionality not yet designed](#additional-functionality-not-yet-designed)
18. [Implementation priorities](#implementation-priorities)
19. [Things to never change](#things-to-never-change)
20. [Open questions](#open-questions)

---

## Page inventory

### Marketing & public (12)

| File | Purpose | Dynamic data |
|---|---|---|
| `index.html` | Homepage | Vol. 01 seats remaining |
| `about.html` | Brand story, founders, room gallery | None |
| `events.html` | All-volumes calendar (featured + list) | Pulls from `volumes` table |
| `volley.html` | The Volley format explainer | None |
| `faq.html` | FAQ accordion | None |
| `contact.html` | Contact info | None |
| `code-of-conduct.html` | Conduct doc | None |
| `terms.html`, `privacy.html` | Legal | None |
| `recap-vol-01.html` | **Past volume recap** — speaker revealed publicly here only after the event | Generated per completed volume |
| `dispatch.html` | Newsletter archive | Pulls from `dispatch_issues` |
| `speak.html` | Speaker self-nomination | Form submits to `speaker_pitches` |
| `press.html` | Press kit | Static |
| `404.html` | Branded error | None |
| `design-system.html` | Internal design reference — exclude from production | — |

### Application flow — member-facing (8)

| File | Purpose |
|---|---|
| `apply.html` | 3-step application + Stripe hold |
| `friend-invite.html` | Friend lands here from emailed token URL |
| `application-submitted.html` | Post-submit thank-you with real status |
| `accepted.html` | "You're in" + preferences (photo/SMS/dietary) |
| `not-this-volume.html` | Gracious rejection + refund + auto-roll |
| `confirmation.html` | T-48h night brief (address reveal) |
| `status.html` | Magic-link sign-in + status check + history |
| `check-your-email.html` | Magic-link interstitial |
| `manage-seat.html` | Swap +1 or cancel (72-hour-free policy) |

### Post-event (3)

| File | Purpose |
|---|---|
| `post-event-sparks.html` | T+1 mutual interest check (date / connect dual toggles) |
| `post-event-match.html` | Mutual reveal — "you both said yes" |
| `post-event-no-mutuals.html` | Graceful "nothing aligned this time" — preserves picker privacy |

### Admin (6)

| File | Purpose |
|---|---|
| `admin-dashboard.html` | Founder home — current volume hero, today's pulse, activity feed |
| `admin-inbox.html` | Applications queue (Awaiting / Flagged / Friend pending) |
| `admin-application.html` | Pair detail with sticky decision bar |
| `admin-roster.html` | Confirmed attendees + composition + kitchen brief |
| `admin-volumes.html` | Volume CRUD with secrecy indicators |
| `admin-intros.html` | Mutuals-only queue (one-way picks NEVER shown) |

### Operational (2)

| File | Purpose |
|---|---|
| `door-checkin.html` | Mobile/tablet door check-in for the night-of host |
| `email-templates.html` | Showcase of all 10 transactional emails |

---

## Changes since v1 handoff

Diff the files for everything. Key substantive shifts:

### Schedule
- **6:00 – 9:00 PM** (was 7:00 – 11:00)
- **No afterparty** — night ends at 9
- New 6:00–6:30 networking segment
- **Buffet-style dinner**, NOT seated/plated. Vocabulary palette below.

### Venue
- **Twin Peaks, SF** (was Presidio Heights). Address private until T-48h.

### Speaker
- **Held private until the night of**, then **revealed publicly** on the post-event recap page (`recap-vol-01.html`). When booked, the infrastructure swaps the name into: homepage hero pill, marquee, Volley spotlight, event card features list, accepted/confirmation pages — but the default site state is speaker-less.

### Vibe vocabulary
- ✅ **Use:** upbeat jazz, well-lit, golden-hour, bay views, the room moves, mingle, shake hands, knots of conversation, cocktail-party energy
- ❌ **Avoid:** candlelight, soft music, dim lights, quiet, intimate, small plates, afterparty, seated dinner, reshuffled seating

### Terminology lock

| Term | Means | Don't use it for |
|---|---|---|
| **Volume / Vol.** | The event itself (a single night). Quarterly. | Never "match" or "session" for the event. |
| **Volley** | The 60-min opener (15 min fireside + 45 min Q&A). | Don't use for the whole night. Define inline before first use in body copy. |
| **Match** | The romantic *connection / pairing outcome*. | NEVER for the event. |
| **Doubles** | The format (you bring one friend). Also brand name. | Don't say "singles event." |
| **Launch** | Only in "Founding Launch" as Vol. 01's proper name. | Don't use as a verb. |

### Brand lines
- Hero H1: **"Good people. Great matches."** (italic emphasis on *matches*)
- Footer slogan: **"Doubles, not solos."**

### CTAs
- All Apply / Reserve / Apply-for-next-event CTAs → **`apply.html`**. Not Luma.

### Payment timing
- **$145 hold on application, refunded if rejected.**
- Stripe PaymentIntent, `capture_method: manual`. Capture on accept, cancel on reject.
- Each side of the pair pays separately.

---

## Brand system

### Colors (in `assets/doubles.css` as CSS custom properties)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14272D` | Text on light; darkest surface |
| `--navy` | `#1A3A42` | Dark surfaces (nav, hero) |
| `--teal` | `#1B5A6B` | Primary brand color |
| `--teal-deep` | `#154754` | Accent dark |
| `--coral` | `#FF6B6B` | Primary CTA, italic accents on light |
| `--coral-deep` | `#E85555` | Hover |
| `--ball` | `#D4F748` | Tennis-ball yellow — the "moment" accent (status dots, ball markers, accepted-state top stripe) |
| `--cream` | `#F5F1E8` | Body background |
| `--cream-warm` | `#EFE9DA` | Subtle alt surface |
| `--ink-soft` | `#3E5258` | Secondary text |

### Type
- **Serif:** Cormorant Garamond (display, h1–h4, italic emphasis)
- **Sans:** Hanken Grotesk (body, nav, buttons, eyebrows)

### Italic accent convention
Inside any headline, `<em>` renders italic Cormorant in **coral** on light backgrounds and **ball-yellow** on dark backgrounds. Automatic via CSS — don't override.

### Voice
Active, specific, warm. Em-dashes liberally. No emoji. Mid-flight imperatives over abstractions. Specificity beats poetry.

---

## User roles & permissions

| Role | Access | Auth model |
|---|---|---|
| **Public** | Marketing pages, application form, friend invite (token-gated) | None |
| **Member** | `status.html`, `accepted.html`, `confirmation.html`, `manage-seat.html`, `post-event-sparks/match/no-mutuals.html` | Magic link to email; 30-day session |
| **Friend (token)** | `friend-invite.html` only, via tokenized URL | One-time token; expires in 7 days |
| **Admin · Founder** | All admin pages, all member data | Magic link + role check |
| **Admin · Reviewer** (future) | Inbox + applications only | Same |
| **Admin · Read-only** (future) | Dashboard, roster (view) | Same |

**Use Supabase Row Level Security:**
- Members can read/write their own `users`, `applications`, `sparks_picks` rows only
- Admins (role flag) can read everything except raw one-way `sparks_picks` (only computed `mutuals`)
- `sparks_picks` table: write-only from member, read-only from server-side mutual computation function. **No admin UI should ever surface a non-mutual pick.**

---

## APIs & SaaS integrations

Recommended provider stack — all chosen for being privacy-respecting, cost-effective, and DX-friendly.

| Concern | Provider | Notes |
|---|---|---|
| **Hosting + framework** | Vercel + Next.js 15 (App Router) | Pages convert 1:1; SSG for marketing |
| **DB + auth** | Supabase | Postgres + magic-link auth + RLS + Storage |
| **Payments** | Stripe | PaymentIntents with `manual` capture for the hold pattern |
| **Email** | Resend + React Email | Templates mirror `email-templates.html` design |
| **SMS** | Twilio | Day-of address SMS + founder hotline (single number) |
| **Analytics** | Plausible (or PostHog) | Privacy-respecting. No FB pixel, no GA, no ad pixels. |
| **Error monitoring** | Sentry | Frontend + serverless |
| **CDN / DNS / WAF** | Cloudflare | Free tier fine |
| **Background jobs** | Inngest (or Trigger.dev) | T-48h reveals, T+1 sparks, friend invite expiry, mutual computation |
| **Image hosting** | Cloudinary (or Vercel Blob) | Founder photos, event photos, OG cards |
| **OG card generation** | `@vercel/og` | Per-volume recap dynamic OG images |
| **Search** | Postgres full-text (good enough for admin roster); upgrade to Typesense if needed | |
| **Calendar (.ics)** | Hand-rolled — no provider needed | |
| **Newsletter** | Resend Audiences (keeps email in one place) | Avoid Mailchimp — different aesthetic than your brand |

### Stripe specifics
- Customer per user
- One PaymentIntent per application side, `amount: 14500` (cents), `capture_method: manual`
- Webhooks: `payment_intent.requires_capture`, `payment_intent.canceled`, `charge.refunded`, `charge.dispute.created`
- On admin accept: `paymentIntent.capture()` both sides atomically
- On admin reject: `paymentIntent.cancel()` both sides
- On member cancel >72h before: `refund.create()`
- Inside 72h: case-by-case via reply-to-email + manual refund

---

## Database

### Postgres schema (sketched in v1, extended here)

Already-defined tables:
- `volumes` — event metadata (date, doors, venue, speaker, capacity, status)
- `users` — applicant profile (name, email, dietary, photo_consent, sms_consent, room_tease_optin)
- `applications` — the pair, vouches, payment intents, decision, seat numbers
- `reviews` — admin decisions log
- `emails_sent` — transactional email audit

**Additions needed:**

```sql
CREATE TABLE sparks_picks (
  id              uuid PRIMARY KEY,
  picker_user_id  uuid REFERENCES users(id),
  picked_user_id  uuid REFERENCES users(id),
  volume_id       uuid REFERENCES volumes(id),
  kind            text NOT NULL,   -- 'date' | 'connect' | 'both'
  created_at      timestamptz DEFAULT now(),
  -- Strict RLS: picker can read own; service role can compute mutuals; nobody else
  UNIQUE (picker_user_id, picked_user_id, volume_id)
);

CREATE TABLE mutuals (
  id              uuid PRIMARY KEY,
  volume_id       uuid REFERENCES volumes(id),
  user_a_id       uuid REFERENCES users(id),
  user_b_id       uuid REFERENCES users(id),
  kind            text NOT NULL,   -- 'date' | 'connect' | 'both'
  computed_at     timestamptz DEFAULT now(),
  intro_sent_at   timestamptz,
  intro_held_until timestamptz,    -- 7 days from computed_at
  archived_at     timestamptz,
  UNIQUE (volume_id, user_a_id, user_b_id)
);

CREATE TABLE dispatch_issues (
  id            uuid PRIMARY KEY,
  issue_number  int UNIQUE NOT NULL,
  title         text NOT NULL,
  dek           text,
  body_md       text,                 -- markdown body
  hero_kind     text,                 -- gradient variant
  published_at  timestamptz,
  read_minutes  int,
  status        text                  -- 'draft' | 'published'
);

CREATE TABLE speaker_pitches (
  id              uuid PRIMARY KEY,
  name            text, email text, current_role text,
  story_pitch     text, preferred_volume text, context_link text,
  status          text DEFAULT 'new', -- 'new' | 'replied' | 'booked' | 'passed'
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE photos (
  id           uuid PRIMARY KEY,
  volume_id    uuid REFERENCES volumes(id),
  url          text NOT NULL,
  caption      text,
  is_wide_shot boolean DEFAULT true,    -- privacy default
  uploaded_at  timestamptz DEFAULT now()
);
```

### Migrations
Use Supabase migration files or Drizzle ORM. Keep migrations versioned in repo.

### Backups
Supabase auto-backups daily. Enable point-in-time recovery (paid tier — worth it once you have real applications).

---

## Background jobs & automation

These are critical — most of the system runs on scheduled jobs, not user actions.

| Job | When | Action |
|---|---|---|
| `friend_invite_reminder` | T+48h after invite, if friend hasn't submitted | Send `friend_reminder` email (one only) |
| `friend_invite_expire` | T+7d after invite, if friend hasn't submitted | Release applicant's hold, mark application `expired`, send applicant a note |
| `address_reveal` | T-48h before event date | Send `address_reveal` email to confirmed attendees |
| `day_of_sms` | 10:00 AM day of event, if `sms_consent=true` | Send SMS via Twilio |
| `sparks_prompt` | 9:00 AM Sunday after event | Send `sparks_prompt` email to attendees |
| `compute_mutuals` | 8:00 AM Tuesday after event | Compute mutuals, send `mutual_match` emails or `no_mutuals` page links |
| `intro_archive` | 7d after a mutual is computed and held | Archive mutual if no intro sent |
| `auto_roll_rejected` | When a volume opens | Add all `rejected` apps to the new volume's review pool |
| `dispatch_send` | Quarterly, manually triggered | Send the Dispatch to subscribers |

**Recommended:** Inngest. Type-safe, retries, audit-friendly. Trigger.dev is fine alternative.

**Don't scrape LinkedIn / Twitter** for applicant context. Even though it's tempting, the trust contract is "we know what you told us, nothing more." Surface only what they typed.

---

## Email & SMS triggers

See `email-templates.html` for all 10 designed templates. Build each as a React Email component.

| Kind | Trigger | Recipient |
|---|---|---|
| `application_received` | Applicant submits | Applicant |
| `friend_invitation` | On above | Friend (via token URL) |
| `friend_reminder` | T+48h, friend hasn't | Friend |
| `friend_submitted` | Friend submits | Applicant |
| `accepted` | Admin accepts pair | Both (personalized) |
| `not_this_volume` | Admin rejects | Both |
| `address_reveal` | T-48h cron | Confirmed attendees |
| `day_of_sms` | Day-of cron, sms_consent=true | SMS to phone |
| `sparks_prompt` | T+1 Sunday 9 AM | Attendees |
| `mutual_match` | Tuesday mutuals run | Both sides of each mutual |

**Subject lines** are in the showcase file — copy them exactly. They've been tuned.

---

## Pattern library & CSS

### Keep `assets/doubles.css` as-is

The token-driven system in that file is the foundation. Don't migrate to Tailwind — the custom-property approach is intentional and brand-coherent.

### When you move to React/Next

Reach for **CSS Modules** or **vanilla-extract**. Both preserve the custom-property system cleanly. Avoid CSS-in-JS at runtime (Emotion, styled-components) — it'll hurt your Lighthouse scores and obscure the brand tokens.

### Component library to extract

Build these as reusable React components — they appear across 5+ pages each:

| Component | Where it appears |
|---|---|
| `<Nav>` / `<AdminBar>` | Every page (member + admin) |
| `<Footer>` | Every member page |
| `<EyebrowBadge>` (`.eyebrow`) | Everywhere |
| `<StatusPill>` | inbox, status, intros, volumes |
| `<PersonAvatar>` / `<PairAvatars>` | inbox, application, roster, sparks, match, intros |
| `<NightCard>` (schedule timeline) | accepted, confirmation, volley page |
| `<DecisionBar>` (sticky bottom) | admin-application |
| `<SideCard>` / `<SideCardDark>` | application-submitted, friend-invite, accepted, status |
| `<MemoryQuote>` / `<VouchCard>` | sparks tiles, match, admin-application |
| `<StatusStrip>` (4-stage) | submitted, status, accepted |
| `<CompositionBar>` | roster, dashboard |
| `<EmailEnvelope>` (for React Email) | all 10 email templates |

### Email-specific CSS

Use **React Email** with table-based layouts (Gmail/Outlook compat). Mirror the visual treatment from `email-templates.html`. Inline styles only.

### Print stylesheets

Two pages should have `@media print` rules — `confirmation.html` (the night brief, attendees print it) and `admin-roster.html` (the kitchen sheet). Plus PDF-export endpoints for both.

---

## JavaScript & interaction design

### Philosophy
**Keep it light.** Most pages should work without JavaScript. Progressive enhancement everywhere.

### Per-page interactions

| Page | JS needs |
|---|---|
| `apply.html`, `friend-invite.html` | Form validation, Stripe Elements |
| `accepted.html` | Preferences auto-save (optimistic UI), .ics download, copy email-me-this |
| `post-event-sparks.html` | Toggle picks; auto-save per pick; running counts |
| `post-event-match.html` | Send-intro confirmation modal |
| `status.html` | Magic-link form; Tweaks panel for auth-model comparison (already wired) |
| `admin-inbox.html` | Filter pills, search, pagination |
| `admin-application.html` | Sticky decision bar, **keyboard nav** (`A`/`R`/`F`/`J`) |
| `admin-roster.html` | Filter pills, search, sort, CSV export trigger |
| `door-checkin.html` | Mark arrived (optimistic), search, real-time count refresh |
| `admin-dashboard.html` | Real-time activity feed via Supabase Realtime |

### Animation tier
The pulse on "Building the room" eyebrow is the **right tier of motion** — subtle, conveys liveness, doesn't compete. Use it for: live status indicators, address-reveal pill, real-time admin updates. Don't add hero scroll-jacking, parallax, or marketing-tier animation.

### Real-time
**Supabase Realtime** for: admin dashboard activity feed, applications inbox count, door check-in arrivals. Free, fast, no Pusher needed.

### Loading states
**Skeleton screens** for admin tables; not spinners. Use coral pulse on shimmer.

---

## SEO strategy

### Strategy
The marketing pages are the SEO surface. They should rank for:
- "private dating events San Francisco"
- "curated dating dinner SF"
- "founder dating events"
- "alternative to dating apps SF"
- And — once Maya speaks — her name + Doubles

### Tactics

**Static export for marketing pages.** Use Next.js SSG for all 12 marketing files. They never need server-side data. LCP target: <1.5s.

**Per-page meta tags.** Each marketing page needs:
- `<title>` (already in the design files — keep them)
- `<meta name="description">` (already in design)
- `<meta property="og:image">` — generate per page; per-volume for recaps
- `<meta name="twitter:card" content="summary_large_image">`
- Canonical URL

**JSON-LD structured data:**
- `Organization` on every page (name, logo, sameAs links)
- `Event` on every volume page (date, location — high-level only, no address)
- `Article` on every Dispatch issue
- `Person` on speaker reveal (after-the-fact, on recap)

**Sitemap & robots.** Generate `sitemap.xml` from page list. `robots.txt` blocks admin paths.

**Content gravity wells.** The two SEO assets that compound:
1. **`recap-vol-01.html` + future recaps.** Every completed volume = one new editorial page. By Vol. 10 you have 10 pages of "the night we had" content with named speakers, real numbers, real quotes. **This is the moat.**
2. **`dispatch.html` + individual issues.** Quarterly essays compound. Each is a fresh page on the domain.

**Don't:**
- Keyword stuff. Let the editorial copy do it. The brand voice is the SEO.
- Generate AI fluff content for "topical authority." It will hurt the brand.
- Add a /blog/ — you have the Dispatch. Don't dilute.

**OG card generation.** Use `@vercel/og` to dynamically render per-recap OG cards in the brand. Critical for Twitter / LinkedIn share quality.

---

## Marketing integrations

**Inbound:**
- UTM tracking on Dispatch newsletter links (`?utm_source=dispatch&utm_campaign=04`)
- Referral tracking via clean URLs (`/r/jamie-lin` → cookie → on apply, prefill `referred_by`)
- Twitter / LinkedIn share buttons on `recap-*.html` only (not on marketing pages — feels forced)

**Outbound:**
- Resend Audiences for the Dispatch list (single provider, lower CAC)
- Posthog for funnel: home → apply → submit → accepted → attended → mutual

**Don't integrate:**
- Facebook Pixel / Meta Ads — wrong audience signal
- Google Ads conversion tracking — same
- Intercom / chat widgets — breaks the editorial register
- Hotjar / session replays — privacy contract violation

---

## Luma integration

**Don't.** The application flow is custom-owned. We considered Luma in v1 and explicitly removed it.

**If you ever need a Luma presence:** create a read-only "discover" Luma event linking back to `apply.html`. Treat Luma as marketing SEO surface, not the application path.

---

## User flow & state machines

### Application state machine
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

### Volume lifecycle
```
announced → applications_open → applications_closed → in_review →
confirmed_roster → completed
```

### Mutual lifecycle
```
computed → intro_held (7d) → intro_sent | archived
```

---

## Functional requirements per page

See v1 for `apply.html`, `friend-invite.html`, `application-submitted.html`, `accepted.html`, `not-this-volume.html`, `confirmation.html`, `status.html`.

**Newly designed pages — quick notes:**

- **`manage-seat.html`** — Three actions: Swap +1 (releases friend, sends gracious note, issues new invite); Cancel (releases both, refund if >72h); Update prefs (links to accepted page). All "soft delete" pattern — don't actually delete users.
- **`check-your-email.html`** — Post magic-link-request interstitial. Server-side rate-limit the resend link (1/min).
- **`404.html`** — Static. No dynamic content.
- **`post-event-no-mutuals.html`** — Renders the same data shape as `post-event-match.html` but for users with zero mutuals. Display the user's own pick count (which they know) but **never** show whether anyone picked them.
- **`door-checkin.html`** — Mobile-first. Server-side search via Supabase. Mark arrived = optimistic POST. Auto-refresh stats every 30s.
- **`recap-vol-01.html`** — Generated per completed volume. Pulls: volume metadata, computed stats (mutual count, % stayed past 9, average conversation hours), 1 consent-flagged love-story quote, 12 wide-shot photos, 4 anonymous "overheard" quotes (founders collect via post-event form).
- **`dispatch.html`** — Lists from `dispatch_issues` table; each issue card links to `/dispatch/{issue-slug}`.
- **`speak.html`** — Form submits to `speaker_pitches` table. Resend notification to founders.
- **`press.html`** — Mostly static. The boilerplate "Copy" buttons should write to clipboard. Logo/photo downloads are direct file links.
- **`admin-dashboard.html`** — Server-side render on load; Supabase Realtime for activity feed and pulse counts.
- **`admin-roster.html`** — Server-side render. "Export CSV" + "Kitchen sheet" → API endpoints generating CSV/PDF.
- **`admin-volumes.html`** — CRUD on `volumes` table. Edit details modal pattern.
- **`admin-intros.html`** — **Critical:** queries `mutuals` table only. **NEVER** join into `sparks_picks` from this page. If a debugging panel ever needs to surface one-way picks, gate behind a separate `superadmin` role flag.

---

## Operating instructions for maintenance

### Daily
- Skim `admin-dashboard.html` for pulse items
- Reply to any speaker pitches / contact form inquiries within 24h (brand promise)
- Monitor Stripe disputes via Stripe dashboard

### Weekly
- Review pending applications in `admin-inbox.html` (target: nothing waiting >3 days)
- Send a manual reminder to any friend pending >5 days

### Per-volume cycle (~3 months)
- **Day 0:** Open applications via `admin-volumes.html`
- **Week 1–8:** Review apps as they come in; flag tough calls
- **Week 6:** Book speaker (target: book by 2 weeks out)
- **Week 7:** Confirm venue
- **Week 11:** Close apps at 25 confirmed (5-seat wait-list buffer)
- **T-48h:** Address reveal email goes automatically — verify it sent
- **T-24h:** Day-of SMS scheduled — verify queue
- **T-2h:** Founder hotline number live; one founder on call
- **Night of:** Open `door-checkin.html` on a tablet at the door
- **Sunday 9 AM:** Sparks prompt fires — verify it sent
- **Tuesday 8 AM:** Mutuals computed — manually skim `admin-intros.html`

### Quarterly
- Write & send the next Dispatch issue
- Review Stripe payout reconciliation
- Rotate magic-link signing secret (Supabase) — sessions persist via JWT so users aren't kicked

### Security cadence
- Never log Stripe `payment_intent_id` with PII in the same line
- Audit `sparks_picks` access quarterly — only the picker and the server-side mutual function should appear in query logs
- Magic-link token entropy: 32 bytes minimum
- Rate-limit: 5 magic-link sends per email per hour

---

## Additional functionality not yet designed

These weren't in scope for Waves 1–3 but you'll want them eventually:

| Surface | Priority | Notes |
|---|---|---|
| **Admin Settings** | Med | Team management, brand asset uploads, default volume config, rotate secrets |
| **Photo gallery (private, attendees-only)** | Med | Gated by member auth; opt-in to be in the gallery |
| **Post-event founder review** | Med | Internal form — 4 founders fill out "how was the night" notes |
| **Individual Dispatch issue pages** | Med | `/dispatch/{slug}` — long-form essay layout |
| **Refer-someone flow** | Low | Non-applicants submit a friend's info; we email an invite |
| **Speaker CRM** | Low | Pipeline view of speaker outreach |
| **Vendor management** | Low | Catering, photographer, venue host contacts |
| **iCal feed for confirmed attendees** | Low | Auto-updating calendar subscription |
| **Day-of attendee directory** (in-night, anonymous) | Low | Phone-friendly "remind me who that person is" tool |
| **Mobile app** | Don't | Email + web is fine. Don't build native. |

---

## Implementation priorities

### Phase 1 — Marketing + waitlist
Deploy static marketing pages, wire newsletter, get domain + SSL.

### Phase 2 — Application flow (critical path)
`apply.html` → DB → Stripe hold → `application-submitted.html` → basic admin

### Phase 3 — Friend flow
Tokenized invite emails, `friend-invite.html`, pair review state

### Phase 4 — Decisions
`admin-application.html`, accept/reject → Stripe capture/cancel → `accepted.html` / `not-this-volume.html`

### Phase 5 — Night-of
`confirmation.html` (T-48h job), `door-checkin.html`, day-of SMS

### Phase 6 — Authenticated experience
`status.html` magic-link, `manage-seat.html`

### Phase 7 — Post-event flow
`post-event-sparks.html`, mutual computation, `post-event-match.html` + `post-event-no-mutuals.html`, `admin-intros.html`

### Phase 8 — Admin completion
`admin-dashboard.html`, `admin-roster.html`, `admin-volumes.html`

### Phase 9 — Marketing flywheel
`recap-vol-01.html`, `dispatch.html`, `speak.html`, `press.html`

### Phase 10 — Polish
404, `check-your-email.html`, OG cards, sitemap, structured data, real photography

---

## Things to never change

- Terminology lock (Volume / Volley / Match / Doubles / Launch)
- 6–9 PM event window
- Open-buffet, dinner-party format (NOT seated/plated)
- Speaker private until the night; revealed only on post-event recap
- Address private until T-48h
- $145 / refund-if-rejected pricing
- Two-sided application; each pays separately
- Hero tagline "Good people. Great matches." + Footer "Doubles, not solos."
- Code of Conduct tone (warm, not chaperone-y)
- Brand colors, type families, italic-emphasis convention
- **The mutual-only privacy contract** — one-way picks are never shown to anyone, including admins, ever. This is a security boundary, not a policy.

---

## Open questions

1. Email provider — confirm Resend?
2. Stripe account live yet?
3. Founder names — Di, Sam, Theo are placeholders. Real names?
4. Friend invite token expiry — 7 days. Confirm.
5. Photographer for events — known vendor?
6. Domain — `doubles.singles` confirmed?
7. Admin reviewer permissions — single role or graduated (founder / reviewer / read-only)?
8. Refund window — 72h before doors. Confirm.
9. Will you ever want public co-host credits (e.g. "Vol. 03 hosted with [partner]")?
10. Photo gallery — what's the privacy posture? Default opt-in or default off?

---

## Final notes

- Test every page at 1280px+ first; mobile breakpoints exist but are functional, not polished.
- `design-system.html` is the type/color/component visual reference — keep it for internal use.
- When in doubt, **ask the user.** They have strong opinions on copy, tone, and product. They'd rather be asked than guess.

Build it well.

— Design team
