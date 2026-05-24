# Doubles Web App — Architecture & Implementation Strategy

**Author's Note:** This document combines Claude Design's detailed specifications (HANDOFF.md v2) with technical architecture recommendations for building a production-grade web application. Every page, state machine, API, and integration is mapped to specific technology choices and architectural patterns.

**Status:** Architecture approved. Ready for Phase 1 implementation.

---

## Executive Summary

**Doubles** is transitioning from static design prototypes to a fully dynamic web application supporting:
- 12 public marketing pages (SEO-optimized static export)
- 8-page member application flow with dual-sided Stripe payment
- 6-page admin suite with real-time collaboration
- 3-page post-event matching experience
- Automated email/SMS lifecycle at 9 critical points

**Recommended Tech Stack:**
- **Frontend:** Next.js 15 (App Router) + React + CSS Modules
- **Backend:** Supabase (Postgres + Magic Links + RLS)
- **Payments:** Stripe (PaymentIntents, manual capture)
- **Email:** Resend + React Email components
- **SMS:** Twilio
- **Background Jobs:** Inngest (or Trigger.dev)
- **Hosting:** Vercel (automatic deployments)
- **Analytics:** Plausible (privacy-respecting)
- **Image CDN:** Cloudinary or Vercel Blob
- **Real-time:** Supabase Realtime

**Implementation Approach:** 10 phased deliverables over 12–16 weeks, validated against design files at each step. Zero breaking changes to visual design.

---

## Why This Stack?

### Frontend: Next.js 15 (App Router) + React + CSS Modules

**Rationale:**
- **SSG for marketing:** All 12 marketing pages are static (no real-time data). Next.js SSG pre-renders them as HTML at build time → served from Vercel CDN at <50ms.
- **Dynamic pages as dynamic routes:** Member and admin pages use `[userId]`, `[volumeId]`, `[applicationId]` dynamic segments.
- **App Router readiness:** Next.js 15 includes Streaming, Suspense, async Server Components — critical for real-time admin dashboard without the overhead of client-side hydration.
- **CSS Modules (not Tailwind):** The design system uses CSS custom properties (`--teal`, `--coral`, `--ball`, etc.). CSS Modules preserve this token-driven approach, whereas Tailwind would require rewriting the entire design.
- **No CSS-in-JS:** Emotion/styled-components add runtime overhead. CSS Modules ship as static `.css` files.
- **Vercel Edge Middleware:** Real-time rate-limiting on magic-link endpoints; authentication checks without round-trips.

**Not Next.js alternatives:**
- Remix: Overkill; adds complexity without benefit for this use case.
- SvelteKit: Smaller ecosystem; harder to find contractors.
- Astro: Better for static-first, but you need client-side interactivity on many pages.

### Backend: Supabase

**Rationale:**
- **Postgres + Auth + RLS in one:** Eliminates separate auth service. Magic links built-in.
- **Row-level security (RLS):** Critical for the privacy contract. Members see only their own applications. Admins can't see one-way `sparks_picks`. These rules live in the database, not in application code.
- **Realtime subscriptions:** Admin dashboard sees live application counts, door check-in arrivals, and mutual computation progress without polling.
- **Storage for photos:** Attendee avatars, event gallery photos.
- **Migrations:** First-class support. Track schema changes in git.
- **Cost:** ~$25/mo for database + auth at this scale.

**Not Firebase / Firestore:**
- Lacks RLS granularity needed for privacy contract.
- More expensive at this scale.
- Postgres is more powerful for reporting (admin roster CSV export).

**Not AWS RDS + Cognito:**
- More infrastructure to manage.
- Cognito magic links are more complex to implement.

### Payments: Stripe

**Rationale:**
- **PaymentIntents + manual capture:** You collect $145 from each side on application submit. Only charge if both accept. This is the "hold" pattern — perfect for Stripe `capture_method: manual`.
- **Webhooks:** Automatic refunds when applications expire or are rejected.
- **Dispute handling:** Critical for high-net-worth demographic who may have competing cards.
- **Reporting:** Native CSV exports for reconciliation.

**Setup:**
```
On applicant submit:
  → Create PaymentIntent (amount: 14500 cents, capture_method: 'manual')
  → User confirms via Stripe Elements
  → PaymentIntent status: requires_capture

On admin accept (both sides):
  → Atomic: capture() both PaymentIntents + send accepted emails
  
On admin reject or friend expires:
  → Cancel PaymentIntent → no charge ever posted
```

### Email: Resend + React Email

**Rationale:**
- **React Email components:** Mirror the visual design from `email-templates.html`. Build each template as a `.tsx` component.
- **Type-safe:** Components prevent copy drift.
- **Inline CSS:** Gmail/Outlook compatible via table-based layouts.
- **Resend Audiences:** Single provider for Dispatch newsletter list (lower CAC).
- **Testing:** Component-level snapshots; preview in Resend dashboard before sending.

**10 templates to build (from HANDOFF.md):**
1. `application_received` (applicant)
2. `friend_invitation` (friend, tokenized)
3. `friend_reminder` (friend, T+48h)
4. `friend_submitted` (applicant, when friend accepts)
5. `accepted` (both)
6. `not_this_volume` (both)
7. `address_reveal` (confirmed, T-48h)
8. `day_of_sms` (SMS via Twilio, 10 AM)
9. `sparks_prompt` (attendees, T+1 Sunday 9 AM)
10. `mutual_match` (both, Tuesday 8 AM)

### SMS: Twilio

**Rationale:**
- **Day-of address delivery:** Members opt into SMS on `accepted.html`. 10 AM day-of, they get a text with the address.
- **Founder hotline:** Single Twilio number for all event nights. Attendees can text questions. Routable to on-call founder.

**Volume:** ~30 SMS per event. Cost negligible (~$0.01/SMS).

### Background Jobs: Inngest

**Rationale:**
- **Type-safe job definitions:** Define jobs in TypeScript, call them from anywhere.
- **Retries + exponential backoff:** If a friend invite email fails, Inngest retries 3x with exponential backoff.
- **Audit trail:** Every job execution logged. Easy to debug "why wasn't the address revealed?"
- **Cron triggers:** 9 critical jobs run on schedule (friend_invite_reminder, address_reveal, sparks_prompt, compute_mutuals, etc.).

**Not Bull / BullMQ:**
- Requires Redis to maintain.
- Inngest is managed; no infrastructure.

**Not AWS Lambda + EventBridge:**
- More AWS operational overhead.
- Inngest is purpose-built for this pattern.

### Image CDN: Cloudinary or Vercel Blob

**Rationale:**
- **Attendee avatars:** Members upload photos on `accepted.html`. Stored in Supabase Storage, cached via CDN.
- **Event photos:** Founder uploads 12 wide-shot photos post-event. Hosted on CDN for recap pages.
- **OG card generation:** Dynamic per-volume OG cards for Twitter/LinkedIn shares.

**Choice:** Start with Vercel Blob (simpler), upgrade to Cloudinary if you need advanced transforms (cropping, smart AI fills).

### Analytics: Plausible

**Rationale:**
- **Privacy-respecting:** No third-party cookies. No consent banner needed.
- **GDPR/CCPA compliant:** Important for founders who care about privacy.
- **Focused metrics:** Funnel (apply → submit → accepted), traffic sources, UTM tracking.
- **Not Google Analytics / Segment:** These are surveillance-grade tools. Wrong brand signal.

---

## Database Schema

### Core Tables (from HANDOFF.md v2)

```sql
-- Users / members
CREATE TABLE users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL UNIQUE,
  name                  text,
  phone                 text,
  dietary_restrictions  text,
  photo_url             text,
  photo_consent         boolean DEFAULT false,   -- consent to appear in gallery
  sms_consent           boolean DEFAULT false,   -- consent for day-of SMS
  room_tease_optin      boolean DEFAULT false,   -- consent for "room teaser" emails
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Event volumes (quarterly)
CREATE TABLE volumes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number                int NOT NULL UNIQUE,     -- Vol. 01, Vol. 02, etc.
  name                  text NOT NULL,           -- "Founding Launch", etc.
  status                text NOT NULL,           -- 'announced' | 'open' | 'closed' | 'reviewing' | 'confirmed' | 'completed'
  doors_date            date NOT NULL,
  doors_time_start      time DEFAULT '18:00',
  doors_time_end        time DEFAULT '21:00',
  venue_name            text,
  venue_address         text,                    -- NULL until T-48h
  venue_lat             float,
  venue_lng             float,
  capacity              int DEFAULT 30,
  speaker_id            uuid REFERENCES users(id),
  speaker_public_at     timestamptz,            -- when speaker name revealed (post-event only)
  created_at            timestamptz DEFAULT now()
);

-- Applications (the pair + payment state)
CREATE TABLE applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id             uuid NOT NULL REFERENCES volumes(id),
  applicant_user_id     uuid NOT NULL REFERENCES users(id),
  friend_user_id        uuid REFERENCES users(id),
  status                text NOT NULL DEFAULT 'draft',  
    -- 'draft' → 'submitted' → 'friend_pending' → 'both_submitted' → 'reviewing' 
    -- → 'accepted_unconfirmed' → 'accepted_confirmed' → 'accepted_address_sent' 
    -- → 'attended' | 'no_show'
  
  -- Payment
  applicant_payment_intent_id  text,            -- Stripe PaymentIntent
  friend_payment_intent_id     text,
  
  -- Friend invite
  friend_invite_token          text UNIQUE,     -- 32-byte hex
  friend_invite_sent_at        timestamptz,
  friend_invite_expires_at     timestamptz,     -- T+7d
  friend_submitted_at          timestamptz,
  
  -- Admin decision
  admin_decision               text,             -- 'pending' | 'accepted' | 'rejected'
  admin_decision_at            timestamptz,
  
  -- Seating
  applicant_seat_number        int,
  friend_seat_number           int,
  
  -- Preferences (saved by members)
  preferred_dietary            text,
  preferred_dietary_friend     text,
  
  created_at                   timestamptz DEFAULT now(),
  updated_at                   timestamptz DEFAULT now(),
  
  UNIQUE(volume_id, applicant_user_id, friend_user_id)
);

-- Post-event picks (one-way, privacy-critical)
CREATE TABLE sparks_picks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_user_id  uuid NOT NULL REFERENCES users(id),
  picked_user_id  uuid NOT NULL REFERENCES users(id),
  volume_id       uuid NOT NULL REFERENCES volumes(id),
  kind            text NOT NULL,   -- 'date' | 'connect' | 'both'
  created_at      timestamptz DEFAULT now(),
  
  UNIQUE(picker_user_id, picked_user_id, volume_id)
);

-- Computed mutuals (admin-only visibility)
CREATE TABLE mutuals (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id         uuid NOT NULL REFERENCES volumes(id),
  user_a_id         uuid NOT NULL REFERENCES users(id),
  user_b_id         uuid NOT NULL REFERENCES users(id),
  kind              text NOT NULL,   -- 'date' | 'connect' | 'both'
  computed_at       timestamptz DEFAULT now(),
  intro_sent_at     timestamptz,
  intro_held_until  timestamptz,     -- 7 days from computed_at
  archived_at       timestamptz,
  
  UNIQUE(volume_id, user_a_id, user_b_id)
);

-- Admin reviews / decisions log
CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES applications(id),
  admin_user_id   uuid NOT NULL REFERENCES users(id),
  decision        text NOT NULL,  -- 'accepted' | 'rejected' | 'flagged'
  notes           text,
  decided_at      timestamptz DEFAULT now()
);

-- Newsletter / dispatch
CREATE TABLE dispatch_issues (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number  int UNIQUE NOT NULL,
  title         text NOT NULL,
  dek           text,
  body_md       text,                 -- markdown
  hero_kind     text,                 -- gradient variant
  published_at  timestamptz,
  read_minutes  int,
  status        text,                 -- 'draft' | 'published'
  created_at    timestamptz DEFAULT now()
);

-- Speaker pitches
CREATE TABLE speaker_pitches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL,
  current_role    text,
  story_pitch     text NOT NULL,
  preferred_volume text,
  context_link    text,
  status          text DEFAULT 'new', -- 'new' | 'replied' | 'booked' | 'passed'
  created_at      timestamptz DEFAULT now()
);

-- Event photos
CREATE TABLE photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id    uuid REFERENCES volumes(id),
  url          text NOT NULL,
  caption      text,
  is_wide_shot boolean DEFAULT true,
  uploaded_at  timestamptz DEFAULT now()
);

-- Transactional email audit
CREATE TABLE emails_sent (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  kind            text NOT NULL,  -- matches email template kind
  volume_id       uuid REFERENCES volumes(id),
  data            jsonb,          -- email variables (personalized name, etc)
  sent_at         timestamptz DEFAULT now(),
  status          text DEFAULT 'sent'  -- 'sent' | 'bounced' | 'complained'
);
```

### Row-Level Security (RLS) Rules

**Critical privacy rules:**

```sql
-- Users table: members see only themselves
CREATE POLICY "users_see_self"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

-- sparks_picks: picker can see own picks; admins CANNOT see
CREATE POLICY "sparks_picks_write_own"
  ON sparks_picks FOR INSERT
  WITH CHECK (auth.uid() = picker_user_id);

CREATE POLICY "sparks_picks_read_own"
  ON sparks_picks FOR SELECT
  USING (auth.uid() = picker_user_id);

-- No one should ever see one-way picks except in the mutual_computation function (server-side only)

-- mutuals: admins see all; members see only their mutuals
CREATE POLICY "mutuals_admins_see_all"
  ON mutuals FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "mutuals_members_see_theirs"
  ON mutuals FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- applications: members see own; admins see all
CREATE POLICY "applications_see_own"
  ON applications FOR SELECT
  USING (auth.uid() = applicant_user_id OR auth.uid() = friend_user_id);

CREATE POLICY "applications_admins_see_all"
  ON applications FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');
```

---

## User Authentication & Authorization

### Magic Link Flow

**Why magic links?**
- No password reuse across services.
- Users don't forget passwords.
- Single sign-on across all Doubles flows.
- 30-day session duration reduces signup friction (less re-auth).

**Implementation (Supabase + Vercel Edge Middleware):**

```typescript
// pages/api/auth/send-magic-link.ts
export async function POST(req: Request) {
  const { email } = await req.json();
  
  // Rate-limit: 5 per email per hour (Vercel Edge)
  const rateLimitKey = `magic-link:${email}`;
  const recentAttempts = await redis.get(rateLimitKey);
  if (recentAttempts && recentAttempts > 5) {
    return json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  
  // Send magic link via Resend
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
  
  // Store token in Supabase
  await supabase.from('magic_links').insert({
    email,
    token,
    expires_at: new Date(expiresAt).toISOString(),
  });
  
  // Send email
  await resend.emails.send({
    from: 'apply@doubles.singles',
    to: email,
    subject: 'Your Doubles sign-in link',
    html: magicLinkTemplate({ url: `https://doubles.singles/auth/verify?token=${token}` }),
  });
  
  return json({ success: true });
}

// pages/auth/verify.ts (catch-all route)
export async function GET({ params: { token } }) {
  const { data: link } = await supabase
    .from('magic_links')
    .select('email')
    .eq('token', token)
    .single();
  
  if (!link || new Date(link.expires_at) < new Date()) {
    return redirect('/status?error=link_expired');
  }
  
  // Create JWT via Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: link.email,
    password: link.token, // Use token as temporary password
  });
  
  if (error) return redirect('/status?error=auth_failed');
  
  // Set session cookie (Vercel)
  cookies().set('doubles_session', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  
  return redirect('/status'); // Redirect to authenticated status page
}
```

### Roles & Permissions

| Role | Access | Auth Method |
|---|---|---|
| **Public** | Marketing pages, apply form, friend token links | None |
| **Member** | Member pages (`/status`, `/accepted`, `/confirmation`) | Magic link |
| **Admin** | Admin suite, all member data, application review | Magic link + role check |

**Role flag in JWT:**
```sql
-- On user creation, set role in custom claims
UPDATE auth.users 
SET user_metadata = jsonb_set(user_metadata, '{role}', '"member"')
WHERE id = $1;

-- For admins:
UPDATE auth.users 
SET user_metadata = jsonb_set(user_metadata, '{role}', '"admin"')
WHERE email IN ('you@example.com', 'coadmin@example.com');
```

**Middleware check (Vercel Edge):**
```typescript
// middleware.ts (runs on every request)
export function middleware(req: NextRequest) {
  const token = req.cookies.get('doubles_session')?.value;
  const isAdmin = token ? jwtDecode(token).role === 'admin' : false;
  
  if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/status', req.url));
  }
}
```

---

## Payment Flow

### Stripe Integration

**Setup:**
```typescript
// lib/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// API: Create payment intent on application submit
// api/applications/create.ts
export async function POST(req: Request) {
  const { applicant_email, applicant_name, volume_id } = await req.json();
  
  // 1. Create Stripe customer
  const customer = await stripe.customers.create({
    email: applicant_email,
    name: applicant_name,
  });
  
  // 2. Create PaymentIntent (hold, don't capture yet)
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    amount: 14500, // $145.00 in cents
    currency: 'usd',
    capture_method: 'manual', // Critical: don't charge until admin accepts
    metadata: {
      volume_id,
      applicant_email,
    },
  });
  
  // 3. Save to Supabase
  const { data: application } = await supabase
    .from('applications')
    .insert({
      volume_id,
      applicant_user_id: (await supabase.auth.getUser()).data.user.id,
      status: 'draft',
      applicant_payment_intent_id: paymentIntent.id,
    })
    .select()
    .single();
  
  return json({
    paymentIntentClientSecret: paymentIntent.client_secret,
    applicationId: application.id,
  });
}

// On frontend: collect card via Stripe Elements
// components/PaymentForm.tsx
export function PaymentForm({ paymentIntentClientSecret }) {
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret: paymentIntentClientSecret,
      redirect: 'if_required',
    });
    
    if (confirmError) {
      setError(confirmError.message);
    } else {
      // Payment captured (intent status: requires_capture)
      // Friend invite sent at this point
      navigate('/application-submitted');
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Submit Application</button>
    </form>
  );
}
```

**Admin Accept / Reject:**
```typescript
// api/admin/applications/[id]/decide.ts
export async function POST(req: Request, { params: { id } }) {
  const { decision } = await req.json(); // 'accepted' | 'rejected'
  
  const { data: app } = await supabase
    .from('applications')
    .select('applicant_payment_intent_id, friend_payment_intent_id, applicant_user_id, friend_user_id')
    .eq('id', id)
    .single();
  
  if (decision === 'accepted') {
    // Capture both payment intents
    const [applicantCapture, friendCapture] = await Promise.all([
      stripe.paymentIntents.capture(app.applicant_payment_intent_id),
      stripe.paymentIntents.capture(app.friend_payment_intent_id),
    ]);
    
    // Update application status
    await supabase.from('applications').update({
      status: 'accepted_unconfirmed',
      admin_decision: 'accepted',
      admin_decision_at: new Date(),
    }).eq('id', id);
    
    // Send accepted emails (both sides)
    await sendEmail('accepted', app.applicant_user_id, { volumeNumber: vol.number });
    await sendEmail('accepted', app.friend_user_id, { volumeNumber: vol.number });
    
  } else if (decision === 'rejected') {
    // Cancel both payment intents (no charge)
    await Promise.all([
      stripe.paymentIntents.cancel(app.applicant_payment_intent_id),
      stripe.paymentIntents.cancel(app.friend_payment_intent_id),
    ]);
    
    // Update application status
    await supabase.from('applications').update({
      status: 'rejected',
      admin_decision: 'rejected',
      admin_decision_at: new Date(),
    }).eq('id', id);
    
    // Send rejection emails
    await sendEmail('not_this_volume', app.applicant_user_id);
    await sendEmail('not_this_volume', app.friend_user_id);
  }
  
  return json({ success: true });
}
```

**Stripe Webhooks (handle async events):**
```typescript
// api/webhooks/stripe.ts
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'charge.dispute.created': {
      // Alert admin to dispute
      await sendEmail('admin_alert_dispute', 'admin@doubles.singles', {
        charge_id: event.data.object.charge,
      });
      break;
    }
    case 'charge.refunded': {
      // Log refund
      await supabase.from('emails_sent').insert({
        recipient_email: event.data.object.billing_details.email,
        kind: 'refund_processed',
        data: { amount: event.data.object.amount },
      });
      break;
    }
  }
  
  return json({ received: true });
}
```

---

## State Machines

### 1. Application Lifecycle

```
draft → submitted → friend_pending → both_submitted → reviewing
                                                        ↓
                                            accepted_unconfirmed
                                                        ↓
                                            accepted_confirmed (member confirms attendance)
                                                        ↓
                                            accepted_address_sent (T-48h, address revealed)
                                                        ↓
                                            attended | no_show

  [Alternative path: rejected → rejected (final; may auto-roll to next volume)]
```

**State transitions:**
- `draft → submitted`: Applicant submits form + pays $145 hold. Friend invite sent. `friend_user_id` still null.
- `submitted → friend_pending`: Waiting for friend to click tokenized link.
- `friend_pending → both_submitted`: Friend submits form + pays $145 hold.
- `both_submitted → reviewing`: Admin's turn.
- `reviewing → accepted_unconfirmed`: Admin approves both payments captured. Confirmation email sent to both.
- `accepted_unconfirmed → accepted_confirmed`: Member confirms attendance (clicking link in email or visiting `accepted.html`).
- `accepted_confirmed → accepted_address_sent`: T-48h cron fires. Address revealed. SMS option explained.
- `accepted_address_sent → attended | no_show`: Night-of event. Marked via `door-checkin.html`.
- `reviewing → rejected`: Admin declines. Both payments cancelled. No charge posts. Auto-roll offered.

### 2. Volume Lifecycle

```
announced → applications_open → applications_closed → in_review →
confirmed_roster → completed
```

**Transitions:**
- `announced → applications_open`: Founder sets volume live in `admin-volumes.html`. Applications page live.
- `applications_open → applications_closed`: Manually closed when 25 accepted (wait-list buffer). No new applications accepted.
- `applications_closed → in_review`: Admin reviews remaining queue.
- `in_review → confirmed_roster`: Admin confirms final roster. Address locked. Catering finalized.
- `confirmed_roster → completed`: Event happens. Post-event sparks flow triggered.

### 3. Mutual Lifecycle

```
computed → intro_held (7 days) → intro_sent | archived
```

**Process (Tuesday 8 AM, Inngest cron):**
1. Compute mutuals from `sparks_picks` table.
2. Insert into `mutuals` with `intro_held_until = now() + 7 days`.
3. Send `mutual_match` emails to both sides.
4. Intro email contains "Click here to say hi" link → routes to `/intros/[mutualId]` where they can send a message.
5. After 7 days (if no intro sent): archive the mutual (preserve privacy).

---

## Background Jobs (Inngest)

**Critical jobs to implement:**

| Job | Trigger | Action |
|---|---|---|
| `friend_invite_sent` | On application submit | Send friend invite email with tokenized link |
| `friend_reminder` | T+48h after invite | Send 1x reminder if friend hasn't clicked |
| `friend_invite_expire` | T+7d after invite | Release applicant's hold if friend never responded |
| `address_reveal` | T-48h before event | Send address to confirmed attendees |
| `day_of_sms` | 10 AM day of event | Send SMS with address + hotline if opted-in |
| `sparks_prompt` | Sunday 9 AM post-event | Prompt attendees to rate connections |
| `compute_mutuals` | Tuesday 8 AM post-event | Compute mutual picks; send match notifications |
| `intro_archive` | 7 days after mutual computed | Archive expired intros (preserve privacy) |
| `auto_roll_rejected` | When new volume opens | Add rejected applicants to new volume pool |

**Implementation with Inngest:**

```typescript
// inngest/functions.ts
import { inngest } from './client';
import { Resend } from 'resend';

export const friendInviteSent = inngest.createFunction(
  { id: 'friend-invite-sent' },
  { event: 'application.submitted' },
  async ({ event, step }) => {
    const { application_id, applicant_email, friend_email } = event.data;
    
    // Step 1: Generate token
    const token = await step.run('generate-token', () => {
      return crypto.randomBytes(32).toString('hex');
    });
    
    // Step 2: Save token to DB
    await step.run('save-token', async () => {
      return await supabase.from('applications').update({
        friend_invite_token: token,
        friend_invite_sent_at: new Date(),
        friend_invite_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).eq('id', application_id);
    });
    
    // Step 3: Send email (with retry)
    await step.run('send-email', async () => {
      return await resend.emails.send({
        from: 'invites@doubles.singles',
        to: friend_email,
        subject: 'You're invited to Doubles',
        html: friendInviteTemplate({
          inviteUrl: `https://doubles.singles/friend-invite?token=${token}`,
        }),
      });
    });
  }
);

export const friendReminder = inngest.createFunction(
  { id: 'friend-reminder' },
  { cron: 'TZ=America/Los_Angeles 0 2 * * *' }, // 2 AM PST daily
  async ({ step }) => {
    // Find all applications where:
    // - friend_invite_sent_at is exactly T+48h ago
    // - friend hasn't submitted yet (friend_user_id is null)
    const { data: pendingFriends } = await step.run('find-pending', async () => {
      return await supabase
        .from('applications')
        .select('id, applicant_user_id, friend_email')
        .eq('status', 'friend_pending')
        .lt('friend_invite_sent_at', new Date(Date.now() - 48 * 60 * 60 * 1000))
        .gt('friend_reminder_sent_at', null) // Haven't already reminded
        .limit(100);
    });
    
    for (const app of pendingFriends) {
      await step.run(`remind-${app.id}`, async () => {
        return await resend.emails.send({
          from: 'invites@doubles.singles',
          to: app.friend_email,
          subject: '⏰ Your friend is waiting',
          html: friendReminderTemplate({ inviteUrl: '...' }),
        });
      });
      
      await step.run(`mark-reminded-${app.id}`, async () => {
        return await supabase.from('applications').update({
          friend_reminder_sent_at: new Date(),
        }).eq('id', app.id);
      });
    }
  }
);

export const addressReveal = inngest.createFunction(
  { id: 'address-reveal' },
  { cron: 'TZ=America/Los_Angeles 22 0 * * *' }, // 10 PM PT (runs T-48h for June 21 event at 6 PM PT)
  async ({ step }) => {
    // Find volumes where doors_date - 2 days = today
    const { data: volumes } = await step.run('find-volumes', async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      
      return await supabase
        .from('volumes')
        .select('id, doors_date, venue_address')
        .eq('status', 'confirmed_roster')
        .eq('doors_date', targetDate.toISOString().split('T')[0]);
    });
    
    for (const vol of volumes) {
      // Find all confirmed attendees
      const { data: attendees } = await step.run(`attendees-${vol.id}`, async () => {
        return await supabase
          .from('applications')
          .select('applicant_user_id, friend_user_id')
          .eq('volume_id', vol.id)
          .eq('status', 'accepted_confirmed');
      });
      
      for (const attendee of attendees) {
        for (const userId of [attendee.applicant_user_id, attendee.friend_user_id]) {
          const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
          
          await step.run(`send-address-${userId}`, async () => {
            return await resend.emails.send({
              from: 'events@doubles.singles',
              to: user.email,
              subject: '🏡 Your address for Saturday',
              html: addressRevealTemplate({ address: vol.venue_address }),
            });
          });
        }
      }
    }
  }
);

export const computeMutuals = inngest.createFunction(
  { id: 'compute-mutuals' },
  { cron: 'TZ=America/Los_Angeles 0 8 * * 2' }, // 8 AM PT Tuesdays
  async ({ step }) => {
    // Find volumes completed yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: volumes } = await step.run('find-completed', async () => {
      return await supabase
        .from('volumes')
        .select('id')
        .eq('status', 'completed')
        .lt('doors_date', yesterday.toISOString());
    });
    
    for (const vol of volumes) {
      await step.run(`compute-${vol.id}`, async () => {
        // Call Postgres function to compute mutuals
        return await supabase.rpc('compute_mutuals_for_volume', {
          volume_id: vol.id,
        });
      });
      
      // Query newly computed mutuals
      const { data: mutuals } = await step.run(`fetch-mutuals-${vol.id}`, async () => {
        return await supabase
          .from('mutuals')
          .select('id, user_a_id, user_b_id, kind')
          .eq('volume_id', vol.id)
          .is('intro_sent_at', null);
      });
      
      // Send emails
      for (const mutual of mutuals) {
        for (const userId of [mutual.user_a_id, mutual.user_b_id]) {
          const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
          const otherUserId = userId === mutual.user_a_id ? mutual.user_b_id : mutual.user_a_id;
          
          await step.run(`send-match-${userId}`, async () => {
            return await resend.emails.send({
              from: 'matches@doubles.singles',
              to: user.email,
              subject: '🎾 You matched!',
              html: mutualMatchTemplate({ kind: mutual.kind, mutualId: mutual.id }),
            });
          });
        }
      }
    }
  }
);
```

**Postgres function for mutual computation:**

```sql
CREATE OR REPLACE FUNCTION compute_mutuals_for_volume(volume_id uuid)
RETURNS TABLE (mutual_count int) AS $$
DECLARE
  picker_id uuid;
  picked_id uuid;
  kind text;
BEGIN
  -- For every pair of attendees in this volume:
  FOR picker_id, picked_id, kind IN
    SELECT p1.picker_user_id, p1.picked_user_id, p1.kind
    FROM sparks_picks p1
    INNER JOIN sparks_picks p2 ON
      p1.picker_user_id = p2.picked_user_id
      AND p1.picked_user_id = p2.picker_user_id
      AND p1.volume_id = p2.volume_id
      AND p1.volume_id = compute_mutuals_for_volume.volume_id
  LOOP
    -- Insert mutual (check both orderings to avoid duplicates)
    INSERT INTO mutuals (volume_id, user_a_id, user_b_id, kind, computed_at, intro_held_until)
    VALUES (
      compute_mutuals_for_volume.volume_id,
      LEAST(picker_id, picked_id),
      GREATEST(picker_id, picked_id),
      kind,
      now(),
      now() + INTERVAL '7 days'
    )
    ON CONFLICT (volume_id, user_a_id, user_b_id) DO NOTHING;
  END LOOP;
  
  -- Return count
  SELECT COUNT(*) INTO mutual_count FROM mutuals 
  WHERE volume_id = compute_mutuals_for_volume.volume_id;
  
  RETURN QUERY SELECT mutual_count;
END;
$$ LANGUAGE plpgsql;
```

---

## Frontend Architecture

### Directory Structure

```
doubles/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  // /
│   │   ├── about/page.tsx            // /about
│   │   ├── volley/page.tsx           // /volley
│   │   ├── events/page.tsx           // /events
│   │   ├── faq/page.tsx              // /faq
│   │   ├── contact/page.tsx          // /contact
│   │   ├── terms/page.tsx            // /terms
│   │   ├── privacy/page.tsx          // /privacy
│   │   ├── code-of-conduct/page.tsx  // /code-of-conduct
│   │   ├── dispatch/page.tsx         // /dispatch
│   │   ├── dispatch/[slug]/page.tsx  // /dispatch/issue-01
│   │   ├── speak/page.tsx            // /speak
│   │   └── press/page.tsx            // /press
│   │
│   ├── (auth)/
│   │   ├── apply/page.tsx            // /apply
│   │   ├── friend-invite/page.tsx    // /friend-invite?token=xxx
│   │   ├── check-your-email/page.tsx // /check-your-email
│   │   └── auth/verify/page.tsx      // /auth/verify?token=xxx
│   │
│   ├── (member)/
│   │   ├── status/page.tsx           // /status
│   │   ├── accepted/page.tsx         // /accepted
│   │   ├── application-submitted/page.tsx
│   │   ├── confirmation/page.tsx     // /confirmation
│   │   ├── manage-seat/page.tsx      // /manage-seat
│   │   ├── post-event-sparks/page.tsx
│   │   ├── post-event-match/page.tsx
│   │   └── post-event-no-mutuals/page.tsx
│   │
│   ├── (admin)/
│   │   ├── admin/page.tsx            // /admin (dashboard)
│   │   ├── admin/inbox/page.tsx      // /admin/inbox
│   │   ├── admin/application/[id]/page.tsx
│   │   ├── admin/roster/page.tsx
│   │   ├── admin/volumes/page.tsx
│   │   ├── admin/intros/page.tsx
│   │   └── door-checkin/page.tsx
│   │
│   ├── api/
│   │   ├── applications/create.ts
│   │   ├── applications/[id]/submit-friend.ts
│   │   ├── applications/[id]/decide.ts
│   │   ├── auth/send-magic-link.ts
│   │   ├── auth/verify.ts
│   │   ├── webhooks/stripe.ts
│   │   ├── webhooks/resend.ts
│   │   └── webhooks/twilio.ts
│   │
│   ├── layout.tsx
│   └── 404.tsx
│
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── PaymentForm.tsx
│   ├── ApplicationForm.tsx
│   ├── AdminDecisionBar.tsx
│   ├── SparksToggle.tsx
│   ├── StatusPill.tsx
│   ├── PersonAvatar.tsx
│   ├── NightCard.tsx
│   └── ... (30+ components)
│
├── lib/
│   ├── supabase.ts               // Client + server
│   ├── stripe.ts
│   ├── inngest.ts
│   ├── auth.ts                   // useAuth hook
│   ├── mutations.ts              // Server actions for forms
│   └── utils.ts
│
├── styles/
│   └── globals.css               // Import assets/doubles.css
│
├── emails/
│   ├── ApplicationReceivedEmail.tsx
│   ├── FriendInvitationEmail.tsx
│   ├── AcceptedEmail.tsx
│   ├── MutualMatchEmail.tsx
│   └── ... (10 total)
│
├── public/
│   └── assets/
│       ├── doubles.css           // (from design files)
│       ├── catering-spread.jpg
│       ├── venue-nob-hill.jpg
│       └── ... (venue photos)
│
├── .env.local (dev only, in .gitignore)
├── .env.example
└── tsconfig.json
```

### CSS Architecture

**Do not migrate to Tailwind.** The design uses custom CSS properties:

```css
/* From assets/doubles.css */
:root {
  /* Colors */
  --ink: #14272D;
  --navy: #1A3A42;
  --teal: #1B5A6B;
  --teal-deep: #154754;
  --coral: #FF6B6B;
  --coral-deep: #E85555;
  --ball: #D4F748;
  --cream: #F5F1E8;
  --cream-warm: #EFE9DA;
  --ink-soft: #3E5258;
  --line: rgba(20, 39, 45, 0.06);
  
  /* Typography */
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --w-serif-regular: 400;
  --w-serif-medium: 500;
  --w-serif-bold: 600;
  --w-sans-regular: 400;
  --w-sans-medium: 500;
  --w-sans-bold: 600;
  
  /* Layout */
  --container: 1200px;
  --gutter: clamp(20px, 4vw, 64px);
  
  /* Spacing */
  --sp-xs: 4px;
  --sp-sm: 8px;
  --sp-md: 16px;
  --sp-lg: 24px;
  --sp-xl: 32px;
  --sp-2xl: 48px;
  --sp-3xl: 64px;
  
  /* Border radius */
  --r-sm: 4px;
  --r-md: 8px;
  --r-card: 16px;
  --r-full: 9999px;
}
```

**Use CSS Modules (not vanilla-extract):**

```typescript
// components/Button.module.css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--sans);
  font-weight: var(--w-sans-bold);
  font-size: 13px;
  padding: 16px 26px;
  border-radius: var(--r-md);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.button_primary {
  background: var(--coral);
  color: white;
}

.button_primary:hover {
  background: var(--coral-deep);
}

.button_secondary {
  background: var(--cream-warm);
  color: var(--ink);
}

// components/Button.tsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', children, ...props }) {
  const className = variant === 'primary' ? styles.button_primary : styles.button_secondary;
  return (
    <button className={`${styles.button} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

**Italic accent convention (automatic):**

```css
/* In doubles.css */
h1 em,
h2 em,
h3 em {
  font-style: italic;
  color: var(--coral);
}

/* On dark backgrounds, use --ball instead */
.dark-bg h1 em,
.dark-bg h2 em {
  color: var(--ball);
}
```

---

## Email System (React Email + Resend)

### Template Structure

All 10 templates live in `/emails/` as React components:

```typescript
// emails/ApplicationReceivedEmail.tsx
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text,
} from 'react-email';

interface ApplicationReceivedEmailProps {
  applicantName: string;
  volumeNumber: number;
}

export const ApplicationReceivedEmail = ({
  applicantName,
  volumeNumber,
}: ApplicationReceivedEmailProps) => (
  <Html>
    <Head>
      <title>We got your application</title>
    </Head>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>
            We got your application, <em style={italic}>{applicantName}</em>.
          </Text>
          <Text style={paragraph}>
            Thanks for applying to Vol. 0{volumeNumber}. We'll review your application and your friend's response, then let you know by email.
          </Text>
          <Link href="https://doubles.singles/status" style={link}>
            Check your status
          </Link>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Doubles, not solos.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const applicationReceivedEmailSubject = 'We got your application';

// Styles (inline via react-email)
const main = {
  backgroundColor: '#f5f1e8',
  fontFamily: "'Hanken Grotesk', -apple-system, sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '36px',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 400,
  letterSpacing: '-0.02em',
  color: '#14272d',
  margin: '0 0 24px',
};

const italic = {
  fontStyle: 'italic',
  color: '#ff6b6b',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.65',
  color: '#3e5258',
  margin: '16px 0',
};

const link = {
  color: '#ff6b6b',
  textDecoration: 'underline',
  fontWeight: 600,
};

const footer = {
  fontSize: '12px',
  color: '#888',
  marginTop: '48px',
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '20px 0',
};
```

### Sending via Resend (in Inngest jobs or API routes)

```typescript
import { Resend } from 'resend';
import { ApplicationReceivedEmail, applicationReceivedEmailSubject } from '@/emails/ApplicationReceivedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// In API route or Inngest job:
await resend.emails.send({
  from: 'apply@doubles.singles',
  to: applicantEmail,
  subject: applicationReceivedEmailSubject,
  react: <ApplicationReceivedEmail applicantName={name} volumeNumber={1} />,
});
```

---

## Real-Time Features

### Admin Dashboard Live Updates (Supabase Realtime)

```typescript
// app/(admin)/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [applicationCount, setApplicationCount] = useState(0);
  const [arrivals, setArrivals] = useState([]);
  
  useEffect(() => {
    // Subscribe to applications changes
    const appSubscription = supabase
      .channel('admin_applications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'applications' },
        (payload) => {
          // Recount applications in 'reviewing' status
          setApplicationCount((prev) => prev + 1);
        }
      )
      .subscribe();
    
    // Subscribe to door check-ins
    const doorsSubscription = supabase
      .channel('door_checkins')
      .on(
        'broadcast',
        { event: 'user_arrived' },
        (payload) => {
          setArrivals((prev) => [payload, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(appSubscription);
      supabase.removeChannel(doorsSubscription);
    };
  }, []);
  
  return <div>{applicationCount} pending reviews</div>;
}
```

---

## SEO & Marketing Infrastructure

### Static Export for Marketing Pages

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static HTML output
  reactStrictMode: true,
};

module.exports = nextConfig;
```

**All 12 marketing pages are SSG-exported.** They're uploaded to Vercel CDN at build time.

### Meta Tags & Structured Data

```typescript
// app/(marketing)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doubles — Curated Dating Events for Founders & Investors',
  description: 'Exclusive quarterly dating events for post-exit founders, investors, and operators in San Francisco.',
  openGraph: {
    title: 'Doubles',
    description: 'Exclusive dating events for founders.',
    images: [{ url: '/og-image-home.png' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// app/(marketing)/events/layout.tsx
export async function generateMetadata({ params }) {
  const volume = await getVolume(params.id);
  return {
    title: `Vol. ${volume.number} — Doubles`,
    description: `${volume.name} — Saturday, June 21, 6–9 PM, Twin Peaks.`,
    openGraph: {
      images: [{ url: `/og-image-vol-${volume.number}.png` }],
    },
  };
}
```

### JSON-LD Structured Data

```typescript
// components/StructuredData.tsx
export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Doubles',
          url: 'https://doubles.singles',
          logo: 'https://doubles.singles/logo.png',
          sameAs: [
            'https://twitter.com/doubles',
            'https://linkedin.com/company/doubles',
          ],
        }),
      }}
    />
  );
}

export function EventSchema({ volume }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: volume.name,
          description: 'An exclusive dating event for founders and investors.',
          startDate: `${volume.doors_date}T${volume.doors_time_start}:00`,
          endDate: `${volume.doors_date}T${volume.doors_time_end}:00`,
          eventAttendanceMode: 'OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: volume.venue_name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: volume.venue_address || 'San Francisco, CA',
              addressLocality: 'San Francisco',
              addressRegion: 'CA',
              postalCode: '94117',
              addressCountry: 'US',
            },
          },
          organizer: {
            '@type': 'Organization',
            name: 'Doubles',
            url: 'https://doubles.singles',
          },
        }),
      }}
    />
  );
}
```

### Sitemap & Robots

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing = [
    { url: 'https://doubles.singles', lastModified: new Date(), changeFrequency: 'weekly' },
    { url: 'https://doubles.singles/about', lastModified: new Date(), changeFrequency: 'monthly' },
    { url: 'https://doubles.singles/events', lastModified: new Date(), changeFrequency: 'weekly' },
    // ... 12 marketing pages
  ];
  
  const volumes = await getVolumes();
  const volumePages = volumes.map((vol) => ({
    url: `https://doubles.singles/recap-${vol.number}`,
    lastModified: vol.completed_at,
    changeFrequency: 'never',
  }));
  
  return [...marketing, ...volumePages];
}

// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/webhooks', '/auth/verify'],
      },
    ],
    sitemap: 'https://doubles.singles/sitemap.xml',
  };
}
```

---

## Implementation Roadmap (10 Phases, 12–16 weeks)

### Phase 1: Marketing + Waitlist (Weeks 1–2)
- [ ] Deploy 12 static marketing pages
- [ ] Set up newsletter signup via Resend
- [ ] Meta tags + OG images
- [ ] DNS + SSL on Vercel
- [ ] Plausible analytics
- **Deliverable:** Live at `doubles.singles` with 0 conversions (okay).

### Phase 2: Application Flow (Weeks 2–4)
- [ ] Build `apply.html` → `application-submitted.html` flow
- [ ] Stripe integration (PaymentIntent create)
- [ ] Email: `application_received`
- [ ] Basic admin inbox (view applications)
- **Deliverable:** Real applications flowing through; payment holds visible in Stripe dashboard.

### Phase 3: Friend Invite (Weeks 4–6)
- [ ] Build `friend-invite.html` with tokenized URL
- [ ] Email: `friend_invitation`
- [ ] Inngest: `friend_invite_sent` job
- [ ] Inngest: `friend_reminder` job (T+48h)
- [ ] Inngest: `friend_invite_expire` job (T+7d)
- **Deliverable:** Two-sided flow works; friends can be invited and respond.

### Phase 4: Admin Decisions (Weeks 6–8)
- [ ] Build `admin-application.html` detail view
- [ ] Stripe capture / cancel on accept / reject
- [ ] Email: `accepted` and `not_this_volume`
- [ ] State machine: `reviewing` → `accepted_unconfirmed` | `rejected`
- **Deliverable:** Admin can accept/reject with payments flowing correctly.

### Phase 5: Night-of Experience (Weeks 8–10)
- [ ] Build `confirmation.html` (T-48h address reveal)
- [ ] Inngest: `address_reveal` cron job
- [ ] Inngest: `day_of_sms` job (10 AM event day)
- [ ] Build `door-checkin.html` (mobile/tablet)
- [ ] Supabase Realtime for live arrival counts
- **Deliverable:** First event runs smoothly with address reveal and check-in.

### Phase 6: Member Authentication (Weeks 10–12)
- [ ] Magic-link auth (Supabase + Vercel Edge)
- [ ] Build `status.html` (member dashboard)
- [ ] Build `accepted.html` (preference save)
- [ ] Build `manage-seat.html` (swap +1, cancel)
- [ ] `.ics` download (calendar event)
- **Deliverable:** Members can sign in and manage their attendance.

### Phase 7: Post-Event Matching (Weeks 12–13)
- [ ] Build `post-event-sparks.html` (pick interface)
- [ ] Inngest: `sparks_prompt` cron (T+1 Sunday 9 AM)
- [ ] Postgres function: `compute_mutuals_for_volume()`
- [ ] Inngest: `compute_mutuals` job (Tuesday 8 AM)
- [ ] Build `post-event-match.html` + `post-event-no-mutuals.html`
- [ ] Email: `mutual_match`
- [ ] Build `admin-intros.html` (mutual review)
- **Deliverable:** Post-event matches computed and revealed.

### Phase 8: Admin Suite (Weeks 13–14)
- [ ] Build `admin-dashboard.html` (live feed, real-time updates)
- [ ] Build `admin-roster.html` (CSV export, PDF kitchen sheet)
- [ ] Build `admin-volumes.html` (CRUD for volumes)
- [ ] Real-time pulse on application counts
- **Deliverable:** Full admin experience for operations.

### Phase 9: Marketing Flywheel (Weeks 14–15)
- [ ] Build `recap-vol-01.html` (generated per completed volume)
- [ ] Build `dispatch.html` (newsletter archive)
- [ ] Dynamic OG card generation per recap
- [ ] Build `speak.html` (speaker nominations)
- [ ] Build `press.html` (press kit, logo download)
- **Deliverable:** Content gravity wells set up for SEO.

### Phase 10: Polish & Edge Cases (Week 16)
- [ ] 404 branded error page
- [ ] `check-your-email.html` interstitial
- [ ] Rate-limiting on magic links
- [ ] Error monitoring (Sentry)
- [ ] Performance profiling (Lighthouse)
- [ ] Comprehensive testing
- **Deliverable:** Production-ready web app.

---

## Deployment & DevOps

### Vercel Configuration

```typescript
// vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "@stripe_webhook_secret",
    "RESEND_API_KEY": "@resend_api_key",
    "INNGEST_SIGNING_KEY": "@inngest_signing_key",
    "TWILIO_ACCOUNT_SID": "@twilio_account_sid",
    "TWILIO_AUTH_TOKEN": "@twilio_auth_token"
  }
}
```

### Environment Variables Checklist

```bash
# .env.local (development, never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Database Migrations (Supabase)

```sql
-- migrations/001_initial_schema.sql
-- Run via: supabase migration up

CREATE TABLE volumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'announced',
  doors_date date NOT NULL,
  doors_time_start time DEFAULT '18:00',
  doors_time_end time DEFAULT '21:00',
  venue_name text,
  venue_address text,
  capacity int DEFAULT 30,
  speaker_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- ... (other tables from schema section above)

-- Enable RLS on all tables
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Create RLS policies (see User Authentication section above)
```

**Run migrations locally before deploying:**
```bash
supabase migration new initial_schema
# Edit migrations/001_initial_schema.sql
supabase migration up
supabase db push  # Sync to production
```

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders with primary variant', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: /Click me/i });
    expect(button).toHaveClass('button_primary');
  });
});
```

### Integration Tests (Playwright)

```typescript
// e2e/application-flow.spec.ts
import { test, expect } from '@playwright/test';

test('application flow works end-to-end', async ({ page }) => {
  await page.goto('/apply');
  
  // Fill form
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.click('button:has-text("Submit")');
  
  // Check Stripe modal appears
  await expect(page.locator('.stripe-modal')).toBeVisible();
  
  // Submit payment form (use Stripe test card)
  await page.fill('input[placeholder="Card number"]', '4242 4242 4242 4242');
  // ... etc
});
```

### Database Tests (Supabase CLI)

```typescript
// __tests__/db/applications.test.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

describe('applications table', () => {
  it('prevents non-admin from seeing one-way sparks_picks', async () => {
    // Insert a sparks_pick
    await supabase.from('sparks_picks').insert({
      picker_user_id: 'user-a',
      picked_user_id: 'user-b',
      kind: 'date',
    });
    
    // Query as user-a (should see own)
    const { data: ownPicks } = await supabase
      .from('sparks_picks')
      .select('*')
      .eq('picker_user_id', 'user-a');
    
    expect(ownPicks).toHaveLength(1);
    
    // Query as user-c (should see nothing)
    const { data: otherPicks } = await supabase
      .from('sparks_picks')
      .select('*')
      .eq('picker_user_id', 'user-c');
    
    expect(otherPicks).toHaveLength(0);
  });
});
```

---

## Monitoring & Maintenance

### Error Monitoring (Sentry)

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Postgres(),
    new Sentry.Integrations.Stripe(),
  ],
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV,
});

// Automatic error tracking in API routes + Server Components
```

### Analytics (Plausible)

```typescript
// Track key funnel events
// components/TrackingPixel.tsx
import { useEffect } from 'react';

declare global {
  function plausible(event: string, options?: any): void;
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props: properties });
  }
}

// Usage:
// trackEvent('application_submitted', { volumeNumber: 1 });
```

**Key funnels to track:**
- Home → Apply
- Apply → Friend Invite (sent)
- Friend Submit → Application Reviewing
- Application Accepted → Confirmed
- Attended → Sparks Submitted
- Sparks Submitted → Mutual Match

### Weekly Maintenance Checklist

- [ ] Check Stripe disputes (Stripe dashboard)
- [ ] Review pending applications (admin inbox)
- [ ] Monitor error rate (Sentry)
- [ ] Check email bounce rate (Resend)
- [ ] Review application funnel (Plausible)

---

## Technical Debt & Future Improvements

### Phase 1 Tech Debt (acceptable for launch)

- Manual mutual computation in Postgres; could be optimized to materialized view
- Magic links expire in 24h; could implement refresh tokens for true 30-day sessions
- No attendee photo gallery (designed, not implemented yet)
- No speaker CRM pipeline view

### Phase 2 Optimizations (post-launch)

- Add caching layer (Redis) for frequently queried mutuals
- Move email templates to database (allow founder customization)
- Build photo gallery with privacy controls
- Implement fuzzy search for admin roster
- Add A/B testing framework (Vercel Experiments)

---

## Sign-Off & Next Steps

**This architecture:**
- ✅ Honors Claude Design's specification exactly (HANDOFF.md v2)
- ✅ Uses proven, scalable technology choices
- ✅ Builds for privacy (RLS, no third-party tracking)
- ✅ Optimizes for founder DX (type-safe, strong conventions)
- ✅ Phases delivery into 10 concrete milestones

**Ready to proceed to Phase 1.** The tech stack is approved. The next step is to set up the Vercel + Supabase project and build out the first 12 static marketing pages.

---

**Questions?** Refer to the HANDOFF.md for design specifics. Refer to this document for architecture & code patterns.

Built with intention. —
