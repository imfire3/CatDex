#!/usr/bin/env bash
set -euo pipefail

SDK_VERSION="${EXPO_SDK_VERSION:-54.0.0}"
CACHE_DIR="${HOME}/.expo/ios-simulator-app-cache"
VERSIONS_URL="https://exp.host/--/api/v2/versions"

mkdir -p "$CACHE_DIR"

IOS_URL="$(curl -fsSL "$VERSIONS_URL" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const sdk = data.sdkVersions?.['${SDK_VERSION}'];
if (!sdk?.iosClientUrl) {
  console.error('No Expo Go iOS URL found for SDK ${SDK_VERSION}');
  process.exit(1);
}
process.stdout.write(sdk.iosClientUrl);
")"

FILENAME="$(basename "$IOS_URL" .tar.gz)"
APP_DIR="${CACHE_DIR}/${FILENAME}.app"
ARCHIVE="${CACHE_DIR}/${FILENAME}.tar.gz"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Downloading Expo Go for SDK ${SDK_VERSION}..."
  curl -fL --progress-bar -o "$ARCHIVE" "$IOS_URL"
  rm -rf "${CACHE_DIR}/.extract-${FILENAME}"
  mkdir -p "${CACHE_DIR}/.extract-${FILENAME}"
  tar -xzf "$ARCHIVE" -C "${CACHE_DIR}/.extract-${FILENAME}"
  mv "${CACHE_DIR}/.extract-${FILENAME}" "$APP_DIR"
  rmdir "${CACHE_DIR}/.extract-${FILENAME}" 2>/dev/null || true
fi

BOOTED="$(xcrun simctl list devices booted | awk -F'[()]' '/Booted/ {print $2; exit}')"
if [[ -z "$BOOTED" ]]; then
  echo "No booted iOS simulator found. Open Simulator first, then rerun."
  exit 1
fi

echo "Installing Expo Go on simulator ${BOOTED}..."
xcrun simctl install booted "$APP_DIR"
echo "Done. Expo Go ${FILENAME} is installed."
