# Phase 3 Backend Wiring Implementation Plan

**Status**: Planning (Ready for Review)  
**Scope**: Wire backend systems (Auth, Forms, Emails, Payments)  
**Estimated Effort**: 40-50 hours  
**Dependencies**: Phase 2 (pages) completed ✅

---

## Overview

Phase 3 wires the backend systems that unlock the dynamic functionality. All Phase 2 pages become fully interactive:

**Auth System** → Pages like `/status`, `/accepted`, `/confirmation` can fetch user data  
**Form Handlers** → `/api/apply`, `/api/checkin`, etc. process submissions and create/update records  
**Email System** → Confirmation emails, invite reminders, decision notifications  
**Payment Processing** → Stripe payment intents, charge capture on acceptance  

---

## Architecture

### Tech Stack
- **Authentication**: Magic-link via Resend (no passwords, email-based)
- **Forms**: Server Actions + API Routes (/api/*)
- **Email**: Resend.com (API integration)
- **Payments**: Stripe (Intent → Charge flow)
- **Database**: Supabase (PostgreSQL)
- **Session Storage**: Supabase auth + cookies

### Request Flow

```
User → Page (Phase 2) → Form Submit → API Route (Phase 3)
                                        ↓
                                    Database
                                        ↓
                                    Stripe/Resend
                                        ↓
                                    Response → Redirect
```

---

## Phase 3A: Authentication System

### Objective
Enable users to log in via magic link (email-based, no password).

### Components

#### 1. Magic-Link Login Page (`/api/auth/signin`)
- **Endpoint**: `POST /api/auth/signin`
- **Input**: `{ email: string }`
- **Flow**:
  1. User enters email
  2. Generate signed token (valid 24h)
  3. Send email with magic link: `https://doubles.singles/auth/verify?token=XXX`
  4. Return confirmation message

#### 2. Magic-Link Verification (`/api/auth/verify`)
- **Endpoint**: `GET /api/auth/verify?token=XXX`
- **Flow**:
  1. Verify token signature + expiry
  2. Create session (JWT in httpOnly cookie)
  3. Fetch/create user record in Supabase
  4. Redirect to `/status` or user's dashboard

#### 3. Session Management
- **Cookie-based**: `auth_token` (httpOnly, secure, SameSite=Lax)
- **Duration**: 30 days
- **Storage**: Supabase users table + auth sessions table
- **Validation**: Middleware checks token on protected pages

#### 4. Protected Routes Middleware
- **Pages requiring auth**:
  - `/status` → Check session, fetch user's application
  - `/accepted` → Check session, fetch acceptance details
  - `/confirmation` → Check session, fetch event details
  - `/manage-seat` → Check session, fetch current plus-one
  - All admin pages (`/admin/*`) → Check admin role

---

## Phase 3B: Form Handlers & API Routes

### Overview
Each form submission goes to an API route that validates, processes, and responds.

### Forms & Routes

#### 1. Application Submission (`/apply`)
- **Form**: User fills out application (name, age, role, why, plus-one invite)
- **Submit**: `POST /api/apply`
- **Processing**:
  1. Validate user session
  2. Validate form inputs (email, age, role, intro)
  3. Create Stripe PaymentIntent for $145 hold
  4. Insert application record (status: "pending")
  5. Send Resend email to user (confirmation)
  6. Send Resend email to plus-one (invite link)
  7. Return success with token for `/application-submitted`

#### 2. Plus-One Completion (`/api/plus-one/:applicationId`)
- **Form**: Plus-one fills out their side
- **Submit**: `POST /api/plus-one/:applicationId`
- **Processing**:
  1. Validate token (from invite email)
  2. Create separate application record for plus-one
  3. Link both applications (pair relationship)
  4. Send Resend email to user: "Your friend submitted!"
  5. Trigger admin review queue

#### 3. Door Check-In (`/api/checkin`)
- **Form**: Staff enters attendee name at door
- **Submit**: `POST /api/checkin`
- **Processing**:
  1. Validate staff session (door staff role)
  2. Search applications by name/email
  3. Mark application as "checked_in"
  4. Return: attendee info, plus-one name, notes
  5. Update in-room attendance count

#### 4. Manage Plus-One (`/api/manage-seat/:applicationId`)
- **Form**: User changes plus-one (if before T-5 days)
- **Submit**: `POST /api/manage-seat/:applicationId`
- **Processing**:
  1. Validate user owns application
  2. Check event is T-5+ days away
  3. Create new plus-one application
  4. Unlink old plus-one
  5. Send emails to user + new plus-one

#### 5. Admin Application Review (`/api/admin/application/:appId/approve`)
- **Form**: Admin approves/rejects application
- **Submit**: `POST /api/admin/application/:appId/approve` or `/reject`
- **Approve Flow**:
  1. Validate admin session
  2. Check both applications approved
  3. Capture Stripe PaymentIntent → Charge $145 × 2
  4. Update application status: "accepted"
  5. Create pair relationship (if not exists)
  6. Send Resend email to user: "You're in!"
  7. Send Resend email to plus-one: "You're in!"
- **Reject Flow**:
  1. Update application status: "rejected"
  2. Release Stripe hold
  3. Send Resend email: "Not this volume..."

#### 6. Admin Intro Requests (`/api/admin/intros/:introId/approve`)
- **Form**: Admin sends professional intro between attendees
- **Submit**: `POST /api/admin/intros/:introId/approve`
- **Processing**:
  1. Validate admin session
  2. Get both user profiles
  3. Send Resend email to User A: "Meet User B"
  4. Send Resend email to User B: "Meet User A"
  5. Mark intro as "sent"

---

## Phase 3C: Email System Integration

### Resend Setup
- **API Key**: `RESEND_API_KEY` (env var)
- **From Email**: `hello@doubles.singles`
- **Template Library**: 8-12 email templates

### Email Templates

| Template | Event | Recipients | Content |
|----------|-------|-----------|---------|
| **Apply Confirmation** | Application submitted | Applicant + plus-one invite | Timeline, next steps, plus-one link |
| **Plus-One Invite** | Invite sent | Plus-one (via link) | Intro, quick form, deadline |
| **Plus-One Completed** | Friend submitted | Applicant | Friend's name, review timeline |
| **Approved** | Application approved | Applicant + plus-one | Congrats, charge confirmation, event details |
| **Rejected** | Application rejected | Applicant | "Not this volume", refund timeline, next event |
| **Accepted Email** | User accepted event | Applicant | Full event details, plus-one name, dress code |
| **Reminder (T-7 days)** | 7 days before event | Attendees | Final details, address (revealed T-48h) |
| **Address Reveal (T-48h)** | 48 hours before | Attendees | Exact address, parking, entry details |
| **Post-Event Spark Survey** | Event ended | Attendees | "Who did you spark with?" form link |
| **Professional Intro** | Admin sends intro | Two attendees | Mutual introduction, contact info |

---

## Phase 3D: Stripe Payment Processing

### Payment Flow

#### Intent Creation (Application)
```
POST /api/apply
  → Stripe.paymentIntents.create({
      amount: 14500,  // $145 in cents
      currency: 'usd',
      customer: userId,
      metadata: { applicationId, volumeId }
    })
  → Return client_secret to frontend
```

#### Charge Capture (Admin Approval)
```
POST /api/admin/application/:appId/approve
  → Stripe.paymentIntents.confirm(intent_id)
  → Intent auto-captures funds
  → Update application status: "accepted"
```

#### Refund (Admin Rejection)
```
POST /api/admin/application/:appId/reject
  → Stripe.refunds.create({ payment_intent: intent_id })
  → Funds released in 5 business days
```

### Stripe Webhook
- **Endpoint**: `POST /api/webhooks/stripe`
- **Events**:
  - `payment_intent.succeeded` → Update application confirmed_payment = true
  - `charge.refunded` → Update application refunded = true

---

## Phase 3E: Database Schema Extensions

### New Tables

#### `auth_sessions`
```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INT,
  role TEXT,  -- 'founder', 'investor', 'operator', etc.
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

#### `applications` (extend)
```sql
ALTER TABLE applications ADD COLUMN (
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected, accepted
  plus_one_id UUID REFERENCES applications(id),
  pair_id UUID,  -- Links to paired application
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP
);
```

#### `volume_events`
```sql
CREATE TABLE volume_events (
  id UUID PRIMARY KEY,
  volume_id UUID REFERENCES volumes(id),
  event_type TEXT,  -- 'application_submitted', 'approved', 'checkin', etc.
  applicant_id UUID REFERENCES applications(id),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `intros`
```sql
CREATE TABLE intros (
  id UUID PRIMARY KEY,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  volume_id UUID REFERENCES volumes(id),
  status TEXT DEFAULT 'pending',  -- pending, sent, declined
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Timeline

### Phase 3A: Auth (8-10 hours)
Week 1:
- [ ] Supabase magic-link setup
- [ ] `/api/auth/signin` endpoint
- [ ] `/api/auth/verify` endpoint
- [ ] Session middleware
- [ ] Cookie management
- [ ] Protected routes

### Phase 3B: Forms (15-18 hours)
Week 2-3:
- [ ] `/api/apply` form handler
- [ ] `/api/plus-one` completion
- [ ] `/api/checkin` door entry
- [ ] `/api/manage-seat` plus-one change
- [ ] `/api/admin/application/approve|reject`
- [ ] `/api/admin/intros/approve`
- [ ] Form validation + error handling

### Phase 3C: Email (6-8 hours)
Week 3:
- [ ] Resend integration
- [ ] Email template library
- [ ] Email sending functions
- [ ] Testing (send to self)

### Phase 3D: Payments (5-7 hours)
Week 4:
- [ ] Stripe account setup
- [ ] PaymentIntent creation
- [ ] Intent confirmation flow
- [ ] Refund handling
- [ ] Webhook receiver

### Phase 3E: Database (3-4 hours)
Week 1-4 (parallel):
- [ ] Schema migrations
- [ ] Indexes for performance
- [ ] Test data seeds

---

## Testing Strategy

### Unit Tests
- Form validation (empty fields, invalid emails, etc.)
- Token generation + verification
- Stripe Intent creation + confirmation
- Email template rendering

### Integration Tests
- Full application flow (apply → submit → admin approve → charge)
- Magic-link auth flow (send email → click link → logged in)
- Plus-one flow (primary app → invite → plus-one submits → pair created)
- Door check-in (staff logs attendee → marked present)

### Manual Testing Checklist
- [ ] Apply with new email → receive invite → plus-one completes
- [ ] Admin approves → both users charged → receive "accepted" email
- [ ] Stripe intent captured → verify in Stripe dashboard
- [ ] Magic-link login → access protected page → logout
- [ ] Check-in at door → attendance recorded
- [ ] Change plus-one → old relationship deleted, new created
- [ ] Admin sends intro → both users receive email

---

## Environment Variables Needed

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Resend
RESEND_API_KEY=...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Magic-Link Secret
AUTH_SECRET=...  # For signing tokens
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stripe charge fails | User thinks they paid but didn't | Webhook validates all charges, admin dashboard shows status |
| Email service down | Users don't receive invites/confirmations | Retry queue, fallback notifications in app |
| Magic-link expiry too short | Users frustrated | 24-hour validity, "resend link" button |
| Plus-one forgets to submit | Applications stuck in limbo | Send reminder email at T-7 days |

---

## Success Metrics

### By End of Phase 3
- ✅ Users can log in via magic-link email
- ✅ Users can submit applications (Stripe intent created)
- ✅ Admin can approve (funds charged) or reject (refunded)
- ✅ Users receive confirmation + event detail emails
- ✅ Door staff can check in attendees
- ✅ Admin can send professional intros
- ✅ All protected routes only accessible to authenticated users
- ✅ Stripe dashboard shows all charges/refunds

---

## Next Steps

1. **Review this plan** → Confirm approach, ask questions
2. **Set up third-party accounts** (if not done):
   - Resend.com (free tier available)
   - Stripe (test mode for development)
3. **Start Phase 3A** → Auth system first (blocks everything else)
4. **Iterate through phases** → B, C, D in parallel where possible

---

**Ready to implement Phase 3A (Auth System) now?**
