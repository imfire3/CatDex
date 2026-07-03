import { ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer, ScreenHeader } from '@/components/ui/ScreenContainer';
import { BackButton } from '@/components/ui/BottomNav';
import { BadgeCard } from '@/components/ui/BadgeCard';
import { MOCK_BADGES } from '@/data/mock';

export default function BadgesScreen() {
  const earned = MOCK_BADGES.filter((b) => b.earned).length;

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScreenHeader
          title="Badges"
          subtitle={`${earned} of ${MOCK_BADGES.length} earned`}
          left={<BackButton />}
        />

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            {MOCK_BADGES.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </Animated.View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}
