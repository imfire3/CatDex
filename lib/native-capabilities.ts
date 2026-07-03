import Constants, { ExecutionEnvironment } from "expo-constants";

/** True when running inside the Expo Go app (not a dev build or standalone). */
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === "expo";

export function canUseMapbox(): boolean {
  if (isExpoGo) return false;
  return Boolean(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);
}
