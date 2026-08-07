/** Capture FAB sits in the map HUD cluster. */
export const MAP_CAPTURE_FAB_SIZE = 64;
export const MAP_ACTION_PILL_HEIGHT = 48;

/** @deprecated legacy scanner-in-tab metrics — kept for older call sites. */
export const SCANNER_TAB_SIZE = MAP_CAPTURE_FAB_SIZE;
export const SCANNER_TAB_LIFT = 24;
export const CAPTURE_FAB_OUTER_SIZE = MAP_CAPTURE_FAB_SIZE;

/** Bottom offset for the Missions / Capture / Collection cluster (no tab bar). */
export function getMapActionClusterBottom(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  return Math.max(bottomInset, spacing[16]) + spacing[16];
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
