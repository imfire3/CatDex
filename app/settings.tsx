import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer, ScreenHeader } from '@/components/ui/ScreenContainer';
import { BackButton } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Bell,
  MapPin,
  Camera,
  Volume2,
  Vibrate,
  Moon,
  Globe,
  Trash2,
  ChevronRight,
  Shield,
} from 'lucide-react-native';

interface SettingToggle {
  type: 'toggle';
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  description: string;
  defaultValue: boolean;
  color: string;
}

interface SettingLink {
  type: 'link';
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value: string;
  color: string;
}

const SETTINGS: (SettingToggle | SettingLink)[] = [
  { type: 'toggle', icon: Bell, label: 'Push Notifications', description: 'Cat sightings and friend activity', defaultValue: true, color: '#FF6B4A' },
  { type: 'toggle', icon: MapPin, label: 'Location Services', description: 'Required for map exploration', defaultValue: true, color: '#8B5CF6' },
  { type: 'toggle', icon: Camera, label: 'Camera Access', description: 'Capture and document cats', defaultValue: true, color: '#10B981' },
  { type: 'toggle', icon: Volume2, label: 'Sound Effects', description: 'Discovery sounds and UI feedback', defaultValue: true, color: '#3B82F6' },
  { type: 'toggle', icon: Vibrate, label: 'Haptic Feedback', description: 'Vibration on interactions', defaultValue: true, color: '#FFD166' },
  { type: 'toggle', icon: Moon, label: 'Dark Mode', description: 'Switch to dark theme', defaultValue: false, color: '#6B7280' },
  { type: 'link', icon: Globe, label: 'Language', value: 'English', color: '#8B5CF6' },
  { type: 'link', icon: Shield, label: 'Privacy Policy', value: '', color: '#10B981' },
  { type: 'link', icon: Trash2, label: 'Clear Cache', value: '24.3 MB', color: '#EF4444' },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(
      SETTINGS.filter((s) => s.type === 'toggle').map((s) => [s.label, (s as SettingToggle).defaultValue])
    )
  );

  return (
    <GradientBackground variant="warm">
      <ScreenContainer>
        <ScreenHeader title="Settings" left={<BackButton />} />

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {SETTINGS.map((setting, i) => (
            <Animated.View
              key={setting.label}
              entering={FadeInDown.delay(i * 60).springify()}
            >
              <GlassCard className="mb-3">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: setting.color + '15' }}
                  >
                    <setting.icon size={20} color={setting.color} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-850">{setting.label}</Text>
                    {setting.type === 'toggle' && (
                      <Text className="text-xs text-slate-500 mt-0.5">{setting.description}</Text>
                    )}
                  </View>
                  {setting.type === 'toggle' ? (
                    <Switch
                      value={toggles[setting.label]}
                      onValueChange={(v) =>
                        setToggles((prev) => ({ ...prev, [setting.label]: v }))
                      }
                      trackColor={{ false: '#E5E7EB', true: '#FF6B4A' }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <View className="flex-row items-center">
                      {setting.value ? (
                        <Text className="text-sm text-slate-400 mr-1">{setting.value}</Text>
                      ) : null}
                      <ChevronRight size={18} color="#D1D5DB" />
                    </View>
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.delay(600).springify()} className="items-center mt-6">
            <Text className="text-sm text-slate-400">CatDex v1.0.0</Text>
            <Text className="text-xs text-slate-300 mt-1">Made with 🐾 for cat lovers</Text>
          </Animated.View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}
