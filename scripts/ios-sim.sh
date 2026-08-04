#!/usr/bin/env bash
# Boot iOS Simulator + ensure Expo Go (SDK 54) + start Metro for CatDex.
# Run on macOS only: npm run ios:sim

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "✗ Ce script doit tourner sur macOS (simulateur iOS)."
  exit 1
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "✗ Xcode CLT introuvables. Installe Xcode depuis l’App Store, puis :"
  echo "  xcode-select --install"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "✗ Node/npm introuvables. Installe Node 20+ (https://nodejs.org)."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "→ Pas de .env — copie depuis l’exemple…"
  cp .env.example .env
  echo "  Édite .env et colle EXPO_PUBLIC_SUPABASE_ANON_KEY (Dashboard Supabase → API)."
fi

if [[ ! -d node_modules/expo ]]; then
  echo "→ npm install…"
  npm install
fi

EXPO_GO_ID="host.exp.Exponent"
# Common Expo Go cache paths for SDK 54
CACHE_CANDIDATES=(
  "${HOME}/.expo/ios-simulator-app-cache/Expo-Go-54.0.7.app"
  "${HOME}/.expo/ios-simulator-app-cache/Exponent-2.34.0.tar.app"
)

echo "→ Ouverture du Simulator…"
open -a Simulator || true
sleep 2

# Prefer an already-booted device; otherwise boot the first available iPhone
BOOTED="$(xcrun simctl list devices booted 2>/dev/null | grep -E 'iPhone' | head -1 || true)"
if [[ -z "$BOOTED" ]]; then
  DEVICE_UDID="$(
    xcrun simctl list devices available 2>/dev/null \
      | grep -E 'iPhone' \
      | grep -v unavailable \
      | head -1 \
      | grep -oE '[A-F0-9-]{36}' \
      || true
  )"
  if [[ -n "${DEVICE_UDID:-}" ]]; then
    echo "→ Boot simulateur $DEVICE_UDID…"
    xcrun simctl boot "$DEVICE_UDID" 2>/dev/null || true
    # Bring Simulator window forward
    open -a Simulator
    sleep 3
  else
    echo "⚠ Aucun iPhone trouvé dans Simulator. Crée-en un dans Xcode → Window → Devices."
  fi
else
  echo "→ Simulateur déjà démarré."
fi

install_expo_go() {
  if xcrun simctl get_app_container booted "$EXPO_GO_ID" >/dev/null 2>&1; then
    echo "→ Expo Go déjà installé."
    return 0
  fi

  for app in "${CACHE_CANDIDATES[@]}"; do
    if [[ -d "$app" ]]; then
      echo "→ Installation d’Expo Go depuis le cache ($app)…"
      xcrun simctl install booted "$app"
      return 0
    fi
  done

  echo "→ Expo Go pas en cache — Expo va tenter le téléchargement au démarrage."
  return 0
}

if xcrun simctl list devices booted 2>/dev/null | grep -q "(Booted)"; then
  install_expo_go || true
else
  echo "⚠ Pas de simulateur booted — Expo tentera d’en ouvrir un."
fi

echo "→ Lancement Expo (SDK 54) sur iOS…"
echo "  Astuce: dans le terminal Expo, touche « i » pour rouvrir le sim."
exec npx expo start --ios --go --clear
