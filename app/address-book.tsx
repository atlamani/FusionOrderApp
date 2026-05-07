import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

export default function AddressBookScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const {
    profile,
    savedLocationOptions,
    updateAddress,
    addSavedAddress,
    removeSavedAddress,
  } = useAppState();
  const [address, setAddress] = useState(profile.address);
  const [deliveryNote, setDeliveryNote] = useState(profile.deliveryNote);
  const canSave = address.trim().length > 8;

  const handleSave = async () => {
    if (!canSave) return;

    const trimmedAddress = address.trim();
    try {
      await updateAddress(trimmedAddress, deliveryNote.trim());
      // Quietly add it to the user's saved list if not already there.
      await addSavedAddress(trimmedAddress);
      goBackOrReplace("/profile");
    } catch (error) {
      Alert.alert(
        "Couldn't save address",
        "We hit a problem saving your address. Please try again.",
      );
    }
  };

  const handleRemove = (target: string) => {
    Alert.alert(
      "Remove saved address?",
      target,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeSavedAddress(target);
            if (address === target) setAddress("");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerTopPadding },
        ]}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={16}
            style={styles.backButton}
            onPress={() => goBackOrReplace("/profile")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>DELIVERY ADDRESS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.card}>
          <Text style={styles.cardTitle}>Saved places</Text>
          {savedLocationOptions.length === 0 ? (
            <Text style={styles.emptyCopy}>
              You haven&apos;t saved any addresses yet. Enter one below and tap
              Save Address — it&apos;ll show up here for next time.
            </Text>
          ) : (
            <View style={styles.savedList}>
              {savedLocationOptions.map((option) => {
                const isSelected = option === address;

                return (
                  <View
                    key={option}
                    style={[styles.savedOption, isSelected && styles.savedOptionActive]}
                  >
                    <Pressable
                      accessibilityLabel={`Use saved address ${option}`}
                      accessibilityRole="button"
                      style={styles.savedOptionPickArea}
                      onPress={() => setAddress(option)}
                    >
                      <Feather
                        name={isSelected ? "check-circle" : "map-pin"}
                        size={16}
                        color={isSelected ? colors.background : colors.primary}
                      />
                      <Text
                        style={[
                          styles.savedOptionText,
                          isSelected && styles.savedOptionTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Remove ${option}`}
                      accessibilityRole="button"
                      hitSlop={10}
                      style={styles.savedOptionRemove}
                      onPress={() => handleRemove(option)}
                    >
                      <Feather
                        name="trash-2"
                        size={16}
                        color={isSelected ? colors.background : colors.danger}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </FadeInView>

        <FadeInView delay={160} style={styles.card}>
          <CustomInput
            label="Delivery address"
            leadingIcon="map-pin"
            inputProps={{
              placeholder: "Street, city, state, ZIP",
              value: address,
              onChangeText: setAddress,
            }}
          />
          <CustomInput
            label="Delivery note"
            leadingIcon="message-square"
            helperText="These notes appear in checkout and order tracking."
            inputProps={{
              placeholder: "Door code, handoff instructions, or leave-at-door note",
              value: deliveryNote,
              onChangeText: setDeliveryNote,
            }}
          />
        </FadeInView>

        <FadeInView delay={220} style={styles.actions}>
          <CustomButton title="Save Address" onPress={handleSave} disabled={!canSave} />
          <CustomButton title="Back to Profile" variant="surface" onPress={() => router.push("/profile")} />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: safeHeaderButtonSize,
    height: safeHeaderButtonSize,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  headerSpacer: {
    width: safeHeaderButtonSize,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  savedList: {
    gap: spacing.sm,
  },
  savedOption: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "transparent",
    paddingLeft: 14,
    paddingRight: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savedOptionActive: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceDeep,
  },
  savedOptionPickArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  savedOptionText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.primary,
  },
  savedOptionTextActive: {
    color: colors.background,
  },
  savedOptionRemove: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
});
