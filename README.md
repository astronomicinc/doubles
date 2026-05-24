# Doubles Web App

Curated, quarterly dating events for post-exit founders, investors, and operators in San Francisco.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React + TypeScript
- **Styling:** CSS Modules with custom properties (design tokens)
- **Backend:** Supabase (Postgres + Auth + RLS + Storage)
- **Payments:** Stripe (PaymentIntent with manual capture)
- **Email:** Resend + React Email components
- **SMS:** Twilio
- **Background Jobs:** Inngest
- **Hosting:** Vercel
- **Analytics:** Plausible
- **Monitoring:** Sentry

## Project Structure

```
doubles/
├── app/
│   ├── (marketing)/        # Public pages (/, /about, /events, etc.)
│   ├── (auth)/             # Public auth pages (/apply, /friend-invite, etc.)
│   ├── (member)/           # Authenticated member pages (/status, /accepted, etc.)
│   ├── (admin)/            # Admin pages (/admin, /admin/inbox, etc.)
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
├── lib/                    # Utilities, hooks, database clients
├── emails/                 # React Email templates
├── public/assets/          # Design CSS, images
├── styles/                 # Global styles
├── ARCHITECTURE.md         # Full technical blueprint
├── QUICKSTART.md           # Quick reference guide
├── HANDOFF.md              # Product spec (from Claude Design)
└── package.json
```

## Getting Started

### 1. Create `.env.local`

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

You'll need:
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Resend:** `RESEND_API_KEY`
- **Twilio:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Inngest:** `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

```bash
vercel --prod
```

Set environment variables in the Vercel dashboard, then redeploy.

## Architecture Documentation

- **`ARCHITECTURE.md`** — Complete technical blueprint with database schema, state machines, API patterns, code examples, and 10-phase implementation roadmap.
- **`QUICKSTART.md`** — Quick reference guide with setup checklist and common pitfalls.
- **`HANDOFF.md`** — Product specification from Claude Design (visual design + functional requirements).

## Key Features

### Phase 1: Marketing Pages (Live)
- 12 public pages (homepage, about, events, FAQ, etc.)
- Newsletter signup
- SEO-optimized (static export)
- Design system with CSS tokens

### Phase 2–10: Coming Soon
- Application flow with Stripe payment holds
- Friend invitations (tokenized links)
- Admin approval interface
- Night-of event (address reveal, SMS, check-in)
- Member authentication (magic links)
- Post-event matching (sparks, mutuals)
- Admin suite (dashboard, roster, volumes)
- Marketing flywheel (recaps, dispatch newsletter)

## Design & Brand

- **Visual Design:** Preserved exactly from Claude Design files
- **CSS System:** Custom properties (`--teal`, `--coral`, `--ball`, `--cream`, etc.)
- **Typography:** Cormorant Garamond (serif) + Hanken Grotesk (sans)
- **Voice:** Active, specific, warm. Avoid poetry; favor clarity.
- **Terminology:** "Volume" (event), "Volley" (opener), "Match" (romantic connection), "Doubles" (format)

## Database

Schema lives in Supabase Postgres. Key tables:

- `users` — Member profiles
- `volumes` — Events (quarterly)
- `applications` — The pair + payment state
- `sparks_picks` — Post-event one-way picks (privacy-critical: RLS enforced)
- `mutuals` — Computed mutual connections
- `dispatch_issues` — Newsletter archive
- `speaker_pitches` — Speaker nominations
- `photos` — Event photos
- `emails_sent` — Transactional email audit

Row-level security (RLS) rules enforce:
- Members see only their own data
- Admins can't see one-way picks (mutual-only privacy contract)
- Transactional logs are audit-friendly

## Deployment

Hosted on Vercel with automatic deployments from git.

```bash
# Push to main to auto-deploy
git add .
git commit -m "your message"
git push origin main
```

Environment variables are set in the Vercel dashboard; they're not committed to git.

## Development Workflow

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally: `npm run dev`
4. Commit with a clear message: `git commit -m "feat: add comment feature"`
5. Push: `git push origin feature/your-feature`
6. Open a pull request
7. Merge to main (auto-deploys to Vercel)

## Testing

- **Unit tests:** Vitest + React Testing Library
- **Integration tests:** Playwright
- **Database tests:** Supabase CLI + psql

Run tests:

```bash
npm run test          # Unit tests
npm run test:e2e      # Integration tests
```

## Monitoring

- **Errors:** Sentry (frontend + backend)
- **Analytics:** Plausible (privacy-respecting)
- **Logs:** Vercel (automatic)
- **Database:** Supabase (built-in monitoring)

## Support

- Architecture Q's → Read `ARCHITECTURE.md`
- Product Q's → Read `HANDOFF.md` (Claude Design spec)
- Quick reference → Read `QUICKSTART.md`
- Git issues → GitHub Issues

## License

Proprietary. All rights reserved.

---

**Built with care.** — [Learn the full architecture →](./ARCHITECTURE.md)
