export const safeHeaderButtonSize = 44;
export const safeHeaderHorizontalPadding = 20;

export function getSafeHeaderTopPadding(topInset: number) {
  return Math.max(topInset + 22, 56);
}

export function getSafeContentTopPadding(topInset: number) {
  return Math.max(topInset + 18, 24);
}
