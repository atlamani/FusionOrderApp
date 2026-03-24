import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore, {
    FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export const firebaseAuth = auth();
export const db = firestore();

export type { FirebaseAuthTypes, FirebaseFirestoreTypes };

