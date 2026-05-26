# doubles.singles — Implementation Guide

**Project**: Curated dating events for post-exit founders and high-net-worth singles in SF  
**Stack**: Next.js 14 (App Router), Supabase (Auth + DB), Stripe (Payments), Resend (Email)  
**Deployment**: Vercel (production), doubles.singles (domain)  
**Status**: Phase 1 Complete ✅ — Phase 2 & 3 Ready to Start

---

## Quick Links

- **Live Site**: https://doubles.singles
- **Phase 1 Checkpoint**: [PHASE_1_CHECKPOINT.md](./PHASE_1_CHECKPOINT.md)
- **Phase 2 Plan**: [PHASE_2_PLAN.md](./PHASE_2_PLAN.md)
- **Claude Design Handoff**: doubles_app_handoff/CLAUDE_CODE_HANDOFF.md (in repo)
- **Design Files**: doubles_app_handoff/ (34 HTML files + CSS)

---

## What Is doubles.singles?

**The Product**
- Exclusive dating events for post-exit founders, investors, and high-earning operators in SF
- Bring-a-friend model ensures vetting and gender balance
- Hosted in private founder homes (Twin Peaks, Pacific Heights, etc.)
- Quarterly events, 30 people max, $110–150/person

**The Business Model**
- $99–150/person per event
- $30K–50K ARR potential (2-3 events/month)
- Zero venue costs (founder homes)
- Zero customer acquisition cost (PEF WhatsApp, 1,500 members)
- Built-in network effects (repeat attendees, word-of-mouth)

**The Website**
- 34 pages of marketing, application, admin, and post-event flows
- Fully designed in Claude Design with pixel-perfect CSS
- Multi-step application form
- Admin dashboard for event management
- Post-event connection tools (sparks, match, mutuals)

---

## Architecture

### Pages (34 total)

**Static Marketing Pages** (14 pages — always HTML)
- Homepage, About, Events, Volley, FAQ, Terms, Privacy, Code of Conduct
- Contact, Press, Speak, Design System, 404, Email Templates

**Dynamic Pages** (20 pages — will migrate to Next.js in Phase 2)

*Application Flow:*
- Apply, Status, Friend Invite, Application Submitted, Accepted
- Confirmation, Check Your Email, Manage Seat, Not This Volume

*Post-Event:*
- Post-Event Sparks, Post-Event Match, Post-Event No Mutuals

*Recap:*
- Recap Vol 01

*Operations/Admin:*
- Dispatch, Door Checkin
- Admin Dashboard, Admin Inbox, Admin Application, Admin Roster, Admin Volumes, Admin Intros

### Tech Stack

**Frontend**
- Next.js 14 with App Router
- React Server Components (SSR)
- Static HTML in Phase 1, migrating to dynamic in Phase 2

**Backend**
- Supabase (PostgreSQL + Auth + RLS)
- Stripe (Payment processing)
- Resend (Transactional email)
- Next.js Server Actions for form handling

**Deployment**
- Vercel (production, auto-deploy on git push)
- Domain: doubles.singles

**Design**
- Claude Design (34 pages, pixel-perfect CSS)
- assets/doubles.css (1 source-of-truth stylesheet)
- Responsive, accessible, fast

---

## Project Phases

### Phase 1: Static HTML Scaffold ✅ COMPLETE

**Goal**: Get all 34 pages live on doubles.singles with pixel-perfect rendering

**Approach**:
1. Copy 34 HTML files to `public/`
2. Copy CSS + assets to `public/assets/`
3. Configure URL rewrites in `next.config.js`
4. Minimize Next.js overhead (`app/layout.tsx`, empty `app/globals.css`)
5. Deploy to Vercel
6. Verify all pages render correctly

**Result**: ✅ All 34 pages live, pixel-perfect, zero errors

**Time**: ~2 hours (vs. 6+ hours in previous failed attempt)

### Phase 2: Page Migration to Next.js ⏳ READY TO START

**Goal**: Migrate pages to React server components, add dynamic data only where needed

**Approach**:
1. Start with 3 core pages (homepage, events, apply)
2. Use template-based migration (read HTML file, interpolate tokens)
3. One page per commit, test locally, deploy
4. Keep marketing pages as static HTML forever
5. Build query functions in Phase 3

**Effort**: ~20 hours for all 20 dynamic pages

**Timeline**: Estimated 4-6 sessions at 3-4h each

### Phase 3: Backend Wiring ⏳ NEXT

**Goal**: Connect Supabase, Stripe, Resend, and forms

**Approach**:
1. Supabase schema (volumes, applications, users, intros, sparks)
2. RLS policies (users see only their data)
3. Query functions (getVolumeSeats, listVolumes, getApplicationStatus, etc.)
4. Stripe integration (create intent, hold, capture, cancel)
5. Resend email templates (verification, acceptance, post-event)
6. Form submission APIs (`/api/apply`, `/api/contact`, etc.)
7. Magic-link auth via Supabase

**Effort**: ~8-12 hours

**Timeline**: Estimated 2-3 sessions at 3-4h each

---

## Key Files & Structure

```
doubles/
├── public/
│   ├── *.html              # 34 static HTML files (Phase 1 deliverable)
│   ├── assets/
│   │   ├── doubles.css     # Single source-of-truth stylesheet
│   │   └── images/         # Venue photos
│   └── 404.html            # Error page
│
├── app/
│   ├── layout.tsx          # Minimal root layout
│   ├── globals.css         # Empty placeholder
│   ├── page.tsx            # Will be homepage (Phase 2)
│   ├── actions/            # Server actions (auth, payments, forms)
│   ├── api/                # API routes (init, apply, contact, etc.)
│   ├── lib/                # Utility functions (Supabase, Stripe clients)
│   └── <route>/            # Route groups will be added in Phase 2
│
├── next.config.js          # URL rewrites for clean paths
├── package.json
│
├── PHASE_1_CHECKPOINT.md   # Phase 1 completion summary
├── PHASE_2_PLAN.md         # Phase 2 detailed plan
├── PROJECT_README.md       # This file
│
└── doubles_app_handoff/    # Claude Design deliverables
    ├── HANDOFF.md          # Product spec
    ├── CLAUDE_CODE_HANDOFF.md  # Implementation protocol
    ├── CLAUDE_CODE_KICKOFF_PROMPT.md  # Kickoff prompt
    └── *.html              # Design files (source reference)
```

---

## How to Continue Work

### Starting Phase 2

1. **Read the plan**: Open [PHASE_2_PLAN.md](./PHASE_2_PLAN.md)
2. **Pick a page**: Start with homepage (section "Homepage")
3. **Follow the template**: Copy the migration template exactly
4. **Test locally**: `npm run dev`, verify against `public/index.html`
5. **Commit per page**: `git add -A && git commit -m "Phase 2: Migrate homepage"`
6. **Deploy**: `git push` (auto-deploys to Vercel)
7. **Verify**: Test on https://doubles.singles

### Starting Phase 3

1. **Set up Supabase**: Create tables, RLS policies
2. **Create query functions**: `app/lib/supabase.ts` with helpers
3. **Wire forms**: Implement `/api/apply`, `/api/contact`
4. **Add Stripe**: Create payment intent, webhook handlers
5. **Set up Resend**: Email templates, send logic

---

## Debugging Checklist

**If pages don't render:**
- ✅ Check `doubles.singles` in browser (not localhost)
- ✅ Verify Vercel deployment shows "READY"
- ✅ Check Deployment Protection is disabled
- ✅ Clear browser cache

**If CSS is broken:**
- ✅ Check `public/assets/doubles.css` exists
- ✅ Verify link tag in HTML points to `/assets/doubles.css`
- ✅ Check Next.js rewrites include static assets

**If build fails:**
- ✅ Run locally: `npm run build`
- ✅ Check for TypeScript errors: `npm run type-check`
- ✅ Verify all imports are correct

**If dynamic data doesn't show:**
- ✅ Check Supabase tables exist and have data
- ✅ Verify query function returns correct data
- ✅ Check token replacement in HTML file

---

## Important Rules

**Phase 1 (Complete)**
- ✅ HTML files are final, don't edit them
- ✅ CSS is in `assets/doubles.css`, never duplicate
- ✅ Rewrites in `next.config.js` provide clean URLs

**Phase 2 (Upcoming)**
- ❌ Don't rebuild HTML as React — use `dangerouslySetInnerHTML`
- ❌ Don't add new CSS files — use `assets/doubles.css`
- ❌ Don't migrate all pages at once — one per commit
- ✅ Keep marketing pages as static HTML forever
- ✅ Test locally before pushing
- ✅ Ask user before changing copy

**Phase 3 (Upcoming)**
- ✅ Supabase RLS policies are critical (users see only their data)
- ✅ Stripe must be in "manual capture" mode
- ✅ Forms submit to `/api/*` routes, not client-side
- ✅ Environment variables must be set in Vercel

---

## Contacts & References

**Claude Design**
- Handoff: doubles_app_handoff/CLAUDE_CODE_HANDOFF.md
- All design files: doubles_app_handoff/*.html
- CSS: doubles_app_handoff/assets/doubles.css

**Supabase**
- Project: [doubles in Supabase dashboard]
- Tables: volumes, applications, users, intros, sparks
- RLS policies: [to be configured in Phase 3]

**Stripe**
- Account: [stripe.com/Dashboard]
- Mode: Live (production)
- Webhook: [to be configured in Phase 3]

**Vercel**
- Deployment: https://vercel.com/astronomic/doubles
- Domain: doubles.singles
- Auto-deploy: On git push to main

---

## Session History

| Date | Phase | Status | Duration | Notes |
|------|-------|--------|----------|-------|
| May 10-24 | Initial Build | ❌ Failed | 6+ hours | Rebuilt HTML as React, CSS conflicts, 404 errors |
| May 25 | Phase 1 | ✅ Complete | 2 hours | Used Claude Design's static-first approach, all 34 pages live |
| May 25+ | Phase 2 | ⏳ Ready | 3-4h/session | Homepage, events, apply migrations |
| TBD | Phase 3 | ⏳ Planned | 3-4h/session | Backend wiring (Supabase, Stripe, Resend) |

---

## Success Metrics

**Phase 1** ✅
- [x] All 34 pages render on doubles.singles
- [x] Pixel-perfect match to Claude Design
- [x] No disabled pages
- [x] No CSS conflicts
- [x] Zero build errors

**Phase 2** (In Progress)
- [ ] Homepage shows dynamic seat count
- [ ] Events page lists all volumes
- [ ] Apply form submits to backend
- [ ] All 7 Tier-1 & Tier-2 pages migrated
- [ ] No regressions in static pages

**Phase 3** (Planned)
- [ ] Users can sign up via magic link
- [ ] Stripe payment works end-to-end
- [ ] Post-event pages compute sparks/mutuals correctly
- [ ] Admin dashboard fully functional
- [ ] Email verification and post-event emails send

---

## Questions?

See [PHASE_1_CHECKPOINT.md](./PHASE_1_CHECKPOINT.md) for detailed Phase 1 info.  
See [PHASE_2_PLAN.md](./PHASE_2_PLAN.md) for Phase 2 step-by-step.  
See doubles_app_handoff/ for design files and original handoff docs.

---

**Last Updated**: May 25, 2026  
**Created By**: Claude Code + Claude Design  
**Status**: Phase 1 Complete, Phase 2 Ready to Start ✅
