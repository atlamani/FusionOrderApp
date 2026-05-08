import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export type SupportTicketStatus = "open" | "in_progress" | "resolved";
export type SupportMessageAuthor = "customer" | "admin";

export interface SupportMessage {
  id: string;
  author: SupportMessageAuthor;
  authorName: string;
  body: string;
  createdAt:
    | Date
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | string
    | number
    | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  topic: string;
  topicLabel: string;
  /** Human-readable code shown to staff/customers (e.g. FY-A4B2C9). */
  ticketCode: string;
  /** Initial message — kept for backward compat with single-message tickets. */
  message: string;
  status: SupportTicketStatus;
  messages: SupportMessage[];
  createdAt:
    | Date
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | string
    | number
    | null;
  updatedAt?:
    | Date
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | string
    | number
    | null;
  resolvedAt?:
    | Date
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue
    | string
    | number
    | null;
  resolution?: string;
}

const COLLECTION = "supportTickets";

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous chars
  let code = "FY-";
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function makeMessageId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Customer-facing helper. Files a help-center ticket against the
 * `supportTickets` collection. Admin sees it in their support inbox.
 *
 * The customer's first message is seeded into the `messages` array so
 * the thread view starts with their report. A short ticket code is
 * generated for human reference.
 */
export async function submitSupportTicket(params: {
  topic: string;
  topicLabel: string;
  message: string;
}): Promise<string> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("You need to be signed in to start a support chat.");
  }

  const trimmed = params.message.trim();
  if (trimmed.length < 5) {
    throw new Error("Add a few words about what you need help with.");
  }

  const customerName =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "FusionYum customer";

  // Use a client-side timestamp on the seeded message because
  // `serverTimestamp()` is not allowed inside an array element.
  const initialMessage: SupportMessage = {
    id: makeMessageId(),
    author: "customer",
    authorName: customerName,
    body: trimmed,
    createdAt: new Date(),
  };

  const docRef = await firestore()
    .collection(COLLECTION)
    .add({
      userId: user.uid,
      customerName,
      customerEmail: user.email ?? "",
      topic: params.topic,
      topicLabel: params.topicLabel,
      ticketCode: generateTicketCode(),
      message: trimmed,
      status: "open" as SupportTicketStatus,
      messages: [initialMessage],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

  return docRef.id;
}

/**
 * Append a message to an existing ticket. Both the customer (owner)
 * and admin can call this. Bumps status from "open" to "in_progress"
 * the first time admin replies so the inbox reflects active threads.
 */
export async function appendSupportMessage(params: {
  ticketId: string;
  author: SupportMessageAuthor;
  authorName: string;
  body: string;
}): Promise<void> {
  const trimmed = params.body.trim();
  if (trimmed.length === 0) {
    throw new Error("Message cannot be empty.");
  }

  const ref = firestore().collection(COLLECTION).doc(params.ticketId);
  const snapshot = await ref.get();
  const data = snapshot.data();
  const existingMessages: SupportMessage[] = Array.isArray(data?.messages)
    ? (data!.messages as SupportMessage[])
    : [];

  const message: SupportMessage = {
    id: makeMessageId(),
    author: params.author,
    authorName: params.authorName,
    body: trimmed,
    createdAt: new Date(),
  };

  const update: Record<string, unknown> = {
    messages: [...existingMessages, message],
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };
  if (params.author === "admin" && data?.status === "open") {
    update.status = "in_progress" as SupportTicketStatus;
  }

  await ref.update(update);
}

/**
 * Subscribe to a single ticket's full state including the message
 * thread. Used by both the customer thread screen and the admin
 * conversation view.
 */
export function subscribeToSupportTicket(
  ticketId: string,
  onData: (ticket: SupportTicket | null) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return firestore()
    .collection(COLLECTION)
    .doc(ticketId)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null);
          return;
        }
        onData(hydrateTicket(snapshot.id, snapshot.data() ?? {}));
      },
      (error) => {
        console.error("[support] ticket subscription error", error);
        onError?.(error);
      },
    );
}

/**
 * Subscribe to all tickets owned by a single customer. Powers the
 * "My support tickets" list on the customer side.
 */
export function subscribeToCustomerSupportTickets(
  userId: string,
  onData: (tickets: SupportTicket[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return firestore()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        const tickets = snapshot.docs.map((doc) =>
          hydrateTicket(doc.id, doc.data() as Record<string, unknown>),
        );
        tickets.sort((a, b) => toMillis(b.updatedAt ?? b.createdAt) - toMillis(a.updatedAt ?? a.createdAt));
        onData(tickets);
      },
      (error) => {
        console.error("[support] customer tickets subscription error", error);
        onError?.(error);
      },
    );
}

function hydrateTicket(
  id: string,
  data: Record<string, unknown>,
): SupportTicket {
  const messages = Array.isArray(data.messages)
    ? (data.messages as Record<string, unknown>[])
        .map((entry): SupportMessage | null => {
          const author = entry?.author === "admin" ? "admin" : "customer";
          const body = typeof entry?.body === "string" ? entry.body : "";
          if (!body) return null;
          return {
            id:
              typeof entry?.id === "string"
                ? entry.id
                : makeMessageId(),
            author,
            authorName:
              typeof entry?.authorName === "string" && entry.authorName
                ? entry.authorName
                : author === "admin"
                  ? "Manager"
                  : "Customer",
            body,
            createdAt:
              (entry?.createdAt as SupportMessage["createdAt"]) ?? null,
          };
        })
        .filter((msg): msg is SupportMessage => msg !== null)
    : [];

  return {
    id,
    userId: typeof data.userId === "string" ? data.userId : "",
    customerName:
      typeof data.customerName === "string" && data.customerName
        ? data.customerName
        : "FusionYum customer",
    customerEmail:
      typeof data.customerEmail === "string" ? data.customerEmail : "",
    topic: typeof data.topic === "string" ? data.topic : "general",
    topicLabel:
      typeof data.topicLabel === "string" ? data.topicLabel : "Help",
    ticketCode:
      typeof data.ticketCode === "string" && data.ticketCode
        ? data.ticketCode
        : id.slice(-6).toUpperCase(),
    message: typeof data.message === "string" ? data.message : "",
    status: ((data.status as SupportTicketStatus) ??
      "open") as SupportTicketStatus,
    messages,
    createdAt: (data.createdAt as SupportTicket["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as SupportTicket["updatedAt"]) ?? null,
    resolvedAt: (data.resolvedAt as SupportTicket["resolvedAt"]) ?? null,
    resolution:
      typeof data.resolution === "string" ? data.resolution : undefined,
  };
}

export type Unsubscribe = () => void;

/**
 * Admin-facing subscription over all tickets. Newest first.
 */
export function subscribeToSupportTickets(
  onData: (tickets: SupportTicket[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return firestore()
    .collection(COLLECTION)
    .onSnapshot(
      (snapshot) => {
        const tickets = snapshot.docs.map((doc) =>
          hydrateTicket(doc.id, doc.data() as Record<string, unknown>),
        );
        tickets.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        onData(tickets);
      },
      (error) => {
        console.error("[support] subscription error", error);
        onError?.(error);
      },
    );
}

export async function resolveSupportTicket(params: {
  ticketId: string;
  resolution: string;
}): Promise<void> {
  await firestore()
    .collection(COLLECTION)
    .doc(params.ticketId)
    .update({
      status: "resolved" as SupportTicketStatus,
      resolution: params.resolution.trim(),
      resolvedAt: firestore.FieldValue.serverTimestamp(),
    });
}

function toMillis(value: SupportTicket["createdAt"]): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const stamp = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof stamp.toMillis === "function") return stamp.toMillis();
  if (typeof stamp.toDate === "function") return stamp.toDate().getTime();
  return 0;
}
