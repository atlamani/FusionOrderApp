import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { orderHistory } from "./mockData";
import { colors, typography } from "./theme";

export default function ActivityHistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>ACTIVITY</Text>
        </View>
        <View style={styles.switcher}>
          <Pressable style={styles.switcherIdle} onPress={() => router.push("/activity")}>
            <Text style={styles.switcherIdleText}>Track Order</Text>
          </Pressable>
          <View style={styles.switcherActive}>
            <Text style={styles.switcherActiveText}>Order History</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {orderHistory.map((order) => {
          const delivered = order.status === "Delivered";

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderRestaurant}>{order.restaurant}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    delivered ? styles.statusBadgeDelivered : styles.statusBadgeCancelled,
                  ]}
                >
                  <Feather
                    name={delivered ? "check-circle" : "package"}
                    size={16}
                    color={order.accent}
                  />
                  <Text style={[styles.statusBadgeText, { color: order.accent }]}>{order.status}</Text>
                </View>
              </View>

              <Text style={styles.orderDate}>{order.date}</Text>
              {order.items.map((item) => (
                <Text key={item} style={styles.orderItem}>
                  • {item}
                </Text>
              ))}

              <Text style={styles.orderTotal}>{order.total}</Text>
              <Text style={styles.orderId}>Order #{order.id}</Text>

              <View style={styles.buttonRow}>
                <Pressable style={styles.reorderButton}>
                  <Text style={styles.reorderButtonText}>Reorder</Text>
                </Pressable>
                <Pressable style={styles.receiptButton}>
                  <Text style={styles.receiptButtonText}>View Receipt</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.white,
  },
  switcher: {
    flexDirection: "row",
    gap: 8,
  },
  switcherIdle: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "rgba(115,144,114,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  switcherActive: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  switcherIdleText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  switcherActiveText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderRestaurant: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  statusBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusBadgeDelivered: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeCancelled: {
    backgroundColor: "#FFE2E2",
  },
  statusBadgeText: {
    fontFamily: typography.body,
    fontSize: 12,
  },
  orderDate: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },
  orderItem: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
  },
  orderTotal: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.surface,
    marginTop: 6,
  },
  orderId: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  reorderButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.white,
  },
  receiptButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  receiptButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.text,
  },
});
