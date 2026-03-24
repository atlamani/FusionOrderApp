import firestore from "@react-native-firebase/firestore";
import { db } from "./config";
import { UserProfile } from "./types";

export const saveUserProfile = async (
  userId: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  try {
    await db
      .collection("Users")
      .doc(userId)
      .set(
        {
          ...data,
          lastLogin: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch (error) {
    console.error("Error saving user profile: ", error);
    throw error;
  }
};

export const getUserProfile = async (
  userID: string,
): Promise<UserProfile | null> => {
  const doc = await db.collection("Users").doc(userID).get();
  return doc.exists() ? (doc.data() as UserProfile) : null;
};
