import { CatColor, CatModelDefinition, CatModelId, FurLength, PhotoAnalysisResult } from './types';

export const CAT_MODELS: CatModelDefinition[] = [
  { id: 'black_short', name: 'Shadow Paws', color: 'black', furLength: 'short', primaryColor: '#1a1a2e', secondaryColor: '#2d2d44', accentColor: '#4a4a6a', pattern: 'solid' },
  { id: 'black_long', name: 'Midnight Fluff', color: 'black', furLength: 'long', primaryColor: '#0f0f1a', secondaryColor: '#1a1a2e', accentColor: '#3d3d5c', pattern: 'solid' },
  { id: 'white_short', name: 'Snowball', color: 'white', furLength: 'short', primaryColor: '#f5f5f5', secondaryColor: '#e8e8e8', accentColor: '#d0d0d0', pattern: 'solid' },
  { id: 'white_long', name: 'Cloud Walker', color: 'white', furLength: 'long', primaryColor: '#fafafa', secondaryColor: '#f0f0f0', accentColor: '#e0e0e0', pattern: 'solid' },
  { id: 'orange_short', name: 'Ginger Snap', color: 'orange', furLength: 'short', primaryColor: '#e67e22', secondaryColor: '#d35400', accentColor: '#f39c12', pattern: 'solid' },
  { id: 'orange_long', name: 'Sunset Mane', color: 'orange', furLength: 'long', primaryColor: '#e74c3c', secondaryColor: '#c0392b', accentColor: '#f39c12', pattern: 'solid' },
  { id: 'tabby_short', name: 'Stripe Hunter', color: 'tabby', furLength: 'short', primaryColor: '#8B6914', secondaryColor: '#6B4F10', accentColor: '#A67C00', pattern: 'tabby' },
  { id: 'tabby_long', name: 'Tiger Spirit', color: 'tabby', furLength: 'long', primaryColor: '#7D6608', secondaryColor: '#5D4E06', accentColor: '#9A7D0A', pattern: 'tabby' },
  { id: 'calico_short', name: 'Patchwork', color: 'calico', furLength: 'short', primaryColor: '#e67e22', secondaryColor: '#2c3e50', accentColor: '#ecf0f1', pattern: 'calico' },
  { id: 'calico_long', name: 'Tricolor Dream', color: 'calico', furLength: 'long', primaryColor: '#d35400', secondaryColor: '#1a1a2e', accentColor: '#f5f5f5', pattern: 'calico' },
  { id: 'gray_short', name: 'Silver Mist', color: 'gray', furLength: 'short', primaryColor: '#95a5a6', secondaryColor: '#7f8c8d', accentColor: '#bdc3c7', pattern: 'solid' },
  { id: 'tuxedo_short', name: 'Formal Felix', color: 'tuxedo', furLength: 'short', primaryColor: '#2c3e50', secondaryColor: '#ecf0f1', accentColor: '#34495e', pattern: 'tuxedo' },
];

export function getModelById(id: CatModelId): CatModelDefinition {
  const model = CAT_MODELS.find((m) => m.id === id);
  if (!model) throw new Error(`Unknown model: ${id}`);
  return model;
}

export function selectModelFromAnalysis(analysis: Pick<PhotoAnalysisResult, 'color' | 'furLength'>): CatModelId {
  const color = analysis.color;
  const length = analysis.furLength === 'long' ? 'long' : 'short';

  const colorMap: Record<CatColor, CatModelId[]> = {
    black: ['black_short', 'black_long'],
    white: ['white_short', 'white_long'],
    orange: ['orange_short', 'orange_long'],
    tabby: ['tabby_short', 'tabby_long'],
    calico: ['calico_short', 'calico_long'],
    gray: ['gray_short'],
    tuxedo: ['tuxedo_short'],
  };

  const candidates = colorMap[color] ?? ['tabby_short'];
  const match = candidates.find((id) => id.endsWith(length)) ?? candidates[0];
  return match;
}

export function getModelForColorAndFur(color: CatColor, furLength: FurLength): CatModelId {
  return selectModelFromAnalysis({ color, furLength });
}
