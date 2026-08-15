import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatDexCard } from '@/components/CatDexCard'
import { CatDexEmpty } from '@/components/CatDexEmpty'
import { EmptyState } from '@/components/EmptyState'
import { PageLoading } from '@/components/Loader'
import { Text } from '@/components/Text'
import { MOBILE_WEB_WIDTH } from '@/layout/MobileWebFrame'
import { TabStackHeader } from '@/layout/TabStackHeader'
import {
  buildOwnedCatIdSet,
  getCatDiscoveryState,
} from '@/lib/catDiscovery'
import { isCatVisibleOnMap } from '@/lib/catLifestyle'
import { CATDEX_TARGET } from '@/lib/constants'
import { pullCommunityCatsForMap } from '@/lib/catSync'
import { type CatDexRarityFilter, matchesCatDexRarityFilter } from '@/lib/catTheme'
import {
  DEMO_COMMUNITY_CATS,
  isMapDemoEnabled,
  mergeCatsById,
} from '@/lib/demoCats'
import { getCurrentLocationCoordinate } from '@/lib/locationAccess'
import { sortCatsByDistance } from '@/lib/mapExplore'
import { useCatsStore } from '@/store/cats'
import { useCommunityCatsStore } from '@/store/communityCats'
import { useMapExploreStore } from '@/store/mapExplore'
import { useTheme } from '@/theme/ThemeProvider'
import type { Cat } from '@/types/cat'

type ListFilter = CatDexRarityFilter | 'favorites' | 'discoverable'

const RARITY_FILTERS: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'discoverable', label: 'À découvrir' },
  { id: 'favorites', label: 'Favoris' },
  { id: 'common', label: 'Commun' },
  { id: 'uncommon', label: 'Rare' },
  { id: 'rare', label: 'Épique' },
  { id: 'exceptional', label: 'Légendaire' },
]

const COLUMNS = 2
/** Matches MobileWebFrame desktop phone preview breakpoint. */
const DESKTOP_WEB_BREAKPOINT = 480

export default function CatDexScreen() {
  const { colors, spacing, radius } = useTheme()
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const ownedCats = useCatsStore((state) => state.cats)
  const hydrated = useCatsStore((state) => state.hydrated)
  const sharedCommunityCats = useCommunityCatsStore((state) => state.cats)
  const setSharedCommunityCats = useCommunityCatsStore((state) => state.setCats)
  const requestFocusOnCat = useMapExploreStore((state) => state.requestFocusOnCat)
  const [listFilter, setListFilter] = useState<ListFilter>('all')
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set())
  const [userCoordinate, setUserCoordinate] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  /** Width of the grid row (inside ScrollView padding). */
  const [gridWidth, setGridWidth] = useState(0)

  const mapDemo = isMapDemoEnabled()
  const ownedIds = useMemo(() => buildOwnedCatIdSet(ownedCats), [ownedCats])

  const refreshCommunity = useCallback(async () => {
    const remote = await pullCommunityCatsForMap()
    const next = mapDemo ? mergeCatsById(remote, DEMO_COMMUNITY_CATS) : remote
    setSharedCommunityCats(next)
  }, [mapDemo, setSharedCommunityCats])

  useFocusEffect(
    useCallback(() => {
      void refreshCommunity()
    }, [refreshCommunity]),
  )

  useEffect(() => {
    let mounted = true
    void getCurrentLocationCoordinate().then((next) => {
      if (mounted && next) setUserCoordinate(next)
    })

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!mounted) return
          setUserCoordinate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 5_000, timeout: 10_000 },
      )
      return () => {
        mounted = false
        navigator.geolocation.clearWatch(watchId)
      }
    }

    return () => {
      mounted = false
    }
  }, [])

  /** Owned CatDex + discoverable community pins (not yet captured). */
  const catalog = useMemo(() => {
    const byId = new Map<string, Cat>()

    for (const cat of sharedCommunityCats) {
      if (!isCatVisibleOnMap(cat)) continue
      if (getCatDiscoveryState(cat, ownedIds) === 'owned') continue
      byId.set(cat.remoteId || cat.id, cat)
    }

    for (const cat of ownedCats) {
      byId.set(cat.remoteId || cat.id, cat)
    }

    return [...byId.values()]
  }, [sharedCommunityCats, ownedCats, ownedIds])

  const filtered = useMemo(() => {
    const list = catalog.filter((cat) => {
      if (!cat?.id) return false
      const captured = getCatDiscoveryState(cat, ownedIds) === 'owned'

      if (listFilter === 'favorites') {
        if (!favorites.has(cat.id)) return false
      } else if (listFilter === 'discoverable') {
        if (captured) return false
      } else if (
        listFilter !== 'all' &&
        !matchesCatDexRarityFilter(cat.analysis ?? {}, cat.number ?? 0, listFilter)
      ) {
        return false
      }

      return true
    })

    return sortCatsByDistance(list, userCoordinate).sort((a, b) => {
      const aOwned = getCatDiscoveryState(a.cat, ownedIds) === 'owned' ? 0 : 1
      const bOwned = getCatDiscoveryState(b.cat, ownedIds) === 'owned' ? 0 : 1
      if (aOwned !== bOwned) return aOwned - bOwned
      return a.distanceM - b.distanceM
    })
  }, [catalog, favorites, listFilter, ownedIds, userCoordinate])

  const cardGap = spacing[16]
  const horizontalPad = spacing[24]
  const fallbackFrame =
    windowWidth >= DESKTOP_WEB_BREAKPOINT
      ? Math.min(windowWidth, MOBILE_WEB_WIDTH)
      : windowWidth
  const rowWidth =
    gridWidth > 0
      ? gridWidth
      : Math.max(0, fallbackFrame - horizontalPad * 2)
  const cardWidth = Math.max(
    0,
    Math.floor((rowWidth - cardGap * (COLUMNS - 1)) / COLUMNS),
  )
  const listBottom = Math.max(insets.bottom, spacing[16]) + spacing[24]

  const toggleFavorite = (catId: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  const handlePressCat = useCallback(
    (cat: Cat, captured: boolean) => {
      if (captured) {
        router.push({ pathname: '/cat/[id]', params: { id: cat.id } })
        return
      }
      requestFocusOnCat({
        catId: cat.id,
        latitude: cat.latitude,
        longitude: cat.longitude,
        pinZoom: true,
      })
      router.push('/(tabs)/map')
    },
    [requestFocusOnCat],
  )

  if (!hydrated) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <PageLoading label="Chargement du CatDex…" />
      </View>
    )
  }

  const empty = (() => {
    if (ownedCats.length === 0 && catalog.length === 0) {
      return <CatDexEmpty onExplore={() => router.push('/(tabs)/map')} />
    }
    if (listFilter === 'favorites' && favorites.size === 0) {
      return (
        <EmptyState
          layout="page"
          icon="heart"
          title="Aucun favori pour le moment"
          description="Ajoute des chats à tes favoris en appuyant sur le cœur sur leur carte."
          actionLabel="Découvrir des chats"
          onAction={() => setListFilter('all')}
        />
      )
    }
    if (listFilter === 'discoverable') {
      return (
        <EmptyState
          layout="page"
          icon="search"
          title="Tout est collecté"
          description="Plus de chats mystère autour de toi pour l’instant — reviens plus tard."
          actionLabel="Voir tous"
          actionVariant="secondary"
          onAction={() => setListFilter('all')}
        />
      )
    }
    return (
      <EmptyState
        layout="page"
        icon="search"
        title="Aucun chat ici"
        description="Essaie un autre filtre de rareté."
        actionLabel="Voir tous"
        actionVariant="secondary"
        onAction={() => setListFilter('all')}
      />
    )
  })()

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TabStackHeader
        title="CatDex"
        right={
          <Text variant="bodySmall" weight="semibold" color="brand">
            {ownedCats.length} / {CATDEX_TARGET}
          </Text>
        }
        below={
          <View style={{ width: '100%', minWidth: 0 }}>
            <FilterChipsScroller>
              {RARITY_FILTERS.map((filter) => {
                const selected = listFilter === filter.id
                return (
                  <Pressable
                    key={filter.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setListFilter(filter.id)}
                    style={({ pressed }) => ({
                      height: spacing[40],
                      paddingHorizontal: spacing[16],
                      borderRadius: radius.full,
                      backgroundColor: selected ? colors.brand : colors.surfaceElevated,
                      borderWidth: selected ? 0 : 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      color={selected ? 'onAccent' : 'textBrand'}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                )
              })}
            </FilterChipsScroller>
          </View>
        }
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPad,
          paddingTop: spacing[16],
          paddingBottom: listBottom,
          flexGrow: 1,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          empty
        ) : (
          <View
            style={[styles.grid, { gap: cardGap }]}
            onLayout={(event) => {
              const next = event.nativeEvent.layout.width
              if (next > 0 && next !== gridWidth) setGridWidth(next)
            }}
          >
            {filtered.map(({ cat }) => {
              const captured =
                getCatDiscoveryState(cat, ownedIds) === 'owned'
              return (
                <View
                  key={cat.id}
                  style={{
                    width: cardWidth,
                    maxWidth: cardWidth,
                    minWidth: 0,
                    flexGrow: 0,
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  <CatDexCard
                    cat={cat}
                    captured={captured}
                    isFavorite={favorites.has(cat.id)}
                    onToggleFavorite={
                      captured ? () => toggleFavorite(cat.id) : undefined
                    }
                    onPress={() => handlePressCat(cat, captured)}
                  />
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

/** Horizontal chip row — native ScrollView grows with content on web, so use overflow-x there. */
function FilterChipsScroller({ children }: { children: ReactNode }) {
  const { spacing } = useTheme()

  if (Platform.OS === 'web') {
    return (
      <div
        role="navigation"
        aria-label="Filtres de rareté"
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: spacing[8],
          paddingRight: spacing[16],
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[8],
        paddingRight: spacing[16],
      }}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
})
