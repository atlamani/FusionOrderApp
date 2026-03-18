import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { menuSections } from "./mockData";
import { colors, spacing, typography } from "./theme";

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>MENU</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <Image source={require("../assets/images/Tacos.png")} style={styles.heroImage} />
          <View style={styles.heroBody}>
            <Text style={styles.restaurantName}>Taqueria La Mexicana</Text>
            <Text style={styles.restaurantMeta}>4.6/5 · 15-20 minutes · Mexican</Text>
            <Text style={styles.restaurantCopy}>
              Street-style tacos, burrito bowls, and late-night comfort food inspired by the Figma
              menu flow.
            </Text>
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuCopy}>
                  <View style={styles.menuTitleRow}>
                    <Text style={styles.menuTitle}>{item.name}</Text>
                    {item.popular ? (
                      <View style={styles.popularTag}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                  <Text style={styles.menuPrice}>{item.price}</Text>
                </View>
                <Pressable style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ))}

        <Pressable style={styles.checkoutButton} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutButtonText}>View Cart · $16.08</Text>
        </Pressable>
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
    paddingBottom: 40,
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
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    width: "100%",
    height: 180,
  },
  heroBody: {
    padding: 16,
    gap: 6,
  },
  restaurantName: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.primary,
  },
  restaurantMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  restaurantCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  menuItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  menuCopy: {
    flex: 1,
    gap: 4,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  menuTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  popularTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  popularText: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.primary,
  },
  menuDescription: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  menuPrice: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.surfaceDeep,
  },
  addButton: {
    minWidth: 66,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  addButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  checkoutButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  checkoutButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
});
