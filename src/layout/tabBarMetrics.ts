export const TAB_ICON_SIZE = 32;
export const TAB_BAR_PADDING = 8;
export const TAB_LABEL_LINE = 16;
export const TAB_ICON_LABEL_GAP = 4;

/** Row height inside the pill (icon + gap + label). */
export const TAB_BAR_CONTENT_HEIGHT = TAB_ICON_SIZE + TAB_ICON_LABEL_GAP + TAB_LABEL_LINE;

/** White pill height (padding + content), excluding FAB lift / safe-area / float margin. */
export const TAB_BAR_BODY_HEIGHT = TAB_BAR_PADDING + TAB_BAR_CONTENT_HEIGHT + TAB_BAR_PADDING;

export const SCANNER_TAB_SIZE = 56;
export const SCANNER_TAB_LIFT = 24;

/** @deprecated Use SCANNER_TAB_SIZE — kept for legacy FAB alignment call sites. */
export const CAPTURE_FAB_OUTER_SIZE = SCANNER_TAB_SIZE;

export function getTabBarTotalHeight(
  bottomInset: number,
  spacing: { 8: number; 16: number; 56: number },
) {
  // Float margin + pill + FAB protrusion above the pill.
  return bottomInset + spacing[16] + TAB_BAR_BODY_HEIGHT + SCANNER_TAB_LIFT;
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
  return (
    bottomInset +
    spacing[16] +
    TAB_BAR_PADDING +
    (TAB_BAR_CONTENT_HEIGHT - SCANNER_TAB_SIZE) / 2
  );
}
