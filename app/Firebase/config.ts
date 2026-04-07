import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, {
    FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const firebaseAuth = auth();
export const db = firestore();

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "917688018866-i3r192scpd38ct2mfjm431fm6vkmp3q9.apps.googleusercontent.com",
});

export type { FirebaseAuthTypes, FirebaseFirestoreTypes };

