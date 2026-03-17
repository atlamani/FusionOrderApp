import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { currentOrder } from "./mockData";
import { colors, spacing, typography } from "./theme";

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>ACTIVITY</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.switcher}>
          <View style={styles.switcherActive}>
            <Text style={styles.switcherActiveText}>Track Order</Text>
          </View>
          <Pressable style={styles.switcherIdle} onPress={() => router.push("/activity-history")}>
            <Text style={styles.switcherIdleText}>Order History</Text>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.liveBadge}>LIVE</Text>
          <View style={styles.mapPin}>
            <Feather name="map-pin" size={18} color={colors.background} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{currentOrder.id}</Text>
              <Text style={styles.orderPlaced}>{currentOrder.placedAt}</Text>
            </View>
            <View style={styles.statusPill}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{currentOrder.restaurant}</Text>

          <Text style={styles.label}>Items</Text>
          {currentOrder.items.map((item) => (
            <Text key={item} style={styles.itemRow}>
              • {item}
            </Text>
          ))}

          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{currentOrder.eta}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{currentOrder.address}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currentOrder.total}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          {currentOrder.statuses.map((status, index) => (
            <View key={status.id} style={styles.timelineRow}>
              <View style={[styles.timelineIcon, index < 2 ? styles.timelineIconActive : undefined]}>
                <Feather
                  name={index < 2 ? "check-circle" : index === 2 ? "package" : "map-pin"}
                  size={16}
                  color={index < 2 ? colors.background : colors.primary}
                />
              </View>
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineLabel}>{status.title}</Text>
                <Text style={styles.timelineDetail}>{status.detail}</Text>
              </View>
            </View>
          ))}
        </View>
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
  switcher: {
    flexDirection: "row",
    gap: 8,
  },
  switcherActive: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  switcherIdle: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  switcherActiveText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  switcherIdleText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  mapCard: {
    height: 220,
    borderRadius: 18,
    backgroundColor: "#CFC6AA",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: colors.background,
    fontFamily: typography.display,
    fontSize: 11,
  },
  mapPin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  orderId: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  orderPlaced: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  statusText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.primary,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  value: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  itemRow: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  totalRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  totalValue: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  timelineCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  timelineTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineIconActive: {
    backgroundColor: colors.surface,
  },
  timelineCopy: {
    flex: 1,
    gap: 2,
  },
  timelineLabel: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  timelineDetail: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
