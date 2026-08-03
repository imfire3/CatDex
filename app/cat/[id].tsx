import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { CatCardDetail } from '@/components/CatCardDetail';
import { ProblemState } from '@/components/ProblemState';
import { useCatsStore } from '@/store/cats';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (!id) return;
    incrementViews(id);
  }, [id, incrementViews]);

  if (!cat) {
    return (
      <ProblemState
        title="Oups"
        description="Il y a un problème — ce chat est introuvable."
        actionLabel="Retour"
        onAction={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/catdex');
        }}
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CatCardDetail
        name={cat.name}
        number={cat.number}
        photoUri={cat.photoUri}
        analysis={cat.analysis}
        discoveredAt={cat.discoveredAt}
        favorited={favorited}
        onToggleFavorite={() => setFavorited((v) => !v)}
        onBack={() => router.back()}
        primaryLabel="Retour au CatDex"
        onPrimaryAction={() => router.replace('/(tabs)/catdex')}
      />
    </>
  );
}
