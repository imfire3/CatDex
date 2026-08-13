import type { ReactNode } from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'

import { Text } from '@/components/Text'
import { palette } from '@/theme/colors'

/** iPhone 14/15 logical width — matches design screenshots & mobile-first UI. */
export const MOBILE_WEB_WIDTH = 390

/** Above this viewport width, show the centered phone frame on web. */
const DESKTOP_BREAKPOINT = 480

const FRAME_MAX_HEIGHT = 852

type MobileWebFrameProps = {
  children: ReactNode
}

/**
 * Web beta: force a phone-sized layout on desktop so testers see the real
 * mobile UI until the App Store build ships. Native / narrow web = full bleed.
 */
export function MobileWebFrame({ children }: MobileWebFrameProps) {
  const { width, height } = useWindowDimensions()

  if (Platform.OS !== 'web') {
    return <>{children}</>
  }

  const isDesktop = width >= DESKTOP_BREAKPOINT
  const frameWidth = Math.min(MOBILE_WEB_WIDTH, width)
  const frameHeight = isDesktop
    ? Math.min(FRAME_MAX_HEIGHT, Math.max(560, height - 64))
    : height

  if (!isDesktop) {
    return <View style={styles.fill}>{children}</View>
  }

  return (
    <View
      style={[styles.stage, { backgroundColor: palette.light.text }]}
      accessibilityLabel="CatDex aperçu mobile"
    >
      <Text
        variant="caption"
        color="textInverse"
        style={styles.caption}
        accessibilityRole="text"
      >
        Bêta web · aperçu mobile (App Store bientôt)
      </Text>
      <View
        style={[
          styles.phone,
          {
            width: frameWidth,
            height: frameHeight,
            backgroundColor: palette.light.background,
            borderColor: palette.light.borderDefault,
          },
        ]}
      >
        <View style={styles.fill}>{children}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  stage: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  caption: {
    textAlign: 'center',
    opacity: 0.72,
  },
  phone: {
    maxWidth: '100%',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    // Soft device edge on desktop (web-only boxShadow).
    boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
  } as object,
})
