import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function AddressBookScreen() {
  const { profile, savedLocationOptions, updateAddress } = usePrototypeState();
  const [address, setAddress] = useState(profile.address);
  const [deliveryNote, setDeliveryNote] = useState(profile.deliveryNote);
  const canSave = address.trim().length > 8;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    updateAddress(address.trim(), deliveryNote.trim());
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>DELIVERY ADDRESS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.card}>
          <Text style={styles.cardTitle}>Saved places</Text>
          <View style={styles.savedList}>
            {savedLocationOptions.map((option) => {
              const isSelected = option === address;

              return (
                <Pressable
                  key={option}
                  style={[styles.savedOption, isSelected && styles.savedOptionActive]}
                  onPress={() => setAddress(option)}
                >
                  <Feather
                    name={isSelected ? "check-circle" : "map-pin"}
                    size={16}
                    color={isSelected ? colors.background : colors.primary}
                  />
                  <Text style={[styles.savedOptionText, isSelected && styles.savedOptionTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
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
    width: 40,
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
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  savedOptionActive: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceDeep,
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
  actions: {
    gap: spacing.sm,
  },
});
