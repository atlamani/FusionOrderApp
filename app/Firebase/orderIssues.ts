import firestore from "@react-native-firebase/firestore";
import type {
  OrderIssueReport,
  OrderIssueResolution,
  OrderIssueResolutionAction,
  OrderIssueStatus,
  OrderIssueType,
} from "./types";

/**
 * Customer-facing labels for issue types. Keep in sync with `OrderIssueType`
 * in `./types`. Used by the report-issue modal to render the picker.
 */
export const ORDER_ISSUE_TYPE_LABELS: Record<OrderIssueType, string> = {
  wrong_order: "Wrong order",
  missing_items: "Missing items",
  late_delivery: "Late delivery",
  food_quality: "Food quality",
  damaged: "Damaged or spilled",
  other: "Something else",
};

export const ORDER_ISSUE_RESOLUTION_LABELS: Record<
  OrderIssueResolutionAction,
  string
> = {
  refund: "Issued refund",
  credit: "Issued credit",
  redelivery: "Sent re-delivery",
  no_action: "No action needed",
};

/**
 * Builds a short summary string suitable for the existing `issue` banner
 * UI in admin/restaurant order screens. Falls back to the type label when
 * the description is empty.
 */
export function summarizeIssueForBanner(
  type: OrderIssueType,
  description: string,
): string {
  const label = ORDER_ISSUE_TYPE_LABELS[type] ?? "Customer reported an issue";
  const trimmed = description.trim();
  if (!trimmed) {
    return label;
  }
  return `${label}: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? "..." : ""}`;
}

/**
 * Customer reports an issue with their order. Writes the structured report
 * AND the legacy `issue` summary string to the order document so existing
 * admin banners light up immediately.
 */
export async function reportOrderIssue(params: {
  orderId: string;
  reportedBy: string;
  type: OrderIssueType;
  description: string;
}): Promise<void> {
  const { orderId, reportedBy, type, description } = params;
  const trimmedDescription = description.trim();

  const issueReport: OrderIssueReport = {
    type,
    description: trimmedDescription,
    reportedAt: firestore.FieldValue.serverTimestamp(),
    reportedBy,
    status: "open",
    resolution: null,
  };

  await firestore()
    .collection("orders")
    .doc(orderId)
    .update({
      issue: summarizeIssueForBanner(type, trimmedDescription),
      issueReport,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Admin updates the working status of an issue (e.g. acknowledging it
 * before fully resolving).
 */
export async function setOrderIssueStatus(
  orderId: string,
  status: OrderIssueStatus,
): Promise<void> {
  await firestore()
    .collection("orders")
    .doc(orderId)
    .update({
      "issueReport.status": status,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Admin resolves an issue with a chosen action. Clears the legacy `issue`
 * summary string so the warning banner stops showing on order cards, and
 * records who resolved it for the audit trail.
 */
export async function resolveOrderIssue(params: {
  orderId: string;
  resolvedBy: string;
  action: OrderIssueResolutionAction;
  notes: string;
}): Promise<void> {
  const { orderId, resolvedBy, action, notes } = params;

  const resolution: OrderIssueResolution = {
    action,
    notes: notes.trim(),
    resolvedAt: firestore.FieldValue.serverTimestamp(),
    resolvedBy,
  };

  await firestore()
    .collection("orders")
    .doc(orderId)
    .update({
      issue: null,
      "issueReport.status": "resolved" as OrderIssueStatus,
      "issueReport.resolution": resolution,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}
