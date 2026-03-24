import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { getInitials, usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function EditProfileScreen() {
  const { profile, updateProfile } = usePrototypeState();
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const canSave = fullName.trim().length > 1 && email.trim().length > 3 && phone.trim().length > 6;

  const handleSave = () => {
    if (!canSave) {
      Alert.alert("Complete your profile", "Add your name, email, and phone number to save changes.");
      return;
    }

    updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>EDIT PROFILE</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(fullName || profile.fullName)}</Text>
          </View>
          <Text style={styles.heroTitle}>Keep your account up to date</Text>
          <Text style={styles.heroCopy}>
            These details personalize your profile, saved cards, and order confirmations.
          </Text>
        </FadeInView>

        <FadeInView delay={160} style={styles.formCard}>
          <CustomInput
            label="Full name"
            leadingIcon="user"
            inputProps={{
              placeholder: "Your full name",
              value: fullName,
              onChangeText: setFullName,
            }}
          />
          <CustomInput
            label="Email"
            leadingIcon="mail"
            inputProps={{
              placeholder: "Email address",
              keyboardType: "email-address",
              autoCapitalize: "none",
              value: email,
              onChangeText: setEmail,
            }}
          />
          <CustomInput
            label="Phone"
            leadingIcon="phone"
            inputProps={{
              placeholder: "Phone number",
              keyboardType: "phone-pad",
              value: phone,
              onChangeText: setPhone,
            }}
          />
        </FadeInView>

        <FadeInView delay={220} style={styles.actions}>
          <CustomButton title="Save Changes" onPress={handleSave} />
          <CustomButton title="Cancel" variant="surface" onPress={() => router.back()} />
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
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.background,
  },
  heroTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.white,
    textAlign: "center",
  },
  heroCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
    textAlign: "center",
  },
  formCard: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 18,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
});
