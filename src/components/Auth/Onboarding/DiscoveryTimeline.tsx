import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme/ThemeProvider';

import { FloatingPreviewCard } from './FloatingPreviewCard';
import { TimelineStep } from './TimelineStep';
import type { OnboardingGlyph } from './glyphs';

type TimelineBeat = {
  label: string;
  glyph: OnboardingGlyph;
  preview?: 'sighting' | 'analysis' | 'dex';
};

const DEFAULT_BEATS: TimelineBeat[] = [
  { label: 'Tu repères un chat', glyph: 'eye', preview: 'sighting' },
  { label: 'Tu le photographies', glyph: 'camera' },
  { label: 'L’IA l’identifie', glyph: 'scan', preview: 'analysis' },
  { label: 'Il rejoint ton CatDex', glyph: 'dex', preview: 'dex' },
];

type DiscoveryTimelineProps = {
  beats?: TimelineBeat[];
};

/**
 * Timeline verticale immersive — remplace les trois grosses cards.
 * Flow immédiat : repérer → photographier → identifier → collectionner.
 */
export function DiscoveryTimeline({ beats = DEFAULT_BEATS }: DiscoveryTimelineProps) {
  const { spacing, motion } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.delay(220).duration(motion.duration.slow)}
      style={{
        alignSelf: 'stretch',
        paddingTop: spacing[8],
        gap: 0,
      }}
      accessibilityRole="none"
      accessibilityLabel="Parcours de découverte d’un chat"
    >
      <View style={{ alignSelf: 'stretch' }}>
        {beats.map((beat, index) => {
          const isLast = index === beats.length - 1;
          return (
            <TimelineStep
              key={beat.label}
              label={beat.label}
              glyph={beat.glyph}
              index={index}
              isLast={isLast}
              showConnector={!isLast}
            >
              {beat.preview ? (
                <FloatingPreviewCard
                  variant={beat.preview}
                  delay={200 + index * 160}
                  float={index % 2 === 0}
                />
              ) : null}
            </TimelineStep>
          );
        })}
      </View>
    </Animated.View>
  );
}
