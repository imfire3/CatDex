import { CatModelId } from '@catdex/shared';
import { CAT_MODELS } from '@catdex/shared';

export function getModelColors(modelId: CatModelId) {
  const model = CAT_MODELS.find((m) => m.id === modelId);
  return model ?? CAT_MODELS[0];
}

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';
