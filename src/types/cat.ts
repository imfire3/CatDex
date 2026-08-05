export type CatGender = 'male' | 'female' | 'unknown';

export type CatAnalysisStats = {
  timesSeen?: number;
  captures?: number;
  likes?: number;
  captured?: boolean;
  popularity?: string;
};

export type CatAnalysis = {
  color: string;
  breed: string;
  coat: string;
  description: string;
  /** Nom poétique proposé par le LLM (optionnel) */
  suggestedName?: string;
  gender?: CatGender;
  eyes?: string;
  size?: string;
  /** Traits / personnalité (5–8 côté Vision) */
  tags?: string[];
  species?: string;
  estimatedAge?: string;
  estimatedWeight?: string;
  bodyType?: string;
  secondaryColors?: string[];
  coatPattern?: string;
  coatTexture?: string;
  ears?: string;
  tail?: string;
  condition?: string;
  confidence?: number;
  distinctiveFeatures?: string[];
  habitat?: string;
  state?: string;
  /** Commun | Peu commun | Rare | Épique | Légendaire | Mythique */
  rarity?: string;
  colorPalette?: string[];
  catdexNumber?: string;
  stats?: CatAnalysisStats;
  /** Vision rejected the photo (not a cat / low confidence). */
  notACat?: boolean;
  errorCode?: string;
  errorTitle?: string;
  errorMessage?: string;
};

export type Cat = {
  id: string;
  /** Supabase UUID when synced */
  remoteId?: string;
  /**
   * World spawn id (e.g. `world-ombre`) this capture came from —
   * used so the Explorer pin disappears after capture.
   */
  sourceWorldId?: string;
  number: number;
  name: string;
  photoUri: string;
  latitude: number;
  longitude: number;
  discoveredAt: string;
  views: number;
  notes?: string;
  analysis: CatAnalysis;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  provider: 'apple' | 'google' | 'email';
  avatarUrl?: string;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};
