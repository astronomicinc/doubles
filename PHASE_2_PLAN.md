# Phase 2 Plan: Page Migration to Next.js

**Status**: Ready to Start
**Estimated Duration**: 3-4 hours
**Date Started**: (pending)
**Date Completed**: (pending)

---

## Overview

Phase 2 migrates pages from static HTML to Next.js server components, **only where dynamic data is needed**.

The migration uses a template-based approach that reads the static HTML file and interpolates dynamic values via string replacement, preserving pixel-fidelity while adding interactivity.

---

## Pages to Migrate (Priority Order)

### Tier 1: Core Dynamic (Must Migrate)

#### 1. **Homepage** (`/`)
- **File**: `public/index.html`
- **Route**: `app/page.tsx` + `app/layout.tsx`
- **Why**: Display dynamic seat count: "7 of 30 seats left"
- **Dynamic tokens**:
  - `{{seats_remaining}}` — int from `getVolumeSeats('vol-01').remaining`
  - `{{seats_total}}` — int from `getVolumeSeats('vol-01').total`
  - `{{volume_date}}` — formatted date from `getVolumeDate('vol-01')`
  - `{{volume_neighborhood}}` — string from `getVolumeNeighborhood('vol-01')`
- **Effort**: 1-2 hours
- **Test**: Verify seats count updates when applications change

#### 2. **Events** (`/events`)
- **File**: `public/events.html`
- **Route**: `app/events/page.tsx` + `app/events/layout.tsx`
- **Why**: List volumes from Supabase `volumes` table
- **Dynamic tokens**:
  - `{{volume_list}}` — HTML loop of all volumes (may need JSX for this)
- **Effort**: 1.5-2 hours
- **Test**: Add a new volume to Supabase, verify it appears on page

#### 3. **Apply** (`/apply`)
- **File**: `public/apply.html`
- **Route**: `app/apply/page.tsx` + `app/apply/layout.tsx`
- **Why**: Multi-step form, Stripe Elements, dynamic volume info
- **Complexity**: 🔴 High — may need real JSX for form interactivity
- **Dynamic tokens**:
  - `{{volume_name}}` — string
  - `{{volume_date}}` — string
  - `{{volume_neighborhood}}` — string
- **Effort**: 2-3 hours (Stripe integration needed)
- **Test**: Complete apply flow, verify Stripe hold, check DB

### Tier 2: Auth-Gated Pages (After Tier 1)

#### 4. **Status** (`/status`)
- **File**: `public/status.html`
- **Route**: `app/status/page.tsx`
- **Why**: Auth-gated, show user's application history
- **Requires**: Magic-link auth via Supabase
- **Effort**: 1.5-2 hours

#### 5. **Accepted** (`/accepted`)
- **File**: `public/accepted.html`
- **Route**: `app/accepted/page.tsx`
- **Why**: Auth-gated, show pair info, event details
- **Requires**: Auth + Supabase query
- **Effort**: 1-1.5 hours

#### 6. **Confirmation** (`/confirmation`)
- **File**: `public/confirmation.html`
- **Route**: `app/confirmation/page.tsx`
- **Why**: Auth-gated, T-48h reveal
- **Requires**: Auth + time-based conditional render
- **Effort**: 1-1.5 hours

#### 7. **Friend Invite** (`/friend-invite`)
- **File**: `public/friend-invite.html`
- **Route**: `app/friend-invite/[token]/page.tsx`
- **Why**: Tokenized URL, show friend's pair view
- **Requires**: Token validation, URL param extraction
- **Effort**: 1-2 hours

### Tier 3: Member Pages (After Auth Works)

#### 8-12. Admin Pages
- `admin-dashboard`, `admin-inbox`, `admin-application`, `admin-roster`, `admin-volumes`, `admin-intros`
- **Why**: Heavy dynamic content, admin-only
- **Requires**: Admin role check, lots of data queries
- **Effort**: 2-3 hours each (total 10-15 hours)

#### 13-15. Post-Event Pages
- `post-event-sparks`, `post-event-match`, `post-event-no-mutuals`
- **Why**: Show match data, compute mutuals
- **Requires**: Complex queries, per-user data
- **Effort**: 1.5-2 hours each (total 4.5-6 hours)

### Tier 4: Always Static HTML ✅

These pages have **no dynamic content** and should **NEVER migrate**:
- about, faq, terms, privacy, code-of-conduct, contact, press, speak, volley, design-system, 404, email-templates, not-this-volume, check-your-email

Keep them in `public/` forever. They're faster, simpler, and bug-free as static HTML.

---

## Migration Template

### Step 1: Create the Route File

```tsx
// app/<route>/page.tsx
import { readFileSync } from 'node:fs';
import path from 'node:path';

export default async function Page() {
  // 1. Read the static HTML file
  const html = readFileSync(
    path.join(process.cwd(), 'public', '<page>.html'),
    'utf8'
  );

  // 2. Fetch dynamic data from Supabase (example)
  // const seats = await getVolumeSeats('vol-01');
  // const interpolated = html
  //   .replace('{{seats_remaining}}', String(seats.remaining))
  //   .replace('{{seats_total}}', String(seats.total));

  // 3. Render
  return <div dangerouslySetInnerHTML={{ __html: extractBody(html) }} />;
}

function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}
```

### Step 2: Create Layout (if needed)

```tsx
// app/<route>/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '<copy from HTML file>',
  description: '<copy from HTML file>',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/assets/doubles.css" />
      {children}
    </>
  );
}
```

### Step 3: Add Tokens to HTML

```html
<!-- In public/<page>.html -->

<!-- Before: -->
<span class="seats-pill">7 of 30 seats left</span>

<!-- After: -->
<span class="seats-pill">{{seats_remaining}} of {{seats_total}} seats left</span>
```

### Step 4: Smoke Test

1. Run locally: `npm run dev`
2. Hit the URL
3. Compare visually to `public/<page>.html` — must look identical
4. If different, debug the route file (don't edit the HTML)

### Step 5: Deploy & Verify

1. Commit: `git add -A && git commit -m "Phase 2: Migrate <page> to Next.js"`
2. Push: `git push`
3. Wait for Vercel to build
4. Test on https://doubles.singles

### Step 6: Update Tracking

Update the table in Section "Pages to Migrate" — mark as ✅ Complete

---

## Backend Dependencies (Phase 3)

These pages need backend work before they can be fully functional:

| Page | Needs | Phase 3 Task |
|------|-------|-------------|
| `/` | `getVolumeSeats()` query | Query volumes table, compute remaining |
| `/events` | `listVolumes()` query | Fetch all volumes, render list |
| `/apply` | Stripe + Supabase write | Create payment intent, insert application |
| `/status` | Auth + query | Magic-link auth, fetch user's apps |
| `/accepted` | Auth + query | Fetch pair, volume info |
| `/confirmation` | Auth + time logic | T-48h conditional render |
| Admin pages | Auth + multiple queries | Role check, fetch data |
| Post-event | Auth + complex query | Compute sparks/mutuals |

---

## Checkpoint: After Phase 2

When Phase 2 is complete:
- ✅ All 7 Tier-1 & Tier-2 pages migrated to Next.js
- ✅ Static pages still serving from public/
- ✅ Pages render correctly but show placeholder data (will wire up in Phase 3)
- ✅ Forms submit to `/api/*` routes (not yet implemented)
- ✅ Git history shows one commit per page

---

## Estimation Summary

| Tier | Pages | Est. Time | Start | Complete |
|------|-------|-----------|-------|----------|
| Tier 1 | Homepage, Events, Apply | 4-7h | — | — |
| Tier 2 | Status, Accepted, Confirmation, Friend Invite | 5-7h | — | — |
| Tier 3 | Admin (6 pages) | 10-15h | — | — |
| Tier 4 | Static HTML (keep as-is) | 0h | ✅ | ✅ |
| **Total Phase 2** | **~20 pages** | **~20h** | — | — |

---

## Rules for Phase 2

✅ **DO:**
- Migrate one page per commit
- Read the HTML file first, understand structure
- Use `dangerouslySetInnerHTML` to preserve pixels
- Test locally before pushing
- Update rewrite rules in `next.config.js` as pages migrate
- Ask user before changing copy or structure

❌ **DON'T:**
- Migrate all pages at once
- Re-type HTML as JSX (use the template)
- Edit `assets/doubles.css`
- Add new CSS files
- Extract components before all pages migrate
- Disable pages due to errors
- Change page URLs

---

## Next Steps

**When Ready for Phase 2:**

1. Read this file end-to-end
2. Start with homepage migration (Section "Homepage")
3. Follow the template exactly
4. Test locally
5. Deploy and verify
6. Create next session's checkpoint

**Then Phase 3:** Wire up Supabase, Stripe, Resend, forms

---

**Created**: May 25, 2026
**Status**: Ready to Start
**Owner**: Claude Code (next session)
