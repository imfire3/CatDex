export const TAB_ICON_SIZE = 32;
export const TAB_BAR_PADDING = 8;
export const TAB_LABEL_LINE = 16;
export const TAB_ICON_LABEL_GAP = 4;

/** Row height inside the pill (icon + gap + label). */
export const TAB_BAR_CONTENT_HEIGHT = TAB_ICON_SIZE + TAB_ICON_LABEL_GAP + TAB_LABEL_LINE;

/** White pill height (padding + content), excluding safe-area / float margin. */
export const TAB_BAR_BODY_HEIGHT = TAB_BAR_PADDING + TAB_BAR_CONTENT_HEIGHT + TAB_BAR_PADDING;

/** Capture FAB sits in the map HUD cluster, not inside the tab pill. */
export const MAP_CAPTURE_FAB_SIZE = 64;
export const MAP_ACTION_PILL_HEIGHT = 48;

/** @deprecated legacy scanner-in-tab metrics — kept for older call sites. */
export const SCANNER_TAB_SIZE = MAP_CAPTURE_FAB_SIZE;
export const SCANNER_TAB_LIFT = 24;
export const CAPTURE_FAB_OUTER_SIZE = MAP_CAPTURE_FAB_SIZE;

export function getTabBarTotalHeight(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  // Float margin + pill only (camera lives in the map HUD now).
  return bottomInset + spacing[16] + TAB_BAR_BODY_HEIGHT;
}

/** Bottom offset for the Missions / Capture / Collection cluster. */
export function getMapActionClusterBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return getTabBarTotalHeight(bottomInset, spacing) + spacing[16];
}

/** Bottom offset for the right-side tool stack (above the action cluster). */
export function getMapSideToolsBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return (
    getMapActionClusterBottom(bottomInset, spacing) +
    MAP_CAPTURE_FAB_SIZE +
    spacing[16]
  );
}

/** Gap above the floating tab bar for generic map HUD controls. */
export function getMapHudBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return getMapSideToolsBottom(bottomInset, spacing);
}

/** Bottom offset for controls aligned with the capture FAB center. */
export function getScannerAnchorBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return (
    getMapActionClusterBottom(bottomInset, spacing) +
    (MAP_CAPTURE_FAB_SIZE - spacing[56]) / 2
  );
}
