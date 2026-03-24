import { firebaseAuth, FirebaseAuthTypes } from "./config";

export const signOutUser = async (): Promise<void> => {
  try {
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
