# Doubles Web App — Quick Start Guide

**Status:** Architecture finalized. Ready to implement Phase 1.

---

## Your Tech Stack (Approved)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) + React | Static export for marketing; dynamic routes for auth/admin |
| **Styling** | CSS Modules (preserve custom properties) | Design system uses `--teal`, `--coral`, `--ball` tokens |
| **Backend** | Supabase (Postgres + Auth + RLS) | Magic links, row-level security, realtime |
| **Payments** | Stripe (PaymentIntent, manual capture) | $145 hold pattern; capture on accept, cancel on reject |
| **Email** | Resend + React Email | Type-safe components; Dispatch newsletter via Resend Audiences |
| **SMS** | Twilio | Day-of address delivery + founder hotline |
| **Background Jobs** | Inngest (or Trigger.dev) | 9 critical scheduled jobs (friend invites, address reveal, compute mutuals) |
| **Hosting** | Vercel | Automatic deployments from git |
| **Real-time** | Supabase Realtime | Admin dashboard live updates |
| **Analytics** | Plausible | Privacy-respecting; no GA, no pixels |
| **Errors** | Sentry | Frontend + backend monitoring |

---

## What You Have Now

### Design Files
- **34 production HTML files** (static prototypes) in `/Users/chrisbeaman/Downloads/doubles_app_handoff/`
- **Design specification** (`HANDOFF.md` v2) with all requirements
- **CSS system** (`assets/doubles.css`) with all tokens and component styles
- **Email templates** (10 designed, with copy)
- **Venue photos** (4 high-quality images)

### Architecture Documentation
- **`ARCHITECTURE.md`** — Complete technical blueprint (10 phases, database schema, state machines, code patterns)
- **`HANDOFF.md` (from Claude Design)** — Visual design & product requirements (this is the source of truth)
- **Plan (`polymorphic-cuddling-volcano.md`)** — Business strategy & brand messaging

---

## Before You Code: Setup Checklist

- [ ] Create Supabase project (`supabase.com`)
  - Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  - Enable magic link auth
  
- [ ] Create Stripe account (`stripe.com`)
  - Get test keys (for development)
  - Set up webhook endpoint for `/api/webhooks/stripe`
  
- [ ] Create Resend account (`resend.com`)
  - Get API key
  - Create "doubles.singles" branded email domain
  
- [ ] Create Twilio account (`twilio.com`)
  - Get Account SID, Auth Token, phone number
  
- [ ] Create Inngest account (`inngest.com`)
  - Get signing key & event key
  
- [ ] Create Vercel project
  - Link to git repo
  - Add environment variables
  
- [ ] Buy domain (if needed)
  - Point nameservers to Vercel

---

## Project Structure (Create This)

```
doubles/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (member)/
│   ├── (admin)/
│   ├── api/
│   └── layout.tsx
├── components/
├── lib/
├── emails/
├── public/assets/
├── styles/
├── .env.example
├── .env.local (git-ignored)
├── HANDOFF.md (copy from design package)
├── ARCHITECTURE.md (the blueprint above)
└── tsconfig.json
```

---

## Phase 1: Marketing Pages (Weeks 1–2)

**Goal:** Deploy 12 static pages + newsletter signup. Zero dynamic features.

### What to Build
1. Copy all HTML from design package into Next.js routes
2. Import `assets/doubles.css` globally
3. Add meta tags to each page
4. Add newsletter signup to footer

### Key Files to Create
- `app/(marketing)/page.tsx` (/)
- `app/(marketing)/about/page.tsx`
- `app/(marketing)/events/page.tsx` (pull from `volumes` table)
- ... (12 total)
- `components/Nav.tsx`
- `components/Footer.tsx`
- `components/NewsletterSignup.tsx`

### Exact Copy Rules
- **Every headline, button label, and color** must match the design files exactly
- CSS tokens must stay as CSS custom properties (don't convert to Tailwind)
- Typography: Cormorant Garamond (serif) + Hanken Grotesk (sans)
- No design changes without Claude Design approval

### Newsletter Signup (API Route)
```typescript
// app/api/newsletter/subscribe.ts
export async function POST(req: Request) {
  const { email } = await req.json();
  
  // Save to Resend Audiences
  await resend.audiences.create({
    name: 'Dispatch',
    contacts: [{ email, unsubscribed: false }],
  });
  
  return Response.json({ success: true });
}
```

### Deployment
```bash
git init
git add .
git commit -m "Initial: 12 marketing pages + newsletter"
git push origin main

# Vercel auto-deploys
```

**Success Criteria:**
- [ ] All 12 pages live at `doubles.singles`
- [ ] Newsletter signup works (test with fake email)
- [ ] Meta tags + OG images appear in share previews
- [ ] Lighthouse score >90 (mobile + desktop)
- [ ] No console errors

---

## Phase 2: Application Flow (Weeks 2–4)

**Goal:** Real applications flowing through; Stripe payment holds working.

### What to Build
1. `apply.html` → 3-step form (name, email, photo)
2. Stripe PaymentIntent integration
3. Save to `applications` table
4. Send `application_received` email
5. Show `application-submitted.html`

### Key Components
- `components/ApplicationForm.tsx` (3-step form)
- `components/PaymentForm.tsx` (Stripe Elements)
- `app/apply/page.tsx`
- `app/application-submitted/page.tsx`
- `app/api/applications/create.ts`

### Database Migration
```sql
-- Run via supabase cli
CREATE TABLE applications (
  id uuid PRIMARY KEY,
  volume_id uuid,
  applicant_user_id uuid,
  status text DEFAULT 'draft',
  applicant_payment_intent_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
```

### Testing
```bash
# Use Stripe test card: 4242 4242 4242 4242
# Verify payment intent appears in Stripe dashboard
# Verify application saved to Supabase
```

**Success Criteria:**
- [ ] Form submits and creates application
- [ ] Stripe PaymentIntent created (status: requires_capture)
- [ ] Application saved with correct state
- [ ] No charges posted yet (manual capture only)
- [ ] Email sends to applicant

---

## Phase 3+: Refer to ARCHITECTURE.md

Each phase has a detailed section in the architecture document with:
- Exact code examples
- State machine transitions
- Database queries
- Testing approach

---

## Critical Rules (Never Break These)

### Design Fidelity
- ❌ Don't convert CSS to Tailwind
- ❌ Don't change font sizes, colors, or spacing
- ❌ Don't simplify component designs
- ✅ Preserve visual design 100%

### Privacy Contract
- ❌ Never show one-way `sparks_picks` to anyone except picker
- ❌ Never log payment IDs with PII in same line
- ❌ Never access browser history, bookmarks, or saved passwords
- ✅ Row-level security enforces privacy at database level

### Payment Safety
- ❌ Never hardcode Stripe keys (use environment variables only)
- ❌ Never log full credit card numbers
- ✅ Always use `capture_method: manual` for holds
- ✅ Atomic capture on both sides of pair simultaneously

### Copy & Terminology
- ❌ Don't say "singles event" (say "Doubles")
- ❌ Don't say "date match" (say "mutual")
- ✅ Use exact subject lines from email templates
- ✅ Terminology lock in HANDOFF.md is immutable

---

## Common Pitfalls (Avoid These)

1. **CSS Nightmare:** Temptation to simplify design → use Tailwind. Don't. CSS Modules + custom properties is the right choice.

2. **Feature Creep:** Adding things "for better UX" that aren't in the design. Don't. Get design approval first.

3. **Auth Complexity:** Temptation to add password auth. Don't. Magic links only.

4. **Payment Testing:** Using real card numbers in development. Don't. Always use Stripe test cards (4242 4242 4242 4242).

5. **Database Exposure:** Forgetting RLS rules. Check them quarterly; they're your only defense against admin snooping.

---

## Development Environment

### Get Git Set Up
```bash
cd /Users/chrisbeaman/AI/doubles

# Create repo if not already
git init
git remote add origin https://github.com/yourusername/doubles.git

# Create main branch
git checkout -b main

# Create .env.local (git-ignored)
cp .env.example .env.local
# Fill with test credentials
```

### Run Locally
```bash
npm install
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel
```bash
# On first deploy:
vercel --prod

# Set environment variables in Vercel dashboard
# Redeploy automatically on git push
```

---

## Support & Reference

- **Design specification:** `HANDOFF.md` (source of truth)
- **Architecture & code patterns:** `ARCHITECTURE.md` (this repo)
- **Brand strategy:** `/polymorphic-cuddling-volcano.md` (context only)
- **Current codebase:** `/Users/chrisbeaman/AI/doubles/`
- **Design files:** `/Users/chrisbeaman/Downloads/doubles_app_handoff/`

---

## Next Step

1. **Set up Supabase + Stripe test accounts** (30 min)
2. **Create Next.js project in Vercel** (15 min)
3. **Start Phase 1: Copy marketing pages** (aim for EOD)

That's it. The architecture is locked. The design is locked. Time to build.

—
