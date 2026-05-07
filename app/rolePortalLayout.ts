import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
  safeHeaderHorizontalPadding,
} from "./safeHeaderLayout";

export const rolePortalHeaderSize = safeHeaderButtonSize;
export const rolePortalHeaderSidePadding = safeHeaderHorizontalPadding;

export function getRolePortalTopInset(topInset: number) {
  return getSafeHeaderTopPadding(topInset);
}
