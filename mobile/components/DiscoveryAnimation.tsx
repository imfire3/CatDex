import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Cat3DAvatar } from './Cat3DAvatar';
import { Colors, FontSize, Spacing } from '../constants/theme';
import type { DiscoveryResult } from '@catdex/shared';

const { width } = Dimensions.get('window');

interface DiscoveryAnimationProps {
  result: DiscoveryResult;
  onComplete: () => void;
}

function Particle({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(-200, { duration: 1500 }));
    opacity.value = withDelay(delay + 800, withTiming(0, { duration: 700 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: x }],
    opacity: opacity.value,
  }));

  const emojis = ['✨', '🎉', '⭐', '🐾', '💫'];
  return (
    <Animated.Text style={[styles.particle, style]}>
      {emojis[Math.abs(x) % emojis.length]}
    </Animated.Text>
  );
}

export function DiscoveryAnimation({ result, onComplete }: DiscoveryAnimationProps) {
  const scale = useSharedValue(0);
  const xpOpacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    xpOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    badgeOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));

    const timer = setTimeout(() => onComplete(), 4000);
    return () => clearTimeout(timer);
  }, []);

  const catStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const xpStyle = useAnimatedStyle(() => ({ opacity: xpOpacity.value }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badgeOpacity.value }));

  const totalXP = result.xpEvents.reduce((s, e) => s + e.amount, 0);

  return (
    <LinearGradient colors={['#1a1a2e', '#e94560', '#1a1a2e']} style={styles.container}>
      <Text style={styles.title}>
        {result.isNewDiscovery ? '🎊 New Discovery!' : '👀 Cat Observed!'}
      </Text>

      {result.isFirstDiscoverer && (
        <Text style={styles.firstDiscoverer}>⭐ First Discoverer!</Text>
      )}

      <Animated.View style={[styles.catContainer, catStyle]}>
        <Cat3DAvatar modelId={result.cat.modelId} size={180} goldenAura={result.cat.isPopular} />
      </Animated.View>

      <Text style={styles.catName}>{result.cat.name}</Text>
      <Text style={styles.catDetails}>
        {result.cat.breed.replace(/_/g, ' ')} · {result.cat.color} · {result.cat.furLength} hair
      </Text>

      <Animated.View style={[styles.xpContainer, xpStyle]}>
        {result.xpEvents.map((event, i) => (
          <View key={i} style={styles.xpRow}>
            <Text style={styles.xpLabel}>{event.label}</Text>
            <Text style={styles.xpAmount}>+{event.amount} XP</Text>
          </View>
        ))}
        <Text style={styles.totalXP}>Total: +{totalXP} XP</Text>
      </Animated.View>

      {result.levelUp && (
        <Animated.View style={[styles.levelUp, xpStyle]}>
          <Text style={styles.levelUpText}>
            🎖️ Level Up! {result.levelUp.from} → {result.levelUp.to}
          </Text>
        </Animated.View>
      )}

      {result.newBadges.length > 0 && (
        <Animated.View style={[styles.badges, badgeStyle]}>
          {result.newBadges.map((badge) => (
            <Text key={badge} style={styles.badgeText}>🏅 Badge Unlocked: {badge.replace(/_/g, ' ')}</Text>
          ))}
        </Animated.View>
      )}

      <View style={styles.particles}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Particle key={i} delay={i * 100} x={(i - 6) * 30} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  firstDiscoverer: {
    fontSize: FontSize.lg,
    color: Colors.gold,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  catContainer: {
    marginVertical: Spacing.lg,
  },
  catName: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.text,
  },
  catDetails: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  xpContainer: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface + 'cc',
    borderRadius: 16,
    padding: Spacing.md,
    width: width - 64,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  xpLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  xpAmount: { color: Colors.accent, fontWeight: '700', fontSize: FontSize.md },
  totalXP: {
    color: Colors.text,
    fontWeight: '800',
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  levelUp: {
    marginTop: Spacing.md,
    backgroundColor: Colors.gold + '33',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  levelUpText: { color: Colors.gold, fontWeight: '700', fontSize: FontSize.lg },
  badges: { marginTop: Spacing.md },
  badgeText: { color: Colors.success, fontWeight: '600', fontSize: FontSize.md, marginBottom: 4 },
  particles: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  particle: { fontSize: 24, position: 'absolute' },
});
