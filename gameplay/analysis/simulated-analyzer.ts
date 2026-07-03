import * as Crypto from "expo-crypto";
import type { CatRarity, CatMood } from "@/data/mock";
import type { EstimatedAge, FurLength, SimulatedAnalysis } from "@/gameplay/types";
import { resolveModelFromAnalysis } from "@/gameplay/models/resolve-model";

const COLORS = ["noir", "blanc", "roux", "gris tigré", "tricolore", "crème", "bleu-gris", "chocolat"];
const BREEDS = ["européen", "chartreux", "siamois", "persan", "maine coon", "bengal", "abyssin"];
const PATTERNS = ["uni", "rayé", "tacheté", "bicolore", "tricolore", "tigré"];
const AGES: EstimatedAge[] = ["chaton", "jeune", "adulte", "senior"];
const FUR: FurLength[] = ["court", "mi-long", "long"];
const MOODS: CatMood[] = ["curieux", "dormeur", "joueur", "timide", "majestueux"];
const NAMES = ["Moustache", "Pistache", "Croquette", "Nuage", "Zigzag", "Mimi", "Félix", "Luna", "Nala", "Simba"];
const TRAITS = [
  "Oreilles dressées",
  "Queue touffue",
  "Regard perçant",
  "Pattes blanches",
  "Collier naturel",
  "Marque en forme de cœur",
];

async function seedFromUri(uri: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, uri);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function deriveRarity(seed: number): CatRarity {
  const roll = seed % 100;
  if (roll < 8) return "légendaire";
  if (roll < 28) return "rare";
  return "commun";
}

export async function simulatePhotoAnalysis(photoUri: string): Promise<SimulatedAnalysis> {
  const hash = await seedFromUri(photoUri);
  const seed = hash.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const color = pick(COLORS, seed);
  const breed = pick(BREEDS, seed, 3);
  const pattern = pick(PATTERNS, seed, 7);
  const estimatedAge = pick(AGES, seed, 11);
  const furLength = pick(FUR, seed, 13);
  const mood = pick(MOODS, seed, 17);
  const confidence = 72 + (seed % 27);

  const base: Omit<SimulatedAnalysis, "modelId" | "rarity"> = {
    color,
    breed,
    pattern,
    estimatedAge,
    furLength,
    confidence,
    suggestedName: pick(NAMES, seed, 19),
    mood,
    traits: [pick(TRAITS, seed, 2), pick(TRAITS, seed, 5), pick(TRAITS, seed, 9)],
  };

  const modelId = resolveModelFromAnalysis(base);
  const rarity = deriveRarity(seed);

  return { ...base, modelId, rarity };
}
