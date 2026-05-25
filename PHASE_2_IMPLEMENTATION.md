# Phase 2 Implementation: Authentication & Payment

## ✅ Completed Components

### 1. Server Actions
- **`/app/actions/auth.ts`**: Email OTP signup and verification
  - `signUpWithEmail(email, name, phone)` → Sends magic link OTP
  - `verifyOtp(email, token)` → Confirms email verification
  - `signOut()` → Signs user out

- **`/app/actions/stripe.ts`**: Payment intent management
  - `createPaymentIntent(amount, email)` → Creates $145 payment intent (manual capture)
  - `capturePaymentIntent(intentId)` → Captures held payment
  - `cancelPaymentIntent(intentId)` → Cancels held payment

- **`/app/actions/applications.ts`**: Application submission
  - `submitApplication(data)` → Saves application to Supabase with payment intent ID
  - `getVolumeIdByNumber(volumeNumber)` → Looks up event volume

- **`/app/actions/seed.ts`**: Database initialization
  - `ensureVolume1Exists()` → Creates Vol. 01 if it doesn't exist

### 2. Multi-Step Application Form
- **`/app/(auth)/apply/page.tsx`** - Complete 4-step flow:
  - Step 1: Email, first name, phone → Sends OTP
  - Step 2: About you, why Doubles, referral source
  - Step 3: Stripe card payment ($145)
  - Step 4: Success confirmation

### 3. Stripe Elements Integration
- Client-side: `@stripe/react-stripe-js` with `CardElement`
- Server-side: Stripe API with manual capture mode
- Full payment flow: Create intent → Confirm payment → Save application

### 4. Database Layer
- Supabase client initialized with environment variables
- Applications saved to `applications` table with:
  - `applicant_user_id`
  - `volume_id`
  - `applicant_payment_intent_id`
  - `status: 'payment_pending'` (until captured)
  - Form data stored

## 🔴 Next Steps: User Input Required

### Step 1: Add Stripe Keys to .env.local
Get from https://dashboard.stripe.com/apikeys

1. Go to Stripe Dashboard → API Keys
2. Copy "Publishable key" (starts with `pk_test_` or `pk_live_`)
3. Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
4. Update `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### Step 2: Install Dependencies
Run in the project root:
```bash
npm install
```

This installs:
- `stripe` (server-side API)
- `@stripe/stripe-js` (client-side JS)
- `@stripe/react-stripe-js` (React components)

### Step 3: Initialize Database
Once the app is running, call the init endpoint:
```bash
curl http://localhost:3000/api/init
# or navigate to http://localhost:3000/api/init in browser
```

This creates Volume 1 (June 21 event at Twin Peaks).

### Step 4: Test the Flow
1. Go to http://localhost:3000/apply
2. Enter email, first name, phone
3. You'll receive a magic link OTP (check email or Supabase logs)
4. In dev/test mode, click the magic link to confirm email
5. Continue to profile step
6. Fill in about, why, referral
7. Enter test card: `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits)
8. Submit → Success page

## 📋 Architecture Overview

### Email/OTP Flow
```
1. User enters email → signUpWithEmail(email)
   ↓
2. Supabase sends OTP to email
   ↓
3. User clicks magic link in email
   ↓
4. Session established, can proceed to payment
```

### Payment Flow
```
1. User submits form → createPaymentIntent($145)
   ↓
2. Stripe returns clientSecret
   ↓
3. User enters card in CardElement
   ↓
4. confirmCardPayment(clientSecret, card)
   ↓
5. Stripe returns paymentIntent with status
   ↓
6. If requires_capture OR succeeded:
   → submitApplication(formData + paymentIntentId)
   ↓
7. Application saved to database
   ↓
8. Show success page
```

### Data Model
```
users
├── id (uuid)
├── email
├── name
├── phone
├── created_at

volumes
├── id (uuid)
├── number (1, 2, 3...)
├── name (Vol. 01: Twin Peaks)
├── doors_date (2026-06-21)
├── capacity (30)

applications
├── id (uuid)
├── volume_id (FK)
├── applicant_user_id (FK)
├── applicant_payment_intent_id
├── status (payment_pending, approved, rejected, waitlisted)
├── admin_decision (pending)
├── created_at
```

## 🔧 Environment Variables Needed

```env
# Supabase (already set)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (needs to be added)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 📝 Testing Credentials

**Stripe Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

## ⚠️ Important Notes

1. **Manual Capture Mode**: Payments are held but not automatically captured
   - Captured by admin when application is approved
   - Cancelled if rejected
   - This protects both users and us

2. **RLS (Row Level Security)**: Database is secured at the row level
   - Users can only see their own applications
   - Admins see all applications
   - Payment intent IDs are private

3. **Email Verification**: User must click magic link to verify email
   - In development, magic links are logged to Supabase
   - In production, emails are sent to user's inbox

4. **Price**: Currently hardcoded at $145
   - Can be made dynamic per volume
   - Can add discounts for repeat attendees

## 🚀 Next Phase After Phase 2

Once Phase 2 is tested:
- **Phase 3: Admin Dashboard** - Review applications, approve/reject, manage approvals
- **Phase 4: Friend Invite Flow** - Generate invite tokens, send to plus-one
- **Phase 5: Event Management** - Email reminders, address reveals, event day logistics
- **Phase 6: Post-Event Matching** - Sparks (one-way picks), mutuals, match notifications
