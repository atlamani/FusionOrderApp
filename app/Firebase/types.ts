import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  lastLogin: FirebaseFirestoreTypes.FieldValue;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
}
