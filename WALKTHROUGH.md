# FusionYum Walkthrough

A guided tour of every role and feature in FusionYum, the multi-restaurant
unified food ordering platform.

## What FusionYum Is

A campus dining finder application that lets students:

- Discover nearby restaurants via Google Places
- Filter by cuisine, price, rating, and distance
- Add items from **multiple partner restaurants into one unified cart**
- Place a single order, track it in real time, and report any issues

Plus three staff roles: **Admin / Manager**, **Restaurant**, and **Driver**.

## Test Accounts (Staff Logins)

These accounts are configured via Firebase custom claims. The script
`tools/set-staff-claims.js` reads `tools/staff-claims.example.json` (or a
`.local.json` override) and applies the appropriate claim to each Firebase
Auth user.

| Role | Email | Restaurant ID |
|------|-------|--------------|
| Manager (Admin) | `manager@fusionyum.com` | — |
| **Google Aggregator** | `google@fusionyum.com` | — (catches every Google Places order) |
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

Customer testing requires no special claims — sign up with any new account
or use Google sign-in.

## Setup Checklist

Before walking through the app:

- [ ] `.env` contains a valid `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` at the project root
- [ ] Google Cloud APIs enabled: **Places API**, **Places API (New)**, **Maps SDK for Android**
- [ ] Firestore rules deployed: `npx firebase deploy --only firestore:rules`
- [ ] Native build done after any `app.config.js` change: `npx expo prebuild --clean --platform android` then `npx expo run:android`
- [ ] Android emulator running with a **Google Play** image (required for maps)
- [ ] Emulator location set to a campus area (e.g. lat `40.7712`, lng `-73.9829`) via Extended Controls

## Walkthrough Flow

The path below covers every documented feature in roughly 8 minutes.

### Part 1: Customer Side (5 min)

1. **Sign in** with a customer account (Google sign-in or email)
2. **Home screen** — scroll through restaurants. Partner restaurants from
   the platform's seed data render alongside live Google Places results
3. **Search & filter** — open the search bar, try cuisine, price range,
   minimum rating, and distance filters
4. **Tap a restaurant** → menu loads with cuisine-appropriate items
5. **Add an item** to the cart
6. **Multi-restaurant unified cart** (the headline feature):
   - Go back, pick a different restaurant
   - Add an item from there too
   - Both items now sit in the same cart
7. **Open the cart / checkout screen**:
   - Items are grouped per restaurant
   - A real Google Map shows the pickup pin and the delivery destination
   - Edit address → Address Book opens (saved addresses persisted to Firestore per user)
   - Edit profile → name, email, phone, default address, delivery note (all persist)
8. **Place the order** → Order Tracking screen
9. **Order Tracking** — real-time Firestore subscription, status timeline,
   delivery map, item list
10. **Report an issue** — scroll past the address card → tap **Report Issue**
    → pick a reason (Wrong order / Missing items / Late / Food quality /
    Damaged / Other) → describe → Submit. The order's `issue` and
    `issueReport` fields update in Firestore.

### Part 2: Restaurant Side (1.5 min)

#### Partner restaurant flow

1. **Sign out**, sign in as the matching restaurant account (e.g. `tacosnumero1@fusionyum.com`)
2. **Restaurant Dashboard** → **Kitchen Queue**
3. The new order appears at the top with status **Pending**
4. Tap **Start Prep** → status moves to **Preparing**
5. Tap **Mark Ready** → status moves to **Ready for Driver**
6. Notice: each restaurant only sees orders for its own `restaurantId`.
   Other restaurants' orders are hidden by Firestore rules.

#### Google Places restaurant flow (catch-all aggregator)

When a customer orders from a restaurant discovered via the Google Places
API, no per-restaurant staff account exists. Instead, **one** aggregator
account fulfills all of those orders.

1. Place an order against a Google Places restaurant
2. **Sign out**, sign in as `google@fusionyum.com`
3. The login routes straight to **Google Queue** (instead of the per-restaurant
   Kitchen Queue) with a banner explaining the scope
4. Each order card shows the originating Google restaurant's name above the
   customer's name
5. The same status progression buttons (**Start Prep** → **Mark Ready**)
   work the same way

### Part 3: Driver Side (1 min)

1. **Sign out**, sign in as a driver (`driver1@fusionyum.com`)
2. **Driver Dashboard** → **Driver Assignments**
3. The order appears since it is now **Ready for Driver** and unassigned
4. Tap to claim → routes to **Driver Route**
5. A real Google Map shows pickup → destination with a dashed route line and
   status badge
6. Tap **Mark Picked Up** → status **Out for Delivery**
7. Tap **Complete Delivery** → status **Delivered**, customer sees the
   update live

### Part 4: Admin Side (1 min)

1. **Sign out**, sign in as `manager@fusionyum.com`
2. **Live Orders** → every order in the system, filtered by status
   (All / Pending / Preparing / Ready for Driver / Out for Delivery / Completed)
3. Each order shows a status hint identifying whose action is next
   ("Restaurant marks Preparing / Ready" / "Awaiting driver pickup" /
   "Driver delivering")
4. **Cancel Order** button is available on active orders (escalation)
5. The customer's reported issue shows as a warning banner with the type label
6. Tap **Resolve Issue** → choose action (Issued refund / Issued credit /
   Sent re-delivery / No action) → add notes → **Save Resolution**
7. Banner turns green showing the resolution
8. Other admin sections: **Restaurants**, **Feedback**, **Analytics dashboards**

## Key Features to Highlight

| Feature | Where to See It |
|---|---|
| Smart food-based search | Search screen with filters |
| Cuisine / dietary / price / rating / distance filters | Search screen |
| Multi-restaurant unified cart | Add items from 2+ restaurants in one session |
| Real-time order tracking | Order Tracking screen with Firestore subscription |
| Real Google Maps | Checkout, Order Tracking, Driver Route |
| Order issue reporting | Report Issue button on order tracking |
| Admin issue resolution | Live Orders → Resolve Issue |
| Cuisine-aware menus | Restaurant detail screen renders items per cuisine |
| Per-user profile + saved addresses | Edit Profile / Address Book |
| Role-based access | StaffAccessGate redirects unauthorized users to the matching login |

## Architecture Tour

- **Frontend:** React Native + Expo + TypeScript
- **Backend:** Firebase Auth + Firestore
- **Maps:** `react-native-maps` with Google Maps provider
- **Discovery:** Google Places API (New) v1 endpoint
- **Location:** `expo-location` with `watchPositionAsync`
- **Role-based access:** Firebase custom claims (`admin`, `restaurantId`, `driverId`, `googleAggregator`)
- **Order data:** Single `orders` collection scoped via Firestore rules
- **Issue reporting:** structured `issueReport` object on order documents

Key code locations:

- `app/services/restaurantService.ts` — Google Places integration
- `app/Firebase/orderIssues.ts` — issue reporting service
- `app/Firebase/admin.ts` — staff scope subscriptions
- `app/Firebase/checkout.ts` — order placement
- `firestore.rules` — security rules per role
- `components/MapPreview.tsx` — reusable map component
- `components/ReportIssueModal.tsx` — customer issue reporting UI

## Current Limitations

- Google Places restaurants do not ship with menu data; cuisine-aware menu
  templates render plausible items until each restaurant publishes its own
  menu through the partner workflow.
- Payment is not yet integrated with a real payment processor.
- Driver location on the map uses a stable offset; live GPS broadcasting
  is future work.
- Restaurant onboarding currently runs through `tools/set-staff-claims.js`
  rather than an in-app self-service signup flow.
- The reviews and ratings collection described in the ERD is not yet wired
  to Firestore writes; restaurant detail pages display the seeded reviews.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Maps render as gray rectangle | Maps SDK for Android isn't enabled, OR the API key's restrictions don't include it |
| "Live results unavailable" banner on search | Check `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in `.env` and that Places API (New) is enabled |
| Order doesn't appear on admin/driver after placement | Make sure Firestore rules are deployed; sign out + sign back in to refresh subscriptions |
| Issue reporting fails with permission error | Firestore rules need `npx firebase deploy --only firestore:rules` to push the `isCustomerIssueReport` rule |
| Restaurants near you don't update when the emulator location changes | Ensure permission was granted — the location watch refreshes every 10 seconds or 50 metres |
| Staff login redirects to "Manager authorization required" | The Firebase user doesn't have the right custom claim. Run `node tools/set-staff-claims.js` to apply claims from `tools/staff-claims.local.json` |
