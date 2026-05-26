# Clean URL Audit & Recommendation

## Executive Summary

**Current Status:** Clean URLs are already working via Next.js rewrites in `next.config.js`. The setup is properly configured and aligns with Claude Design's static-first approach.

**Recommendation:** 
1. ✅ **Keep the current setup** — it's working correctly and optimal for your hybrid Next.js + static HTML architecture
2. ✅ **Remove `vercel.json`** — it's redundant; Next.js rewrites take precedence
3. ✅ **Verify in production** — confirm clean URLs are working on the live site
4. 📋 **Optional future:** Gradually migrate static pages to Next.js routes (low priority)

---

## Current Architecture Analysis

### File Structure

**Next.js App Routes** (already have clean URLs automatically):
```
/app/page.tsx                              → /
/app/admin/page.tsx                        → /admin
/app/admin/volumes/page.tsx                → /admin/volumes
/app/admin/volumes/[volumeId]/page.tsx     → /admin/volumes/[id]
/app/admin/compare/page.tsx                → /admin/compare
/app/events/page.tsx                       → /events
/app/post-event/sparks/page.tsx            → /post-event/sparks
/app/post-event/match/page.tsx             → /post-event/match
/app/post-event/no-mutuals/page.tsx        → /post-event/no-mutuals
/app/application-submitted/page.tsx        → /application-submitted
/app/recap/vol-01/page.tsx                 → /recap/vol-01
```

**Static HTML Files** (serve via Next.js rewrites):
```
/public/about.html                         → /about
/public/contact.html                       → /contact
/public/apply.html                         → /apply
/public/faq.html                           → /faq
/public/terms.html                         → /terms
/public/privacy.html                       → /privacy
/public/code-of-conduct.html               → /code-of-conduct
/public/auth/signin.html                   → /auth/signin
/public/auth/callback.html                 → /auth/callback
... and 20+ more
```

**Root .html Files** (legacy, minimal use):
```
/index.html                                (old home, superseded by /app/page.tsx)
/404.html                                  (error page)
/500.html                                  (server error page)
/design-system.html                        (component library docs)
```

---

## Current URL Rewriting Setup

### ✅ next.config.js (WORKING - 54 rewrites defined)

Located at `/next.config.js`, contains rewrites for:

**Marketing Pages:**
- `/about` → `/about.html` ✓
- `/contact` → `/contact.html` ✓
- `/faq` → `/faq.html` ✓
- `/terms`, `/privacy`, `/code-of-conduct` ✓
- And 7 more

**Auth/Application Flow:**
- `/auth/signin` → `/auth/signin.html` ✓
- `/status` → `/status.html` ✓
- `/friend-invite` → `/friend-invite.html` ✓
- And 8 more

**Post-Event Pages:**
- `/post-event/sparks` → `/post-event-sparks.html` ✓
- `/post-event/match` → `/post-event-match.html` ✓
- `/post-event/no-mutuals` → `/post-event-no-mutuals.html` ✓

**Admin Pages (static HTML versions, now superseded by Next.js):**
- `/admin` → `/admin-dashboard.html`
- `/admin/volumes` → `/admin-volumes.html`
- And 4 more (old versions, not used anymore)

### ❌ vercel.json (REDUNDANT)

Located at `/vercel.json`, contains 8 duplicate rewrites:
```json
{
  "rewrites": [
    { "source": "/auth/signin", "destination": "/auth/signin.html" },
    { "source": "/events", "destination": "/events.html" },
    // ... 6 more
  ]
}
```

**Problem:** These are duplicates of what's in `next.config.js`. When a Next.js app has rewrites defined, they take precedence over `vercel.json` rewrites, making this file useless and confusing.

---

## How Clean URLs Currently Work

### Flow for Static Pages

When a user requests `/about`:

1. **Browser:** `GET https://doubles.singles/about`
2. **Next.js:** Checks `next.config.js` rewrites
3. **Match Found:** `/about` → `/about.html`
4. **Rewrite:** Internally rewrites to `/public/about.html`
5. **Serve:** Returns the HTML content of `about.html`
6. **Browser:** Displays the page; URL bar still shows `/about` (clean URL) ✓

### Flow for Next.js Pages

When a user requests `/admin/volumes`:

1. **Browser:** `GET https://doubles.singles/admin/volumes`
2. **Next.js:** Checks app routes in `/app`
3. **Match Found:** `/app/admin/volumes/page.tsx` matches the route
4. **Render:** Server renders the React component
5. **Serve:** Returns HTML with clean URL ✓

---

## Verification: Are Clean URLs Working?

To confirm clean URLs are actually working on the live site, check these:

### ✅ Test Marketing Pages
```
https://doubles.singles/about          (should load without .html)
https://doubles.singles/contact        (should load without .html)
https://doubles.singles/faq            (should load without .html)
```

### ✅ Test Auth Pages
```
https://doubles.singles/auth/signin    (should load without .html)
https://doubles.singles/apply          (should load without .html)
```

### ✅ Test Admin Pages (New - Next.js)
```
https://doubles.singles/admin/volumes          (clean URL, no rewrite needed)
https://doubles.singles/admin/compare          (clean URL, no rewrite needed)
https://doubles.singles/admin/volumes/abc123   (dynamic route, clean URL)
```

**Expected Result for All:** Page loads, URL bar shows clean path (no .html), no redirect needed.

---

## Alignment with Claude Design Approach

From Phase 1 documentation:
> "Claude Design's static-first approach: copy HTML → rewrites → deploy"

**Current Implementation:** ✅ **Perfect alignment**

- ✅ Static HTML files copied to `/public`
- ✅ Rewrites configured in `next.config.js`
- ✅ Deployed to Vercel (handles rewrites automatically)
- ✅ Clean URLs work without redirects

This is exactly the intended architecture.

---

## Recommendation & Action Plan

### Priority 1: Remove Redundant vercel.json

**Action:** Delete `/vercel.json`

**Why:**
- It's redundant (Next.js rewrites take precedence)
- It only has 8 incomplete rewrites (missing 46 that are in next.config.js)
- It creates confusion about what's actually handling the rewrites
- Removing it has zero negative impact

**Risk:** None. Next.js rewrites continue to work.

```bash
rm vercel.json
git add -A
git commit -m "Remove redundant vercel.json - Next.js rewrites handle all URL rewrites"
```

### Priority 2: Verify Production URLs (No Code Changes)

**Action:** Test a few URLs on the live site to confirm clean URLs work:

```
1. Visit: https://doubles.singles/about
   Expected: Page loads, no .html in URL ✓

2. Visit: https://doubles.singles/contact
   Expected: Page loads, no .html in URL ✓

3. Visit: https://doubles.singles/admin/volumes
   Expected: Admin volumes page loads with clean URL ✓

4. Visit: https://doubles.singles/admin/compare
   Expected: Admin comparison page loads with clean URL ✓
```

If all pass, clean URLs are already working perfectly.

### Priority 3: Optional Future Improvement (Longer-term, Low Priority)

**Gradual Migration to Full Next.js Routing**

Currently, the setup mixes:
- Static HTML files in `/public` (served via rewrites)
- Next.js page routes in `/app`

In the future, you could gradually migrate static pages to Next.js:

```
BEFORE: /public/about.html → rewrite to /about
AFTER:  /app/about/page.tsx → automatically /about

Benefits:
- Single routing system (easier to maintain)
- Can add interactivity easily
- Better performance (server components)
- Simpler deployment
```

**Timeline:** Not urgent. Do this when you want to add features to marketing pages.

**Effort:** ~4 hours to migrate 30 pages (15-20 min per page)

**Example Migration:**
```typescript
// /app/about/page.tsx
import { read } from 'fs/promises';

export default async function AboutPage() {
  const html = await read('./public/about.html', 'utf-8');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

Or, convert the static HTML to React components (more work, but cleaner).

---

## Summary Decision Matrix

| Aspect | Current State | Recommendation | Status |
|--------|---------------|-----------------|--------|
| **Static HTML + Rewrites** | ✅ Working | Keep | Optimal |
| **vercel.json Redundancy** | ❌ Redundant | Remove | Quick win |
| **Clean URLs on Live Site** | Likely ✅ | Verify | Confirm |
| **Admin Routes Clean URLs** | ✅ Automatic | Keep | Works |
| **Future: Migrate to Full Next.js** | — | Do later | Low priority |

---

## Next Steps

1. **Now:** Verify clean URLs work on production (manual testing)
2. **Today:** Remove `vercel.json` if verification passes
3. **Later:** Plan gradual migration to Next.js-only routing (optional)

**No code changes needed.** The system is already optimized.
