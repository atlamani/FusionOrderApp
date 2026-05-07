import type {
  AdminFeedback,
  AdminOrder,
  AdminRestaurant,
  DriverProfile,
} from "../Firebase/types";

type MenuSection = {
  items: { id: string; available?: boolean }[];
};

export function countMenuItems(menuSections: MenuSection[]) {
  return menuSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
}

export function getAverageRating(feedback: AdminFeedback[]) {
  const average =
    feedback.reduce((sum, entry) => sum + entry.rating, 0) /
    Math.max(feedback.length, 1);

  return average.toFixed(1);
}

export function getAdminMetrics({
  feedback,
  orders,
  restaurants,
  drivers,
}: {
  feedback: AdminFeedback[];
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
  drivers: DriverProfile[];
}) {
  return {
    availableDrivers: drivers.filter((driver) => driver.status === "Available")
      .length,
    completedOrders: orders.filter((order) => order.status === "Completed")
      .length,
    flaggedFeedback: feedback.filter((entry) => entry.flagged).length,
    liveOrders: orders.filter((order) => order.status !== "Completed").length,
    needsApproval: restaurants.filter(
      (restaurant) => restaurant.status === "Needs Approval",
    ).length,
    averageRating: getAverageRating(feedback),
  };
}

export function getRestaurantMetrics({
  orders,
  restaurantId,
  menuItems,
}: {
  orders: AdminOrder[];
  restaurantId: string;
  menuItems: { available?: boolean }[];
}) {
  const restaurantOrders = orders.filter(
    (order) => order.restaurantId === restaurantId,
  );

  return {
    active: restaurantOrders.filter((order) => order.status !== "Completed")
      .length,
    ready: restaurantOrders.filter(
      (order) => order.status === "Ready for Driver",
    ).length,
    pausedItems: menuItems.filter((item) => !item.available).length,
  };
}

export function getDriverMetrics({
  orders,
  driverName,
  unassignedLabel,
}: {
  orders: AdminOrder[];
  driverName?: string;
  unassignedLabel: string;
}) {
  return {
    readyPool: orders.filter(
      (order) =>
        order.status === "Ready for Driver" &&
        (!order.driver || order.driver === unassignedLabel),
    ).length,
    assigned: orders.filter(
      (order) =>
        order.driver === driverName &&
        (order.status === "Ready for Driver" ||
          order.status === "Out for Delivery"),
    ).length,
    completed: orders.filter(
      (order) => order.driver === driverName && order.status === "Completed",
    ).length,
  };
}

export function getRestaurantBreakdown({
  orders,
  restaurants,
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
}) {
  return restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    orders: orders.filter((order) => order.restaurantId === restaurant.id)
      .length,
    pausedItems: restaurant.menuItems.filter((item) => !item.available).length,
  }));
}
