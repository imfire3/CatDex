import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AppState,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type AppStateStatus,
  type LayoutChangeEvent,
} from 'react-native'
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AuthBackButton } from '@/components/Auth/AuthChrome'
import { BrandLogo } from '@/components/BrandLogo'
import { Text } from '@/components/Text'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  CAPTURE_SHAKE_TOTAL_MS,
  resolveCaptureTap,
  sampleSwingDurationMs,
  type CaptureSwingPhase,
} from '@/lib/captureSwing'
import { useTheme } from '@/theme/ThemeProvider'

const REDUCED_SWING_DURATION_MS = 1_800
const SUCCESS_CALLBACK_DELAY_MS = 300
const SNAP_TO_CENTER_MS = 180
const SHAKE_AMPLITUDE = 8
const REDUCED_PULSE_AMPLITUDE = 4
const RESOLVE_CENTER_EPSILON = 0.01

export type CaptureMinigameProps = {
  photoUri: string
  onCaptured: () => void
  onBack?: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const clampNormalized = (value: number) => {
  return Math.min(1, Math.max(0, value))
}

export function CaptureMinigame({
  photoUri,
  onCaptured,
  onBack,
}: CaptureMinigameProps) {
  const { colors, spacing, radius, shadow, motion } = useTheme()
  const insets = useSafeAreaInsets()
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<CaptureSwingPhase>('swinging')
  const [trackWidth, setTrackWidth] = useState(0)

  const phaseRef = useRef<CaptureSwingPhase>('swinging')
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const currentTargetRef = useRef<0 | 1>(1)
  const normalizedMirrorRef = useRef(0)
  const captureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didCallCapturedRef = useRef(false)

  const capsuleSize = spacing[56]
  const targetSize = spacing[64]
  const successLabelOffset = spacing[80]
  const normalizedX = useSharedValue(0)
  const shakeOffset = useSharedValue(0)
  const flashOpacity = useSharedValue(0)

  const clearCaptureTimeout = useCallback(() => {
    if (!captureTimeoutRef.current) return
    clearTimeout(captureTimeoutRef.current)
    captureTimeoutRef.current = null
  }, [])

  const handleNormalizedChange = useCallback((nextValue: number) => {
    normalizedMirrorRef.current = nextValue
  }, [])

  const fireCapturedOnce = useCallback(() => {
    if (didCallCapturedRef.current) return
    didCallCapturedRef.current = true
    onCaptured()
  }, [onCaptured])

  const scheduleCapturedCallback = useCallback(() => {
    if (appStateRef.current !== 'active') return
    if (didCallCapturedRef.current) return

    clearCaptureTimeout()
    captureTimeoutRef.current = setTimeout(() => {
      fireCapturedOnce()
    }, SUCCESS_CALLBACK_DELAY_MS)
  }, [clearCaptureTimeout, fireCapturedOnce])

  const cancelMinigameAnimations = useCallback(() => {
    cancelAnimation(normalizedX)
    cancelAnimation(shakeOffset)
    cancelAnimation(flashOpacity)
  }, [flashOpacity, normalizedX, shakeOffset])

  const handleSwingStepFinished = useCallback(
    (target: 0 | 1) => {
      if (phaseRef.current !== 'swinging') return
      if (appStateRef.current !== 'active') return

      currentTargetRef.current = target === 1 ? 0 : 1
      const duration = reduceMotion
        ? REDUCED_SWING_DURATION_MS
        : sampleSwingDurationMs()

      normalizedX.value = withTiming(currentTargetRef.current, { duration }, (finished) => {
        if (finished) {
          runOnJS(handleSwingStepFinished)(currentTargetRef.current)
        }
      })
    },
    [normalizedX, reduceMotion],
  )

  const restartCurrentHalfCycle = useCallback(() => {
    if (phaseRef.current !== 'swinging') return
    if (appStateRef.current !== 'active') return

    const currentValue = clampNormalized(normalizedMirrorRef.current)
    const target = currentTargetRef.current
    const remainingFraction = Math.max(0.08, Math.abs(target - currentValue))
    const baseDuration = reduceMotion
      ? REDUCED_SWING_DURATION_MS
      : sampleSwingDurationMs()
    const duration = Math.max(
      motion.duration.fast,
      Math.round(baseDuration * remainingFraction),
    )

    normalizedX.value = withTiming(target, { duration }, (finished) => {
      if (finished) {
        runOnJS(handleSwingStepFinished)(target)
      }
    })
  }, [handleSwingStepFinished, motion.duration.fast, normalizedX, reduceMotion])

  const handleSuccessAnimationComplete = useCallback(() => {
    if (phaseRef.current !== 'resolving') return

    setPhase('success')
    phaseRef.current = 'success'

    if (appStateRef.current === 'active' && Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    scheduleCapturedCallback()
  }, [scheduleCapturedCallback])

  const runSuccessShake = useCallback(() => {
    if (phaseRef.current !== 'resolving') return
    if (appStateRef.current !== 'active') return

    const fullSegment = Math.round(CAPTURE_SHAKE_TOTAL_MS / 7)
    cancelAnimation(shakeOffset)
    shakeOffset.value = 0

    if (reduceMotion) {
      shakeOffset.value = withSequence(
        withTiming(REDUCED_PULSE_AMPLITUDE, { duration: motion.duration.fast }),
        withTiming(0, { duration: motion.duration.fast }, (finished) => {
          if (finished) {
            runOnJS(handleSuccessAnimationComplete)()
          }
        }),
      )
      return
    }

    shakeOffset.value = withSequence(
      withTiming(-SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(-SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(-SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(SHAKE_AMPLITUDE, { duration: fullSegment }),
      withTiming(0, { duration: fullSegment }, (finished) => {
        if (finished) {
          runOnJS(handleSuccessAnimationComplete)()
        }
      }),
    )
  }, [
    handleSuccessAnimationComplete,
    motion.duration.fast,
    reduceMotion,
    shakeOffset,
  ])

  const resumeCaptureResolution = useCallback(() => {
    if (appStateRef.current !== 'active') return

    if (phaseRef.current === 'success') {
      scheduleCapturedCallback()
      return
    }

    if (phaseRef.current !== 'resolving') return

    clearCaptureTimeout()
    cancelMinigameAnimations()
    flashOpacity.value = 0
    shakeOffset.value = 0

    const currentValue = clampNormalized(normalizedMirrorRef.current)
    const snapDuration =
      Math.abs(currentValue - 0.5) <= RESOLVE_CENTER_EPSILON ? 0 : SNAP_TO_CENTER_MS

    normalizedX.value = withTiming(0.5, { duration: snapDuration }, (finished) => {
      if (finished) {
        runOnJS(runSuccessShake)()
      }
    })
  }, [
    cancelMinigameAnimations,
    clearCaptureTimeout,
    flashOpacity,
    normalizedX,
    runSuccessShake,
    scheduleCapturedCallback,
    shakeOffset,
  ])

  const handleMiss = useCallback(() => {
    flashOpacity.value = 0
    flashOpacity.value = withSequence(
      withTiming(1, { duration: motion.duration.fast }),
      withTiming(0, { duration: motion.duration.fast }),
    )

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  }, [flashOpacity, motion.duration.fast])

  const handleHit = useCallback(() => {
    setPhase('resolving')
    phaseRef.current = 'resolving'
    clearCaptureTimeout()
    cancelMinigameAnimations()
    shakeOffset.value = 0
    flashOpacity.value = 0
    resumeCaptureResolution()
  }, [
    cancelMinigameAnimations,
    clearCaptureTimeout,
    flashOpacity,
    resumeCaptureResolution,
    shakeOffset,
  ])

  const handleTap = useCallback(() => {
    const result = resolveCaptureTap(
      phaseRef.current,
      clampNormalized(normalizedMirrorRef.current),
    )

    if (result === 'ignored') return
    if (result === 'miss') {
      handleMiss()
      return
    }

    handleHit()
  }, [handleHit, handleMiss])

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width)
  }, [])

  useAnimatedReaction(
    () => normalizedX.value,
    (value) => {
      runOnJS(handleNormalizedChange)(value)
    },
    [handleNormalizedChange, normalizedX],
  )

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    restartCurrentHalfCycle()
  }, [restartCurrentHalfCycle])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState

      if (nextState === 'active') {
        if (phaseRef.current === 'swinging') {
          restartCurrentHalfCycle()
          return
        }

        resumeCaptureResolution()
        return
      }

      clearCaptureTimeout()
      cancelMinigameAnimations()
      shakeOffset.value = 0
      flashOpacity.value = 0
    })

    return () => {
      subscription.remove()
    }
  }, [
    cancelMinigameAnimations,
    clearCaptureTimeout,
    flashOpacity,
    restartCurrentHalfCycle,
    resumeCaptureResolution,
    shakeOffset,
  ])

  useEffect(() => {
    return () => {
      clearCaptureTimeout()
      cancelMinigameAnimations()
    }
  }, [cancelMinigameAnimations, clearCaptureTimeout])

  const capsuleStyle = useAnimatedStyle(() => {
    const travel = Math.max(trackWidth - capsuleSize, 0)
    return {
      transform: [
        {
          translateX: normalizedX.value * travel + shakeOffset.value,
        },
      ],
    }
  })

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }))

  const bottomZoneStyle = useAnimatedStyle(() => ({
    opacity: phase === 'success' ? 0.96 : 1,
  }))

  const isTapEnabled = phase === 'swinging'

  return (
    <View style={styles.root}>
      <Image
        source={{ uri: photoUri }}
        accessibilityRole="image"
        accessibilityLabel="Photo du chat à capturer"
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.text,
            opacity: 0.4,
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.dangerSoft,
          },
          flashStyle,
        ]}
      />

      {onBack ? (
        <View
          style={{
            position: 'absolute',
            top: insets.top + spacing[8],
            left: spacing[24],
            zIndex: 3,
          }}
        >
          <AuthBackButton onPress={onBack} />
        </View>
      ) : null}

      <View
        pointerEvents="none"
        style={[
          styles.targetWrap,
          {
            top: '32%',
          },
        ]}
      >
        <View
          style={[
            styles.targetRing,
            {
              width: targetSize,
              height: targetSize,
              borderRadius: radius.full,
              borderColor: colors.brand,
              backgroundColor: colors.brandSoft,
            },
          ]}
        />
        {phase === 'success' ? (
          <View style={{ position: 'absolute', top: successLabelOffset }}>
            <Text variant="title" color="onBrand" align="center">
              Capturé !
            </Text>
          </View>
        ) : null}
      </View>

      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={isTapEnabled ? 'Taper pour capturer' : 'Capture en cours'}
        accessibilityHint={isTapEnabled ? 'Tape quand la capsule passe au centre' : undefined}
        accessibilityState={{ disabled: !isTapEnabled }}
        disabled={!isTapEnabled}
        onPress={handleTap}
        style={[
          styles.bottomZone,
          {
            top: '55%',
          },
          bottomZoneStyle,
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.trackArea,
            {
              bottom: insets.bottom + spacing[96],
              paddingHorizontal: spacing[24],
              gap: spacing[16],
            },
          ]}
        >
          <Text variant="bodySmall" color="onBrand" align="center">
            Tape quand la capsule passe au centre
          </Text>

          <View
            style={[
              styles.trackContainer,
              {
                height: capsuleSize,
              },
            ]}
          >
            <View
              onLayout={handleTrackLayout}
              style={[
                styles.track,
                {
                  height: spacing[4],
                  borderRadius: radius.full,
                  backgroundColor: colors.surface,
                  opacity: 0.35,
                },
              ]}
            />

            <View
              style={[
                styles.trackCenterMarker,
                {
                  width: spacing[8],
                  height: spacing[8],
                  borderRadius: radius.full,
                  backgroundColor: colors.brand,
                },
              ]}
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.capsuleWrap,
                {
                  width: capsuleSize,
                  height: capsuleSize,
                },
                capsuleStyle,
              ]}
            >
              <View
                style={[
                  styles.capsule,
                  {
                    borderRadius: radius.full,
                    borderColor: colors.brand,
                    backgroundColor: colors.surface,
                  },
                  shadow.medium,
                ]}
              >
                <View
                  style={[
                    styles.capsuleHalf,
                    {
                      backgroundColor: colors.brand,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.capsuleHalf,
                    {
                      backgroundColor: colors.surface,
                    },
                  ]}
                />
                <View style={styles.capsuleLogo}>
                  <BrandLogo size={spacing[24]} accessibilityLabel="Capsule CatDex" />
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  targetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetRing: {
    borderWidth: 3,
  },
  bottomZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  trackArea: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  trackContainer: {
    justifyContent: 'center',
  },
  track: {
    width: '100%',
  },
  trackCenterMarker: {
    position: 'absolute',
    left: '50%',
    marginLeft: -4,
    alignSelf: 'center',
  },
  capsuleWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  capsule: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 2,
    flexDirection: 'row',
  },
  capsuleHalf: {
    flex: 1,
  },
  capsuleLogo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
