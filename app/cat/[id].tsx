import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';

import { CatCardDetail } from '@/components/CatCardDetail';
import { ProblemState } from '@/components/ProblemState';
import { useCatsStore } from '@/store/cats';

function goBackFromCat() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/catdex');
}

type BoundaryProps = { children: ReactNode };
type BoundaryState = { hasError: boolean };

/** Catch render bugs on the cat fiche and offer a clear Retour. */
class CatDetailErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CatDetail]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <ProblemState
            title="Oups"
            description="Il y a un problème avec cette fiche chat. Reviens en arrière pour continuer."
            actionLabel="Retour"
            onAction={goBackFromCat}
          />
        </>
      );
    }
    return this.props.children;
  }
}

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = useCatsStore((state) => state.cats.find((item) => item.id === id));
  const incrementViews = useCatsStore((state) => state.incrementViews);

  useEffect(() => {
    if (!id || !cat) return;
    incrementViews(id);
  }, [id, cat, incrementViews]);

  if (!id || !cat) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ProblemState
          title="Oups"
          description="Il y a un problème — ce chat est introuvable."
          actionLabel="Retour"
          onAction={goBackFromCat}
        />
      </>
    );
  }

  return (
    <CatDetailErrorBoundary>
      <Stack.Screen options={{ headerShown: false }} />
      <CatCardDetail
        name={cat.name}
        number={cat.number}
        photoUri={cat.photoUri}
        analysis={cat.analysis}
        discoveredAt={cat.discoveredAt}
        views={cat.views}
        onBack={goBackFromCat}
      />
    </CatDetailErrorBoundary>
  );
}
