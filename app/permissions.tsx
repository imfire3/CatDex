import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { MapPin, Camera, Bell } from 'lucide-react-native';

const PERMISSIONS = [
  {
    icon: MapPin,
    title: 'Location Access',
    description: 'Find cats near you and track your exploration routes on the map.',
    color: '#FF6B4A',
  },
  {
    icon: Camera,
    title: 'Camera Access',
    description: 'Capture photos of street cats to add them to your ChatDex collection.',
    color: '#8B5CF6',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get alerted when rare cats appear nearby or friends make discoveries.',
    color: '#FFD166',
  },
];

export default function PermissionsScreen() {
  const router = useRouter();

  return (
    <GradientBackground variant="warm">
      <ScreenContainer className="px-6">
        <Animated.View entering={FadeInUp.springify()} className="pt-8 mb-8">
          <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
            Enable Permissions
          </Text>
          <Text className="text-lg text-slate-500 mt-2 leading-6">
            CatDex needs a few permissions to deliver the full exploration experience.
          </Text>
        </Animated.View>

        <View className="flex-1 gap-4">
          {PERMISSIONS.map((perm, i) => (
            <Animated.View key={perm.title} entering={FadeInDown.delay(i * 120).springify()}>
              <GlassCard>
                <View className="flex-row items-start gap-4">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: perm.color + '20' }}
                  >
                    <perm.icon size={26} color={perm.color} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-850">{perm.title}</Text>
                    <Text className="text-sm text-slate-500 mt-1 leading-5">{perm.description}</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(500).springify()} className="pb-6 gap-3">
          <Button
            title="Allow All Permissions"
            onPress={() => router.push('/introduction')}
            fullWidth
          />
          <Button
            title="Maybe Later"
            variant="ghost"
            onPress={() => router.push('/introduction')}
            fullWidth
          />
        </Animated.View>
      </ScreenContainer>
    </GradientBackground>
  );
}
