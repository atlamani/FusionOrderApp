import firestore from "@react-native-firebase/firestore";

/**
 * Writes a single GPS sample for the driver onto the order doc. The
 * customer's tracking screen subscribes to the same doc and renders the
 * coordinates as a live marker on the map.
 *
 * The order's security rule already allows the driver who owns it to
 * update `driverLatitude` / `driverLongitude` / `driverLocationUpdatedAt`
 * (see firestore.rules — `isDriverLocationUpdate`).
 */
export async function publishDriverLocation(params: {
  orderId: string;
  driverId: string;
  latitude: number;
  longitude: number;
}): Promise<void> {
  const { orderId, latitude, longitude } = params;

  await firestore()
    .collection("orders")
    .doc(orderId)
    .update({
      driverLatitude: latitude,
      driverLongitude: longitude,
      driverLocationUpdatedAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}
