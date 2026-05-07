import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export interface OrderReview {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  rating: number;
  text: string;
  createdAt:
    | Date
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | string
    | number
    | null;
}

const REVIEWS_COLLECTION = "reviews";

export type SubmitReviewInput = {
  orderId: string;
  restaurantId: string;
  rating: number;
  text: string;
};

/**
 * Customer-facing helper. Writes a review document under the `reviews`
 * collection. The Firestore security rule enforces that the caller owns
 * the referenced order and that the order is in a delivered state — so
 * the verified-review gate is checked at the database, not on the client.
 */
export async function submitReview({
  orderId,
  restaurantId,
  rating,
  text,
}: SubmitReviewInput): Promise<string> {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error("You need to be signed in to leave a review.");
  }

  const trimmed = text.trim();
  if (rating < 1 || rating > 5 || !Number.isFinite(rating)) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }
  if (trimmed.length < 5) {
    throw new Error("Add a few words about your experience.");
  }

  const docRef = await firestore()
    .collection(REVIEWS_COLLECTION)
    .add({
      orderId,
      customerId: currentUser.uid,
      customerName:
        currentUser.displayName?.trim() ||
        currentUser.email?.split("@")[0] ||
        "FusionYum customer",
      restaurantId,
      rating,
      text: trimmed,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  return docRef.id;
}

export type Unsubscribe = () => void;

/**
 * Subscribe to reviews for a single restaurant, newest first. The
 * caller receives the latest snapshot whenever a new review is added.
 */
export function subscribeToRestaurantReviews(
  restaurantId: string,
  onData: (reviews: OrderReview[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return firestore()
    .collection(REVIEWS_COLLECTION)
    .where("restaurantId", "==", restaurantId)
    .onSnapshot(
      (snapshot) => {
        const reviews: OrderReview[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              orderId: typeof data.orderId === "string" ? data.orderId : "",
              customerId:
                typeof data.customerId === "string" ? data.customerId : "",
              customerName:
                typeof data.customerName === "string" && data.customerName
                  ? data.customerName
                  : "FusionYum customer",
              restaurantId:
                typeof data.restaurantId === "string"
                  ? data.restaurantId
                  : restaurantId,
              rating:
                typeof data.rating === "number" && Number.isFinite(data.rating)
                  ? data.rating
                  : 0,
              text: typeof data.text === "string" ? data.text : "",
              createdAt: data.createdAt ?? null,
            };
          })
          .filter((review) => review.rating > 0)
          .sort((a, b) => {
            const aMs = toMillis(a.createdAt);
            const bMs = toMillis(b.createdAt);
            return bMs - aMs;
          });

        onData(reviews);
      },
      (error) => {
        console.error(
          "[reviews] Subscription error for restaurant",
          restaurantId,
          error,
        );
        onError?.(error);
      },
    );
}

function toMillis(value: OrderReview["createdAt"]): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const timestamp = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().getTime();
  }
  return 0;
}
