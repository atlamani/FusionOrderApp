import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { submitReview } from "../app/Firebase/reviews";
import { colors, typography } from "../app/theme";

type ReviewSubmitModalProps = {
  visible: boolean;
  orderId: string | null;
  restaurantId: string | null;
  restaurantName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

/**
 * Customer-facing modal that submits a verified review for an order
 * the customer has already received. The Firestore rule does the
 * authoritative gate (order must be delivered + owned by caller); this
 * UI just trusts the rule and surfaces any failure as an alert.
 */
export function ReviewSubmitModal({
  visible,
  orderId,
  restaurantId,
  restaurantName,
  onClose,
  onSubmitted,
}: ReviewSubmitModalProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRating(5);
      setText("");
      setSubmitting(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!orderId || !restaurantId) {
      Alert.alert(
        "Cannot submit",
        "Missing order or restaurant context. Try opening the order again.",
      );
      return;
    }

    if (text.trim().length < 5) {
      Alert.alert(
        "Add a few words",
        "Tell us a bit about your experience so the review is useful for others.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        orderId,
        restaurantId,
        rating,
        text,
      });
      Alert.alert("Thanks!", "Your review is live on the restaurant's page.");
      onSubmitted?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your review.";
      const code = (error as { code?: string } | undefined)?.code;
      const friendly =
        code === "firestore/permission-denied"
          ? "Reviews are only available once your order is marked Delivered."
          : message;
      Alert.alert("Couldn't submit review", friendly);
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
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Leave a review</Text>
              {restaurantName ? (
                <Text style={styles.subtitle}>{restaurantName}</Text>
              ) : null}
            </View>
            <Pressable
              accessibilityLabel="Close review dialog"
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
            <Text style={styles.label}>Rating</Text>
            <View style={styles.starRow}>
              {STAR_VALUES.map((value) => {
                const filled = value <= rating;
                return (
                  <Pressable
                    key={value}
                    accessibilityLabel={`Set rating to ${value} star${value === 1 ? "" : "s"}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filled }}
                    hitSlop={6}
                    onPress={() => setRating(value)}
                    style={styles.starButton}
                  >
                    <Feather
                      name="star"
                      size={32}
                      color={filled ? "#F4B400" : colors.border}
                      fill={filled ? "#F4B400" : "transparent"}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.ratingHelp}>{ratingCopy(rating)}</Text>

            <Text style={[styles.label, { marginTop: 16 }]}>
              Tell us about your experience
            </Text>
            <TextInput
              accessibilityLabel="Review text"
              multiline
              placeholder="What did you order? How was the food and the delivery?"
              placeholderTextColor="rgba(31, 42, 31, 0.44)"
              style={styles.input}
              value={text}
              onChangeText={setText}
              editable={!submitting}
            />

            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Cancel review"
                accessibilityRole="button"
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Submit review"
                accessibilityRole="button"
                style={[
                  styles.button,
                  styles.submitButton,
                  submitting && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.submitButtonText}>Post Review</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ratingCopy(rating: number): string {
  switch (rating) {
    case 1:
      return "Bad — would not order again";
    case 2:
      return "Below average";
    case 3:
      return "OK";
    case 4:
      return "Good";
    case 5:
    default:
      return "Excellent — would order again";
  }
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
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
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  starButton: {
    padding: 4,
  },
  ratingHelp: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
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
