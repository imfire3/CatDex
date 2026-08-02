#!/usr/bin/env bash
# Installe Expo Go sur le simulateur iOS depuis le cache local si absent.
# Contourne "TypeError: fetch failed" quand le CLI ne peut pas le télécharger.

set -euo pipefail

EXPO_GO_ID="host.exp.Exponent"
CACHE_APP="${HOME}/.expo/ios-simulator-app-cache/Expo-Go-54.0.7.app"

if ! xcrun simctl list devices booted 2>/dev/null | grep -q "(Booted)"; then
  echo "→ Aucun simulateur démarré. Lance le Simulator ou appuie sur i dans Expo."
  exit 0
fi

if xcrun simctl get_app_container booted "$EXPO_GO_ID" >/dev/null 2>&1; then
  echo "→ Expo Go déjà installé sur le simulateur."
  exit 0
fi

if [[ ! -d "$CACHE_APP" ]]; then
  echo "✗ Expo Go absent du cache: $CACHE_APP"
  echo "  Lance une fois: npx expo start --ios --localhost"
  echo "  Ou télécharge depuis https://github.com/expo/expo-go-releases/releases"
  exit 1
fi

echo "→ Installation d'Expo Go depuis le cache local…"
xcrun simctl install booted "$CACHE_APP"
echo "→ Expo Go installé."
