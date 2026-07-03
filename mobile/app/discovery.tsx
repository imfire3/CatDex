import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DiscoveryAnimation } from '../components/DiscoveryAnimation';
import type { DiscoveryResult } from '@catdex/shared';
import { Colors } from '../constants/theme';

export default function DiscoveryScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();

  let result: DiscoveryResult | null = null;
  try {
    result = data ? JSON.parse(data) : null;
  } catch {
    result = null;
  }

  if (!result) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Discovery data not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <DiscoveryAnimation
      result={result}
      onComplete={() => router.replace(`/cat/${result!.cat.id}`)}
    />
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.text, marginBottom: 16 },
  back: { color: Colors.primary, fontWeight: '700' },
});
