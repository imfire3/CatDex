import { Platform } from "react-native";
import { canUseMapbox } from "@/lib/native-capabilities";
import { GameMapWeb } from "./GameMapWeb";
import type { GameMapMarker, GameMapProps, MapRegion } from "./GameMap.types";

export type { GameMapMarker, MapRegion };

export function GameMap(props: GameMapProps) {
  if (Platform.OS === "web") {
    return <GameMapWeb {...props} />;
  }

  if (canUseMapbox()) {
    try {
      const { GameMapMapbox } = require("./GameMapMapbox") as typeof import("./GameMapMapbox");
      return <GameMapMapbox {...props} />;
    } catch {
      /* Mapbox native module unavailable — fall back to react-native-maps */
    }
  }

  const { GameMapNative } = require("./GameMapNative") as typeof import("./GameMapNative");
  return <GameMapNative {...props} />;
}
