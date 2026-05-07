import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { colors, typography } from "../app/theme";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapPreviewMarker = {
  coordinate: MapCoordinate;
  /**
   * Short label shown on/under the marker. Keep under 12 chars for readability.
   */
  label?: string;
  /**
   * `pickup` shows the bag icon, `destination` shows the home icon, and
   * `current` shows a generic location dot.
   */
  kind?: "pickup" | "destination" | "current";
  /**
   * Override marker tint. Defaults are derived from `kind`.
   */
  color?: string;
};

type MapPreviewProps = {
  /**
   * Markers to show on the map. The map auto-centers to fit all markers.
   * Pass at least one marker.
   */
  markers: MapPreviewMarker[];
  /**
   * Optional polyline drawn between markers in array order.
   */
  showRoute?: boolean;
  /**
   * Map height. Defaults to 220.
   */
  height?: number;
  /**
   * Optional pill text rendered in the top-left corner (e.g. "Live" / "Pickup").
   */
  badge?: string;
  /**
   * Disable user gestures (pan/zoom). Useful when the map is decorative.
   */
  interactive?: boolean;
};

const FALLBACK_COORDINATE: MapCoordinate = {
  latitude: 40.7712,
  longitude: -73.9829,
};

// Cap the auto-fit zoom so pins that happen to land far apart don't shrink the
// map to a continent-wide view. ~0.04 deg ≈ 2.7 miles N-S — enough context to
// see neighborhoods, tight enough that streets are still visible.
const MAX_REGION_DELTA = 0.04;
const MIN_REGION_DELTA = 0.008;

function regionFromMarkers(markers: MapPreviewMarker[]) {
  if (markers.length === 0) {
    return {
      ...FALLBACK_COORDINATE,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  if (markers.length === 1) {
    return {
      ...markers[0].coordinate,
      latitudeDelta: MIN_REGION_DELTA,
      longitudeDelta: MIN_REGION_DELTA,
    };
  }

  const lats = markers.map((m) => m.coordinate.latitude);
  const lngs = markers.map((m) => m.coordinate.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const rawLatDelta = (maxLat - minLat) * 1.6;
  const rawLngDelta = (maxLng - minLng) * 1.6;

  // Clamp into a sensible range so the map stays readable.
  const latDelta = Math.min(
    Math.max(rawLatDelta, MIN_REGION_DELTA),
    MAX_REGION_DELTA,
  );
  const lngDelta = Math.min(
    Math.max(rawLngDelta, MIN_REGION_DELTA),
    MAX_REGION_DELTA,
  );

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

function iconForKind(kind: MapPreviewMarker["kind"]) {
  switch (kind) {
    case "pickup":
      return "shopping-bag";
    case "destination":
      return "home";
    case "current":
    default:
      return "navigation";
  }
}

function colorForKind(kind: MapPreviewMarker["kind"]) {
  switch (kind) {
    case "pickup":
      return colors.surface;
    case "destination":
      return colors.primary;
    case "current":
    default:
      return colors.surfaceDeep;
  }
}

/**
 * A self-contained map preview for delivery flows. Supplies sensible defaults
 * (region, padding, marker styling) so callers only need to pass markers.
 *
 * On Android we always request the Google provider to match the look across
 * iOS dev clients; on iOS the default Apple Maps is used unless the caller
 * overrides via marker style or wraps the map.
 */
export function MapPreview({
  markers,
  showRoute = true,
  height = 220,
  badge,
  interactive = true,
}: MapPreviewProps) {
  const region = useMemo(() => regionFromMarkers(markers), [markers]);
  const polylineCoords = useMemo(
    () => (showRoute && markers.length > 1 ? markers.map((m) => m.coordinate) : []),
    [markers, showRoute],
  );

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        toolbarEnabled={false}
      >
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.coordinate.latitude}-${marker.coordinate.longitude}-${index}`}
            coordinate={marker.coordinate}
            title={marker.label}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.markerPin,
                { backgroundColor: marker.color ?? colorForKind(marker.kind) },
              ]}
            >
              <Feather
                name={iconForKind(marker.kind) as never}
                size={16}
                color={colors.background}
              />
            </View>
          </Marker>
        ))}
        {polylineCoords.length > 1 ? (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={colors.surfaceDeep}
            strokeWidth={3}
            lineDashPattern={[6, 6]}
          />
        ) : null}
      </MapView>
      {badge ? (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.background,
    letterSpacing: 0.5,
  },
});
