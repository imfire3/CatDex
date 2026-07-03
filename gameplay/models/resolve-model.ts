import type { CatModelId, FurLength, SimulatedAnalysis } from "@/gameplay/types";

const COLOR_MODEL_MAP: Record<string, CatModelId> = {
  noir: "black_short",
  black: "black_short",
  blanc: "white_short",
  white: "white_short",
  roux: "orange_short",
  orange: "orange_short",
  tigré: "tabby_short",
  tabby: "tabby_short",
  tricolore: "calico_long",
  calico: "calico_long",
  gris: "gray_long",
  gray: "gray_long",
  crème: "siamese_short",
  siamois: "siamese_short",
};

export function resolveModelFromAnalysis(analysis: Pick<SimulatedAnalysis, "color" | "breed" | "pattern" | "furLength">): CatModelId {
  const colorKey = analysis.color.toLowerCase();

  for (const [key, modelId] of Object.entries(COLOR_MODEL_MAP)) {
    if (colorKey.includes(key)) return modelId;
  }

  if (analysis.pattern.toLowerCase().includes("tricolore")) return "calico_long";
  if (analysis.pattern.toLowerCase().includes("tigré")) return "tabby_short";
  if (analysis.breed.toLowerCase().includes("siamois")) return "siamese_short";
  if (analysis.furLength === "long") return "gray_long";

  return "tabby_short";
}
