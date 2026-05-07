import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Constants from "expo-constants";
import firestore, {
    FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const firebaseAuth = auth();
export const db = firestore();

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;
const googleSignInWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_WEB_CLIENT_ID ||
  extra?.googleSignInWebClientId;

GoogleSignin.configure(
  googleSignInWebClientId ? { webClientId: googleSignInWebClientId } : {},
);

export type { FirebaseAuthTypes, FirebaseFirestoreTypes };

