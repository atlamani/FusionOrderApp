import firestore from "@react-native-firebase/firestore";
import { firebaseAuth } from "./auth";
import { db } from "./config";
import { UserProfile } from "./types";

const waitForAuthUser = async (
  targetUid?: string,
  maxAttempts = 12,
  delayMs = 120,
) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (
      firebaseAuth.currentUser &&
      (!targetUid || firebaseAuth.currentUser.uid === targetUid)
    ) {
      return firebaseAuth.currentUser;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return firebaseAuth.currentUser;
};

export const saveUserProfile = async (
  userId: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  const writeProfile = async (payload: Partial<UserProfile>) => {
    await db.collection("users").doc(userId).set(payload, { merge: true });
  };

  try {
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<UserProfile>;

    const authUser =
      (await waitForAuthUser(userId, 20, 150)) ?? firebaseAuth.currentUser;
    if (!authUser) {
      throw new Error("Cannot save user profile: no authenticated user.");
    }

    if (authUser.uid !== userId) {
      console.warn(
        `Profile save requested for ${userId}, but authenticated user is ${authUser.uid}. Proceeding with Firestore write attempt.`,
      );
    }

    await authUser.getIdToken();

    const payload = {
      ...sanitizedData,
      lastLogin: firestore.FieldValue.serverTimestamp(),
    };

    await writeProfile(payload);
  } catch (error) {
    const code = (error as { code?: string })?.code;

    if (code === "firestore/permission-denied") {
      try {
        const retryUser =
          (await waitForAuthUser(userId, 20, 150)) ?? firebaseAuth.currentUser;
        await retryUser?.getIdToken(true);

        const retryData = Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined),
        ) as Partial<UserProfile>;

        await writeProfile({
          ...retryData,
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });
        return;
      } catch (retryError) {
        console.error(
          "Error saving user profile after token refresh: ",
          retryError,
        );
        throw retryError;
      }
    }

    console.error("Error saving user profile: ", error);
    throw error;
  }
};

export const getUserProfile = async (
  userID: string,
): Promise<UserProfile | null> => {
  const doc = await db.collection("users").doc(userID).get();
  return doc.exists() ? (doc.data() as UserProfile) : null;
};
