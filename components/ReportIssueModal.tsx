import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ORDER_ISSUE_TYPE_LABELS } from "../app/Firebase/orderIssues";
import type { OrderIssueType } from "../app/Firebase/types";
import { useAppState } from "../app/appState";
import { colors, typography } from "../app/theme";

type ReportIssueModalProps = {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
  onSubmitted?: () => void;
};

const ISSUE_OPTIONS: OrderIssueType[] = [
  "wrong_order",
  "missing_items",
  "late_delivery",
  "food_quality",
  "damaged",
  "other",
];

/**
 * Modal that lets a customer report a problem with an existing order.
 *
 * Submits to Firestore via `reportOrderIssue` action; the order doc gets
 * both a structured `issueReport` and a short `issue` summary so existing
 * admin/restaurant banners light up immediately.
 */
export function ReportIssueModal({
  visible,
  orderId,
  onClose,
  onSubmitted,
}: ReportIssueModalProps) {
  const { reportOrderIssue } = useAppState();
  const [issueType, setIssueType] = useState<OrderIssueType>("wrong_order");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setIssueType("wrong_order");
    setDescription("");
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!orderId) return;
    if (description.trim().length < 5) {
      Alert.alert(
        "Tell us a bit more",
        "Add a short description so the team can help.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await reportOrderIssue({
        orderId,
        type: issueType,
        description,
      });
      Alert.alert(
        "Issue submitted",
        "Thanks — a team member will follow up shortly.",
      );
      reset();
      onSubmitted?.();
      onClose();
    } catch (error) {
      Alert.alert(
        "Couldn't send report",
        "Something went wrong while sending your report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Report an issue</Text>
            <Pressable
              accessibilityLabel="Close report issue dialog"
              accessibilityRole="button"
              hitSlop={12}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>What went wrong?</Text>
            <View style={styles.options}>
              {ISSUE_OPTIONS.map((option) => {
                const active = option === issueType;
                return (
                  <Pressable
                    key={option}
                    accessibilityLabel={`Issue type ${ORDER_ISSUE_TYPE_LABELS[option]}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => setIssueType(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {ORDER_ISSUE_TYPE_LABELS[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>
              Describe what happened
            </Text>
            <TextInput
              accessibilityLabel="Issue description"
              multiline
              placeholder="Add as much detail as possible — items missing, what arrived, etc."
              placeholderTextColor="rgba(31, 42, 31, 0.44)"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
            />

            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Cancel reporting issue"
                accessibilityRole="button"
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Submit issue report"
                accessibilityRole="button"
                style={[styles.button, styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: { gap: 8, paddingBottom: 8 },
  label: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  optionTextActive: {
    color: colors.background,
  },
  input: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
});
