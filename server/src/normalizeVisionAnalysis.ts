/**
 * Normalize Vision JSON (v1 Structured Outputs + legacy flat) → CatDex analysis DTO.
 */

export type VisionError = {
  code?: string;
  title?: string;
  message?: string;
};

type VisionStats = {
  timesSeen?: number;
  captures?: number;
  likes?: number;
  captured?: boolean;
  popularity?: string;
};

type VisionV1Coat = {
  primary_color?: string | null;
  secondary_color?: string | null;
  additional_colors?: string[] | null;
  pattern?: string | null;
  tabby_pattern?: string | null;
  length?: string | null;
  texture?: string | null;
  confidence?: number | null;
};

type VisionV1Physical = {
  eye_color?: string | null;
  ears?: string | null;
  face_shape?: string | null;
  body_shape?: string | null;
  age_group?: string | null;
  distinctive_markings?: string[] | null;
  confidence?: number | null;
};

type VisionV1Cat = {
  generated_name?: string | null;
  type?: {
    label?: string | null;
    category?: string | null;
    confidence?: number | null;
    possible_breeds?: Array<{ label?: string; confidence?: number }> | null;
    visible_evidence?: string[] | null;
  } | null;
  coat?: VisionV1Coat | null;
  physical_features?: VisionV1Physical | null;
  pose?: { label?: string | null; confidence?: number | null } | null;
  environment?: {
    label?: string | null;
    description?: string | null;
    confidence?: number | null;
  } | null;
  playful_traits?: string[] | null;
  description?: string | null;
};

export type VisionJson = {
  schema_version?: string;
  status?: string;
  is_cat?: boolean;
  cat_count?: number;
  user_message?: string | null;
  image_quality?: {
    usable?: boolean;
    score?: number;
    issues?: string[];
  } | null;
  cat?: VisionV1Cat | null;
  warnings?: string[] | null;
  requires_user_confirmation?: boolean;
  success?: boolean;
  error?: VisionError;
  color?: string;
  suggestedName?: string;
  tags?: string[] | string;
  eyes?: string;
  coat?: string;
  catdexNumber?: string;
  name?: string;
  description?: string;
  species?: string;
  breed?: string;
  gender?: string;
  estimatedAge?: string;
  size?: string;
  estimatedWeight?: string;
  bodyType?: string;
  mainColor?: string;
  secondaryColors?: string[] | string;
  coatPattern?: string;
  coatLength?: string;
  coatTexture?: string;
  eyeColor?: string;
  ears?: string;
  tail?: string;
  condition?: string;
  confidence?: number;
  traits?: string[] | string;
  distinctiveFeatures?: string[] | string;
  habitat?: string;
  state?: string;
  rarity?: string;
  stats?: VisionStats;
  colorPalette?: string[];
  discoveredAt?: string;
};

export const NOT_A_CAT_TITLE = 'Aucun chat détecté 🐾';
export const NOT_A_CAT_MESSAGE =
  'Aucun chat détecté. Essaie de prendre une nouvelle photo d’un vrai chat 🐾';

const COLOR_FR: Record<string, string> = {
  black: 'Noir',
  white: 'Blanc',
  gray: 'Gris',
  grey: 'Gris',
  blue_gray: 'Bleu-gris',
  blue_grey: 'Bleu-gris',
  orange: 'Roux',
  red: 'Roux',
  cream: 'Crème',
  brown: 'Brun',
  chocolate: 'Chocolat',
  cinnamon: 'Cannelle',
  fawn: 'Fauve',
  beige: 'Beige',
  silver: 'Argenté',
  golden: 'Doré',
  unknown: 'Indéterminée',
};

const LENGTH_FR: Record<string, string> = {
  hairless: 'Sans poils',
  short: 'Court',
  medium: 'Mi-long',
  long: 'Long',
  unknown: 'Indéterminée',
};

const TEXTURE_FR: Record<string, string> = {
  straight: 'Lisse',
  plush: 'Duveteux',
  silky: 'Soyeux',
  curly: 'Bouclé',
  wavy: 'Ondulé',
  wiry: 'Raide',
  unknown: 'Indéterminée',
};

const PATTERN_FR: Record<string, string> = {
  solid: 'Uni',
  bicolor: 'Bicolore',
  tricolor: 'Tricolore',
  tuxedo: 'Tuxedo',
  tabby: 'Tigré',
  tortoiseshell: 'Écaille de tortue',
  calico: 'Calico',
  colorpoint: 'Colorpoint',
  smoke: 'Smoke',
  shaded: 'Shaded',
  tipped: 'Tipped',
  spotted: 'Tacheté',
  rosette: 'Rosettes',
  unknown: 'Indéterminé',
};

const AGE_FR: Record<string, string> = {
  kitten: 'Chaton',
  young: 'Jeune',
  adult: 'Adulte',
  senior: 'Senior',
  unknown: 'Indéterminé',
};

const POSE_FR: Record<string, string> = {
  sitting: 'Assis',
  standing: 'Debout',
  lying: 'Couché',
  walking: 'En marche',
  running: 'En course',
  jumping: 'En saut',
  stretching: 'Étiré',
  grooming: 'Toilet toilette',
  looking: 'Observateur',
  unknown: 'Indéterminée',
};

const ENV_FR: Record<string, string> = {
  street: 'Rue',
  garden: 'Jardin',
  park: 'Parc',
  indoor: 'Intérieur',
  home: 'Maison',
  balcony: 'Balcon',
  terrace: 'Terrasse',
  forest: 'Forêt',
  countryside: 'Campagne',
  parking: 'Parking',
  harbor: 'Port',
  unknown: 'Indéterminé',
};

const EYE_FR: Record<string, string> = {
  green: 'Verts',
  blue: 'Bleus',
  yellow: 'Jaunes',
  amber: 'Ambre',
  gold: 'Dorés',
  golden: 'Dorés',
  hazel: 'Noisette',
  copper: 'Cuivre',
  orange: 'Orange',
  odd: 'Vairons',
  unknown: 'Indéterminée',
};

function labelFr(
  map: Record<string, string>,
  value?: string | null,
  fallback = 'Indéterminée',
) {
  if (!value) return fallback;
  const key = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (key === 'unknown' || key === 'null') return fallback;
  return map[key] ?? value.trim();
}

function asStringList(value?: string[] | string | null, max = 8): string[] {
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean).slice(0, max);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,;/]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  return [];
}

function scoreToPercent(score?: number | null): number | undefined {
  if (typeof score !== 'number' || !Number.isFinite(score)) return undefined;
  if (score <= 1) return Math.round(score * 100);
  return Math.round(score);
}

function normalizeGender(value?: string) {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'male' || v === 'm' || v.includes('mâle') || v.includes('male')) {
    return 'male' as const;
  }
  if (
    v === 'female' ||
    v === 'f' ||
    v.includes('femelle') ||
    v.includes('female')
  ) {
    return 'female' as const;
  }
  return 'unknown' as const;
}

export function buildNoCatAnalysis(error?: VisionError) {
  const title = error?.title?.trim() || NOT_A_CAT_TITLE;
  const message = error?.message?.trim() || NOT_A_CAT_MESSAGE;
  return {
    color: 'Indéterminée',
    breed: 'Inconnu',
    coat: 'Indéterminée',
    description: message,
    suggestedName: '',
    gender: 'unknown' as const,
    tags: [] as string[],
    confidence: 0,
    notACat: true as const,
    errorCode: error?.code?.trim() || 'NOT_A_CAT',
    errorTitle: title,
    errorMessage: message,
  };
}

function isV1Schema(json: VisionJson): boolean {
  return (
    json.schema_version === 'catdex.analysis.v1' ||
    typeof json.status === 'string' ||
    typeof json.is_cat === 'boolean'
  );
}

function composeCoatDisplay(lengthFr: string, textureFr: string): string {
  if (textureFr && textureFr !== 'Indéterminée') {
    if (lengthFr && lengthFr !== 'Indéterminée') {
      return `${lengthFr} et ${textureFr.toLowerCase()}`;
    }
    return textureFr;
  }
  return lengthFr || 'Indéterminée';
}

function composeColorDisplay(primary: string, secondaryColors: string[]): string {
  const extras = secondaryColors.filter(
    (c) => c && c !== 'Indéterminée' && c.toLowerCase() !== primary.toLowerCase(),
  );
  if (extras.length === 0) return primary;
  return `${primary} et ${extras[0]!.toLowerCase()}`;
}

function composePatternDisplay(patternFr: string, tabby?: string | null): string {
  if (!patternFr || patternFr === 'Indéterminé') return 'Indéterminé';
  if (patternFr === 'Tigré' && tabby && tabby !== 'unknown') {
    return `Tigré (${tabby})`;
  }
  if (patternFr === 'Bicolore' || patternFr === 'Tigré') {
    return patternFr;
  }
  return patternFr;
}

type FallbackAnalysis = {
  color: string;
  breed: string;
  coat: string;
  eyes: string;
  size: string;
  gender: 'male' | 'female' | 'unknown';
  tags: string[];
  suggestedName: string;
  description: string;
};

function normalizeV1Analysis(json: VisionJson, fallback: FallbackAnalysis) {
  const status = (json.status ?? '').toLowerCase();
  const userMessage = json.user_message?.trim() || NOT_A_CAT_MESSAGE;
  const cat = json.cat ?? null;
  const noFiche =
    json.is_cat === false ||
    status === 'not_a_cat' ||
    !cat ||
    (status === 'multiple_cats' && !cat.generated_name && !cat.description);

  if (noFiche) {
    return buildNoCatAnalysis({
      code: status === 'multiple_cats' ? 'MULTIPLE_CATS' : 'NOT_A_CAT',
      title:
        status === 'multiple_cats'
          ? 'Plusieurs chats détectés 🐾'
          : NOT_A_CAT_TITLE,
      message: userMessage,
    });
  }

  const coat = cat.coat ?? {};
  const physical = cat.physical_features ?? {};
  const typeLabel = cat.type?.label?.trim() || fallback.breed;
  const primaryColor = labelFr(COLOR_FR, coat.primary_color, fallback.color);
  const secondary = labelFr(COLOR_FR, coat.secondary_color, '');
  const additional = asStringList(coat.additional_colors, 4)
    .map((c) => labelFr(COLOR_FR, c, ''))
    .filter(Boolean);
  const secondaryColors = [secondary, ...additional].filter(
    (c) => c && c !== 'Indéterminée' && c !== primaryColor,
  );
  const lengthFr = labelFr(LENGTH_FR, coat.length, fallback.coat);
  const textureFr = labelFr(TEXTURE_FR, coat.texture, '');
  const patternFr = labelFr(PATTERN_FR, coat.pattern, '');
  const suggestedName = cat.generated_name?.trim() || fallback.suggestedName;
  const description = cat.description?.trim() || '';
  const traits = asStringList(cat.playful_traits, 3);
  const markings = asStringList(physical.distinctive_markings, 8).filter(
    (f) => !/^aucune$/i.test(f) && f.toLowerCase() !== 'unknown',
  );
  const evidence = asStringList(cat.type?.visible_evidence, 6);
  const distinctiveFeatures = [
    ...markings,
    ...evidence.filter((e) => !markings.includes(e)),
  ];
  const warnings = asStringList(json.warnings, 6);
  const habitat =
    cat.environment?.description?.trim() ||
    labelFr(ENV_FR, cat.environment?.label, '') ||
    undefined;
  const pose = labelFr(POSE_FR, cat.pose?.label, '');
  const confidence =
    scoreToPercent(json.image_quality?.score) ??
    scoreToPercent(cat.type?.confidence) ??
    scoreToPercent(coat.confidence);

  const colorDisplay = composeColorDisplay(primaryColor, secondaryColors);
  const coatDisplay = composeCoatDisplay(lengthFr, textureFr);
  const patternDisplay = composePatternDisplay(patternFr, coat.tabby_pattern);

  return {
    color: colorDisplay,
    breed: typeLabel,
    coat: coatDisplay,
    description:
      description ||
      `Un chat ${primaryColor.toLowerCase()} de type ${typeLabel}. ${suggestedName} rejoint ton CatDex.`,
    suggestedName,
    gender: 'unknown' as const,
    eyes: labelFr(EYE_FR, physical.eye_color, fallback.eyes),
    size: physical.body_shape?.trim() || fallback.size,
    tags: traits.length > 0 ? traits : fallback.tags.slice(0, 3),
    species: 'Chat domestique',
    estimatedAge: labelFr(AGE_FR, physical.age_group, '') || undefined,
    bodyType:
      physical.face_shape?.trim() || physical.body_shape?.trim() || undefined,
    secondaryColors: secondaryColors.length > 0 ? secondaryColors : undefined,
    coatPattern: patternDisplay !== 'Indéterminé' ? patternDisplay : undefined,
    coatTexture:
      textureFr && textureFr !== 'Indéterminée' ? textureFr : undefined,
    ears: physical.ears?.trim() || undefined,
    condition:
      json.image_quality?.usable === false ? 'Qualité limitée' : undefined,
    confidence,
    distinctiveFeatures:
      distinctiveFeatures.length > 0 ? distinctiveFeatures : undefined,
    habitat: habitat || undefined,
    state: pose && pose !== 'Indéterminée' ? pose : undefined,
    requiresUserConfirmation: json.requires_user_confirmation === true,
    warnings: warnings.length > 0 ? warnings : undefined,
    catCount: typeof json.cat_count === 'number' ? json.cat_count : undefined,
    analysisStatus: status || 'success',
    notACat: false as const,
  };
}

function normalizeLegacyAnalysis(json: VisionJson, fallback: FallbackAnalysis) {
  const rawConfidence =
    typeof json.confidence === 'number' && Number.isFinite(json.confidence)
      ? json.confidence
      : undefined;
  const confidence = scoreToPercent(rawConfidence) ?? rawConfidence;

  const explicitFail =
    json.success === false ||
    json.error?.code === 'NOT_A_CAT' ||
    (confidence !== undefined &&
      confidence < 50 &&
      !(json.name ?? json.suggestedName)?.trim());

  if (explicitFail) {
    return buildNoCatAnalysis(json.error);
  }

  const description = json.description?.trim() || '';
  const breedRaw = json.breed?.trim() || '';
  const name = (json.name ?? json.suggestedName)?.trim() || '';
  const legacyNoCat =
    /aucun chat/i.test(description) ||
    (breedRaw.toLowerCase() === 'inconnu' && !name);

  if (legacyNoCat) {
    return buildNoCatAnalysis({
      code: 'NOT_A_CAT',
      title: NOT_A_CAT_TITLE,
      message: description || NOT_A_CAT_MESSAGE,
    });
  }

  const color = json.mainColor?.trim() || json.color?.trim() || fallback.color;
  const breed = json.breed?.trim() || fallback.breed;
  const coat = json.coatLength?.trim() || json.coat?.trim() || fallback.coat;
  const suggestedName = name || fallback.suggestedName;
  const traits = asStringList(json.traits ?? json.tags, 8);
  const tags = traits.length > 0 ? traits : fallback.tags;
  const secondaryColors = asStringList(json.secondaryColors, 6);
  const distinctiveFeatures = asStringList(json.distinctiveFeatures, 8).filter(
    (f) => !/^aucune$/i.test(f),
  );

  return {
    color,
    breed,
    coat,
    description:
      description ||
      `Un chat ${color.toLowerCase()} de type ${breed}. ${suggestedName} rejoint ton CatDex.`,
    suggestedName,
    gender: normalizeGender(json.gender),
    eyes: json.eyeColor?.trim() || json.eyes?.trim() || fallback.eyes,
    size: json.size?.trim() || fallback.size,
    tags,
    species: json.species?.trim() || undefined,
    estimatedAge: json.estimatedAge?.trim() || undefined,
    estimatedWeight: json.estimatedWeight?.trim() || undefined,
    bodyType: json.bodyType?.trim() || undefined,
    secondaryColors: secondaryColors.length > 0 ? secondaryColors : undefined,
    coatPattern: json.coatPattern?.trim() || undefined,
    coatTexture: json.coatTexture?.trim() || undefined,
    ears: json.ears?.trim() || undefined,
    tail: json.tail?.trim() || undefined,
    condition: json.condition?.trim() || undefined,
    confidence,
    distinctiveFeatures:
      distinctiveFeatures.length > 0 ? distinctiveFeatures : undefined,
    habitat: json.habitat?.trim() || undefined,
    state: json.state?.trim() || undefined,
    rarity: json.rarity?.trim() || undefined,
    colorPalette: Array.isArray(json.colorPalette)
      ? json.colorPalette
          .map((c) => String(c).trim())
          .filter(Boolean)
          .slice(0, 6)
      : undefined,
    catdexNumber: json.catdexNumber?.trim() || undefined,
    stats: json.stats
      ? {
          timesSeen: json.stats.timesSeen,
          captures: json.stats.captures,
          likes: json.stats.likes,
          captured: json.stats.captured,
          popularity: json.stats.popularity,
        }
      : undefined,
    notACat: false as const,
  };
}

export function normalizeAnalysis(json: VisionJson, fallback: FallbackAnalysis) {
  if (isV1Schema(json)) {
    return normalizeV1Analysis(json, fallback);
  }
  return normalizeLegacyAnalysis(json, fallback);
}
