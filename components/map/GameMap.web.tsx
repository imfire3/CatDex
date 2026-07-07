import { GameMapWeb } from "./GameMapWeb";
import type { GameMapProps } from "./GameMap.types";

export type { GameMapMarker, MapRegion } from "./GameMap.types";

export function GameMap(props: GameMapProps) {
  return <GameMapWeb {...props} />;
}
