# 🧭 Mode Boussole - CatDex

Le mode boussole permet de suivre votre position ET votre orientation en temps réel sur la carte, comme une vraie boussole de navigation.

## 📍 Fonctionnement

### Activation

1. Ouvrez l'onglet **Carte** (Explorer)
2. Appuyez sur le **bouton violet en haut à droite** (icône boussole)
3. Le bouton devient violet foncé quand le mode est actif

### Comportement

Quand le mode boussole est **actif** :

- ✅ La carte **suit votre position GPS** en temps réel
- ✅ La carte **s'oriente selon votre téléphone** :
  - Le haut de l'écran indique toujours votre direction de face
  - Tournez votre téléphone → la carte tourne avec vous
- ✅ Le **marqueur joueur tourne** aussi selon votre orientation
- ✅ Navigation style Pokémon GO / Google Maps

Quand le mode boussole est **inactif** :

- ❌ La carte ne suit plus votre position automatiquement
- ❌ Le nord est toujours en haut
- ✅ Vous pouvez explorer librement la carte

### Désactivation

- Appuyez à nouveau sur le bouton violet
- OU déplacez/zoomez manuellement la carte (pause automatique)

## 🎯 Cas d'usage

### Explorer en marchant

Le mode boussole est idéal pour :

- 🚶 Marcher dans le quartier à la recherche de chats
- 🗺️ Se repérer facilement (la direction de face est toujours en haut)
- 📍 Localiser rapidement les chats proches de vous
- 🎮 Expérience immersive type "exploration AR"

### Explorer la carte statique

Désactivez le mode boussole pour :

- 🔍 Consulter les chats loin de vous
- 🗺️ Planifier votre prochaine exploration
- 📊 Vue d'ensemble du quartier

## 🔧 Implémentation technique

### Architecture

```
app/(tabs)/map.tsx
  ├─ État : compassMode (boolean)
  ├─ GPS : watchPositionAsync() → userCoordinate
  ├─ Orientation : watchHeadingAsync() → userHeading
  └─ Rendu : <CatMap userHeading={...} followUser={...} />

components/maps/CatMap
  ├─ Native : MapView avec camera bearing
  └─ Web : MapLibre avec easeTo({ bearing })

components/maps/MapExplorerHud.tsx
  └─ Bouton boussole (RoundTool avec active={compassActive})
```

### Flux de données

```typescript
// 1. GPS Watch (Native & Web)
Location.watchPositionAsync() → setUserCoordinate()

// 2. Compass Watch (Native)
Location.watchHeadingAsync() → setUserHeading()

// 2. Compass Watch (Web)
DeviceOrientationEvent → headingFromDeviceOrientation() → setUserHeading()

// 3. Camera Update
userHeading → mapBearingFromHeading() → map.easeTo({ bearing })
```

### Permissions

#### Native (iOS/Android)

```typescript
// GPS : Automatique via expo-location
// Boussole : Inclus dans Location.watchHeadingAsync()
```

#### Web

```typescript
// GPS : navigator.geolocation.watchPosition()
// Boussole : DeviceOrientationEvent

// iOS Safari : permission explicite requise
if (webCompassNeedsUserGesture()) {
  DeviceOrientationEvent.requestPermission()
}
```

## 📱 Plateformes

| Plateforme | GPS | Boussole | Notes |
|------------|-----|----------|-------|
| iOS Native | ✅ | ✅ | Utilise CoreLocation |
| Android Native | ✅ | ✅ | Utilise FusedLocationProvider |
| Web Desktop | ✅ | ⚠️ | Boussole désactivée (pas de capteurs) |
| Web iOS Safari | ✅ | ✅ | Permission `DeviceOrientationEvent` requise |
| Web Android Chrome | ✅ | ✅ | Fonctionne automatiquement |

⚠️ **iOS Safari Web** : L'utilisateur doit accepter les capteurs de mouvement au premier clic sur le bouton boussole.

## 🎨 Design

### États du bouton

| État | Couleur | Icône | Signification |
|------|---------|-------|---------------|
| Inactif | Blanc | Boussole grise | Mode désactivé |
| Actif | Violet `#6A69F8` | Boussole blanche | Mode activé + suivi actif |

### Transitions

```typescript
// Animation press
transform: [{ scale: pressed ? 0.98 : 1 }]

// Camera rotation
duration: 220ms (motion.standard)
easing: ease-out
```

## 🐛 Dépannage

### La carte ne tourne pas

1. **Vérifier le mode boussole** : Le bouton doit être violet
2. **Permissions** : Autoriser GPS + capteurs de mouvement (iOS Safari)
3. **Plateforme** : Desktop n'a pas de boussole (normal)

### La carte ne suit plus ma position

- **Raison** : Vous avez déplacé/zoomé la carte manuellement
- **Solution** : Appuyez à nouveau sur le bouton boussole

### iOS Safari : la boussole ne fonctionne pas

1. Appuyez sur le bouton boussole
2. Acceptez la permission "Mouvement et orientation"
3. La boussole devrait fonctionner

## 🔗 Fichiers clés

- `app/(tabs)/map.tsx` - Logique principale + état
- `src/components/maps/CatMap.native.tsx` - Carte native avec bearing
- `src/components/maps/CatMap.web.tsx` - Carte web avec MapLibre
- `src/components/maps/MapExplorerHud.tsx` - Bouton boussole UI
- `src/lib/mapHeading.ts` - Conversion heading → bearing
- `src/lib/locationAccess.ts` - Permissions GPS + boussole

## 📚 Références

- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [DeviceOrientationEvent MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

Le mode boussole est déjà **complètement fonctionnel** dans CatDex ! 🎉
