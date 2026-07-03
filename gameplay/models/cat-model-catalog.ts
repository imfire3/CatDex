import type { CatModelId } from "@/gameplay/types";

export type CatModelPreset = {
  id: CatModelId;
  label: string;
  bodyColors: [string, string];
  accentColor: string;
  earColor: string;
  eyeColor: string;
  pattern: "solid" | "tabby" | "calico" | "tuxedo" | "points";
  furScale: number;
  emoji: string;
};

export const CAT_MODEL_CATALOG: Record<CatModelId, CatModelPreset> = {
  black_short: {
    id: "black_short",
    label: "Noir",
    bodyColors: ["#1a1a2e", "#2d2d44"],
    accentColor: "#4a4a6a",
    earColor: "#151525",
    eyeColor: "#a8d8ff",
    pattern: "solid",
    furScale: 0.9,
    emoji: "🐈‍⬛",
  },
  white_short: {
    id: "white_short",
    label: "Blanc",
    bodyColors: ["#f5f5f7", "#e8e8ed"],
    accentColor: "#d1d1d6",
    earColor: "#f0f0f5",
    eyeColor: "#5ac8fa",
    pattern: "solid",
    furScale: 0.9,
    emoji: "🤍",
  },
  orange_short: {
    id: "orange_short",
    label: "Orange",
    bodyColors: ["#ff9f43", "#ff7b2e"],
    accentColor: "#ffb366",
    earColor: "#e86b20",
    eyeColor: "#2d5016",
    pattern: "solid",
    furScale: 0.95,
    emoji: "🧡",
  },
  tabby_short: {
    id: "tabby_short",
    label: "Tigré",
    bodyColors: ["#8b7355", "#6b5740"],
    accentColor: "#a08060",
    earColor: "#5c4a32",
    eyeColor: "#c4e538",
    pattern: "tabby",
    furScale: 0.92,
    emoji: "🐯",
  },
  calico_long: {
    id: "calico_long",
    label: "Tricolore",
    bodyColors: ["#f5e6d3", "#e8a0bf"],
    accentColor: "#1a1a2e",
    earColor: "#d4a574",
    eyeColor: "#34c759",
    pattern: "calico",
    furScale: 1.15,
    emoji: "🎨",
  },
  gray_long: {
    id: "gray_long",
    label: "Gris long",
    bodyColors: ["#9aa5b1", "#7a8794"],
    accentColor: "#b8c5d0",
    earColor: "#6a7580",
    eyeColor: "#ffd60a",
    pattern: "solid",
    furScale: 1.2,
    emoji: "🌫️",
  },
  siamese_short: {
    id: "siamese_short",
    label: "Siamois",
    bodyColors: ["#f0e6d8", "#c9b8a8"],
    accentColor: "#3d2b1f",
    earColor: "#2a1f18",
    eyeColor: "#007aff",
    pattern: "points",
    furScale: 0.88,
    emoji: "💎",
  },
  tuxedo_short: {
    id: "tuxedo_short",
    label: "Smoking",
    bodyColors: ["#1a1a2e", "#f5f5f7"],
    accentColor: "#ffffff",
    earColor: "#151525",
    eyeColor: "#ffcc00",
    pattern: "tuxedo",
    furScale: 0.93,
    emoji: "🎩",
  },
};

export function getModelPreset(modelId: CatModelId) {
  return CAT_MODEL_CATALOG[modelId];
}
