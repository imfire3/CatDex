export const SCANNER_TAB_SIZE = 56;
export const SCANNER_TAB_LIFT = 24;

/** Tab bar card height (vertical padding + row), excluding safe-area / float margin. */
export const TAB_BAR_BODY_HEIGHT = SCANNER_TAB_LIFT + 8 + 56 + 8;

/** @deprecated Use SCANNER_TAB_SIZE — kept for legacy FAB alignment call sites. */
export const CAPTURE_FAB_OUTER_SIZE = SCANNER_TAB_SIZE;

export function getTabBarTotalHeight(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return bottomInset + spacing[16] + TAB_BAR_BODY_HEIGHT;
}

/** Gap above the floating tab bar for map HUD controls. */
export function getMapHudBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return getTabBarTotalHeight(bottomInset, spacing) + spacing[8];
}

/** Bottom offset for controls aligned with the scanner button center. */
export function getScannerAnchorBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return getTabBarTotalHeight(bottomInset, spacing) - spacing[8] - SCANNER_TAB_SIZE;
}
