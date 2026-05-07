# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Environment

Copy `.env.example` to a local env file and fill in the keys you need:

```bash
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_GOOGLE_SIGN_IN_WEB_CLIENT_ID=your_google_web_client_id
```

If the Google Places/Maps keys are missing, the app falls back to local mock
restaurant data so development still works.

## Staff authorization

Manager, restaurant, and driver portals use Firebase Auth custom claims. A user
can sign in only if their Firebase Auth account has the correct claim:

```json
{ "admin": true }
{ "restaurantId": "featured-1" }
{ "driverId": "driver-1" }
```

To apply claims with the downloaded Firebase Admin SDK key:

1. In Firebase Console, open Project settings > Service accounts.
2. Generate a new private key and place it in the project root as
   `firebase-admin-key.json`. This file is ignored by git.
3. Copy `tools/staff-claims.example.json` to `tools/staff-claims.local.json`
   and edit the emails/IDs to match the accounts you created.
4. Run:

```bash
npm run staff:claims -- --key=./firebase-admin-key.json --config=./tools/staff-claims.local.json
```

You can also update one account at a time:

```bash
npm run staff:claims -- --key=./firebase-admin-key.json --restaurant-email=nypizzaplace@fusionyum.com --restaurant-id=featured-1
```

After claims are updated, sign out and sign back in so Firebase refreshes the ID
token. Firestore rules also require these claims for staff data access.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
