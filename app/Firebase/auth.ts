import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { firebaseAuth, FirebaseAuthTypes } from "./config";

export { firebaseAuth };

export const signUpUser = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      email,
      password,
    );
    return userCredential;
  } catch (error) {
    console.error("Sign up error: ", error);
    throw error;
  }
};

export const signInUser = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(
      email,
      password,
    );
    return userCredential;
  } catch (error) {
    console.error("Sign in error: ", error);
    throw error;
  }
};

export const signInWithGoogle =
  async (): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error("No ID token found");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential =
        await firebaseAuth.signInWithCredential(googleCredential);

      return userCredential;
    } catch (error) {
      console.error("Google sign in error: ", error);
      throw error;
    }
  };

export const signOutUser = async (): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await firebaseAuth.signOut();
  } catch (error) {
    console.error("Sign out error: ", error);
  }
};

export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => {
  return firebaseAuth.onAuthStateChanged(callback);
};
