# FusionYum Demo Guide

A walkthrough of how to demo every role and feature of the FusionYum
multi-restaurant unified food ordering system.

## What FusionYum Is

A campus dining finder app that lets students:
- Discover nearby restaurants via Google Places
- Filter by cuisine, price, rating, and distance
- Add items from **multiple partner restaurants into one unified cart**
- Place a single order, track it in real time, and report any issues

Plus three staff roles: **Admin / Manager**, **Restaurant**, and **Driver**.

## Test Accounts (Staff Logins)

These accounts have Firebase custom claims set up in `tools/staff-claims.example.json`. You'll need a corresponding email + password registered in Firebase Auth, plus the claims applied via `node tools/set-staff-claims.js`.

| Role | Email | Restaurant ID |
|------|-------|--------------|
| Manager (Admin) | `manager@fusionyum.com` | — |
| Restaurant (Pizza) | `nypizzaplace@fusionyum.com` | `featured-1` |
| Restaurant (Tacos) | `tacosnumero1@fusionyum.com` | `featured-2` |
| Restaurant (Greek) | `pillarsofathens@fusionyum.com` | `featured-3` |
| Restaurant (Dessert) | `ouiouidesserts@fusionyum.com` | `nearby-1` |
| Restaurant (Indian) | `saffronstreet@fusionyum.com` | `nearby-2` |
| Restaurant (Ramen) | `ramenlane@fusionyum.com` | `nearby-3` |
| Restaurant (Burger) | `burgerpalace@fusionyum.com` | `nearby-4` |
| Restaurant (Sushi) | `tokyosushibar@fusionyum.com` | `nearby-5` |
| Restaurant (Bowls) | `harvestbowlco@fusionyum.com` | `nearby-6` |
| Restaurant (Sushi #2) | `bamboosushi@fusionyum.com` | `nearby-7` |
| Driver #1 | `driver1@fusionyum.com` | `driver-1` |
| Driver #2 | `driver2@fusionyum.com` | `driver-2` |
| Driver #3 | `driver3@fusionyum.com` | `driver-3` |

For customer-side testing, sign up with any new account (or use Google sign-in) — no special claims needed.

## Setup Checklist

Before demoing, make sure:

- [ ] `.env` contains a valid `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` (see project root)
- [ ] Google Cloud APIs enabled: **Places API**, **Places API (New)**, **Maps SDK for Android**
- [ ] Firestore rules deployed: `npx firebase deploy --only firestore:rules`
- [ ] Native build done after any `app.config.js` change: `npx expo prebuild --clean --platform android` then `npx expo run:android`
- [ ] Android emulator running with **Google Play** image (not "plain") for maps
- [ ] Emulator location set to a campus area (e.g. lat `40.7712`, lng `-73.9829`) via Extended Controls

## Recommended Demo Flow

This walkthrough hits every documented feature in roughly 8 minutes.

### Part 1: Customer Side (5 min)

1. **Sign in** with a customer account (Google sign-in or email)
2. **Home screen** — scroll through restaurants. Some have a small `View only` chip — those are Google Places discovery results (non-partner). The rest are partner restaurants you can order from.
3. **Search & filter** — tap the search bar, try filtering by cuisine, price range, minimum rating, and distance.
4. **Tap a partner restaurant** (one without a `View only` chip — e.g. *Tacos Numero 1* or *NY Pizza Place*) → menu loads with cuisine-aware items.
5. **Add an item** to the cart.
6. **Try the multi-restaurant cart** (the headline feature):
   - Go back, pick a *different* partner restaurant
   - Add an item from there too
   - Both items now sit in the same cart
7. **Tap a Google Places restaurant** for contrast — note the orange "View only" banner and the "View only" pills on every menu item.
8. **Open the cart / checkout screen**:
   - Items are grouped per restaurant
   - Real Google Map shows pickup pins for each restaurant + delivery pin
   - Edit address → Address Book opens (saved addresses persisted to Firestore per user)
   - Edit profile → name, email, phone, default address, delivery note (all persist)
9. **Place the order** → land on Order Tracking screen
10. **Order Tracking** — real-time Firestore subscription, status timeline, delivery map, item list
11. **Report an issue** — scroll past the address card → tap **Report Issue** → pick a reason (Wrong order / Missing items / Late / Food quality / Damaged / Other) → describe → Submit. The order's `issue` field updates in Firestore.

### Part 2: Restaurant Side (1.5 min)

1. **Sign out**, sign in as the matching restaurant account (e.g. `tacosnumero1@fusionyum.com`)
2. **Restaurant Dashboard** → **Kitchen Queue**
3. The new order appears at the top with status **Pending**
4. Tap **Start Prep** → status moves to **Preparing**
5. Tap **Mark Ready** → status moves to **Ready for Driver**
6. Notice: the restaurant only sees orders for its own `restaurantId`. Other restaurants' orders are hidden by Firestore rules.

### Part 3: Driver Side (1 min)

1. **Sign out**, sign in as a driver (`driver1@fusionyum.com`)
2. **Driver Dashboard** → **Driver Assignments**
3. The order appears since it's now **Ready for Driver** with no driver assigned
4. Tap to claim → order moves to **Driver Route** screen
5. Real Google Map shows pickup → destination with dashed route line, status badge
6. Tap **Mark Picked Up** → status moves to **Out for Delivery**
7. Tap **Complete Delivery** → status **Delivered**, customer sees it update live

### Part 4: Admin Side (1 min)

1. **Sign out**, sign in as `manager@fusionyum.com`
2. **Live Orders** → see every order in the system, filtered by status (All / Pending / Preparing / Ready for Driver / Out for Delivery / Completed)
3. Each order shows a status hint ("Restaurant marks Preparing / Ready" / "Awaiting driver pickup" / "Driver delivering") so the admin knows whose action is next
4. **Cancel Order** button is available on active orders (escalation)
5. The customer's reported issue shows as a warning banner with the type label
6. Tap **Resolve Issue** → choose action (Issued refund / Issued credit / Sent re-delivery / No action) → add notes → **Save Resolution**
7. Banner turns green showing the resolution
8. Other admin sections: **Restaurants** (view/manage), **Feedback**, **Analytics dashboards** (per Process 6.0)

## Key Features to Highlight

| Documented Feature | Where to See It |
|---|---|
| Smart food-based search | Search screen with filters |
| Cuisine / dietary / price / rating / distance filters | Search screen |
| Multi-restaurant unified cart | Add items from 2+ partner restaurants |
| Real-time order tracking | Order Tracking screen with Firestore subscription |
| Real Google Maps | Checkout, Order Tracking, Driver Route |
| Order issue reporting | Report Issue button on order tracking |
| Admin issue resolution | Live Orders → Resolve Issue |
| Cuisine-aware menus | Each partner restaurant shows different items by cuisine |
| Per-user profile + saved addresses | Edit Profile / Address Book |
| Role-based access | StaffAccessGate redirects unauthorized users to login |
| View-only Google Places restaurants | Orange "View only" chip on cards + banner inside |

## Architecture Tour (For Technical Discussion)

- **Frontend:** React Native + Expo + TypeScript
- **Backend:** Firebase Auth + Firestore (no Node.js intermediary)
- **Maps:** `react-native-maps` with Google Maps provider
- **Discovery:** Google Places API (New) v1 endpoint
- **Location:** `expo-location` with `watchPositionAsync`
- **Role-based access:** Firebase custom claims (`admin`, `restaurantId`, `driverId`)
- **Order data:** Single `orders` collection scoped via Firestore rules
- **Issue reporting:** structured `issueReport` object on order docs

Key code locations:
- `app/services/restaurantService.ts` — Google Places integration
- `app/services/restaurantOrdering.ts` — partner-vs-discovery logic
- `app/Firebase/orderIssues.ts` — issue reporting service
- `app/Firebase/admin.ts` — staff scope subscriptions
- `app/Firebase/checkout.ts` — order placement
- `firestore.rules` — security rules per role
- `components/MapPreview.tsx` — reusable map component
- `components/ReportIssueModal.tsx` — customer issue reporting UI

## Known Limitations (Honest Disclosure)

- Google Places restaurants have no menu data; cuisine-aware mock menus serve as placeholder. The **View only** treatment makes this explicit.
- Payment is mocked; no real Stripe / PayPal integration.
- Driver live GPS is faked with stable offsets; real GPS broadcasting is future work.
- Restaurant onboarding for new partners is via the staff-claims script, not a self-service signup flow.
- Reviews & ratings collection (per ERD) is not yet wired to Firestore writes — restaurant detail pages show seeded mock reviews.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Maps render as gray rectangle | Maps SDK for Android isn't enabled, OR API key restrictions don't include it |
| "Live results unavailable" banner on search | Check `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in `.env` and that Places API (New) is enabled |
| Order doesn't appear on admin/driver after placement | Make sure Firestore rules are deployed; sign out + sign back in to refresh subscriptions |
| Issue reporting fails with permission error | Firestore rules need `npx firebase deploy --only firestore:rules` to push the `isCustomerIssueReport` rule |
| Restaurants near you don't update when emulator location changes | Ensure permission granted — the location watch refreshes every 10s or 50m |
| Staff login redirects to "Manager authorization required" | The Firebase user doesn't have the right custom claim. Run `node tools/set-staff-claims.js` to apply claims from `tools/staff-claims.local.json` |
