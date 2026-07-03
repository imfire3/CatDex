import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AtSign, Sparkles } from 'lucide-react-native';

const SUGGESTIONS = ['CatExplorer', 'WhiskerWitch', 'PawPrintPro', 'MeowMaven', 'TabbyTracker'];

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('CatExplorer');

  return (
    <GradientBackground variant="warm">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScreenContainer className="px-6">
          <Animated.View entering={FadeInUp.springify()} className="pt-8 mb-8">
            <Text className="text-4xl font-extrabold text-slate-850 tracking-tight">
              Choose a Username
            </Text>
            <Text className="text-lg text-slate-500 mt-2">
              This is how other explorers will know you in the cat community.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <GlassCard>
              <View className="flex-row items-center gap-3 mb-2">
                <AtSign size={20} color="#FF6B4A" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-slate-500">Username</Text>
              </View>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                className="text-2xl font-bold text-slate-850 py-2"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
              <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <Sparkles size={14} color="#10B981" />
                <Text className="text-sm text-mint-600 font-semibold">Username is available!</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} className="mt-6">
            <Text className="text-sm font-semibold text-slate-500 mb-3">Suggestions</Text>
            <View className="flex-row flex-wrap gap-2">
              {SUGGESTIONS.map((name) => (
                <Animated.View key={name}>
                  <Button
                    title={name}
                    variant={username === name ? 'primary' : 'secondary'}
                    size="sm"
                    onPress={() => setUsername(name)}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <View className="flex-1" />

          <Animated.View entering={FadeInUp.delay(500).springify()} className="pb-6">
            <Button
              title="Start Exploring"
              onPress={() => router.replace('/(main)/map')}
              fullWidth
            />
          </Animated.View>
        </ScreenContainer>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
