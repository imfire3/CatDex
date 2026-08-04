import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Component, useEffect, useMemo, type ErrorInfo, type ReactNode } from 'react';

import { CatCardDetail } from '@/components/CatCardDetail';
import { PageLoading } from '@/components/Loader';
import { ProblemState } from '@/components/ProblemState';
import { enrichAnalysis } from '@/lib/catTraits';
import { useCatsStore } from '@/store/cats';

function goBackFromCat() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/catdex');
}

function resolveParamId(raw: string | string[] | undefined): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
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
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = resolveParamId(params.id);
  const hydrated = useCatsStore((state) => state.hydrated);
  const cats = useCatsStore((state) => state.cats);
  const incrementViews = useCatsStore((state) => state.incrementViews);

  const cat = useMemo(
    () => (id ? cats.find((item) => item.id === id) : undefined),
    [cats, id],
  );

  const analysis = useMemo(
    () => (cat ? enrichAnalysis(cat.analysis, cat.number) : null),
    [cat],
  );

  useEffect(() => {
    if (!id || !cat) return;
    incrementViews(id);
  }, [id, cat?.id, incrementViews]);

  if (!hydrated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <PageLoading label="Chargement du CatDex…" />
      </>
    );
  }

  if (!id || !cat || !analysis) {
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
        analysis={analysis}
        discoveredAt={cat.discoveredAt}
        views={cat.views}
        onBack={goBackFromCat}
      />
    </CatDetailErrorBoundary>
  );
}
