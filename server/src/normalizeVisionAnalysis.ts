/**
 * Normalize Vision JSON (v1 Structured Outputs + legacy flat) → CatDex analysis DTO.
 */

import {
  resolveBreed,
  resolveCoatLength,
  type MorphologySnapshot,
} from './breedPolicy';

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
    breed_key?: string | null;
    label?: string | null;
    category?: string | null;
    confidence?: number | null;
    possible_breeds?: Array<{ label?: string; confidence?: number }> | null;
    visible_evidence?: string[] | null;
  } | null;
  coat?: VisionV1Coat | null;
  physical_features?: VisionV1Physical | null;
  morphology?: MorphologySnapshot | null;
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

export const NOT_A_CAT_TITLE = 'Photo invalide';
export const NOT_A_CAT_MESSAGE =
  'Cette photo ne semble pas contenir de chat.';

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
  fallback = '',
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
  // Never invent "Court" — empty when Vision did not observe length.
  if (lengthFr) {
    if (textureFr && textureFr !== 'Lisse') {
      return `${lengthFr} · ${textureFr.toLowerCase()}`;
    }
    return lengthFr;
  }
  return textureFr || '';
}

function composeColorDisplay(primary: string, secondaryColors: string[]): string {
  const cleanedPrimary = sanitizeColorToken(primary);
  const extras = secondaryColors
    .map(sanitizeColorToken)
    .filter(
      (c) =>
        c &&
        c.toLowerCase() !== cleanedPrimary.toLowerCase(),
    );
  if (!cleanedPrimary) {
    return extras[0] ?? '';
  }
  if (extras.length === 0) return cleanedPrimary;
  return `${cleanedPrimary} et ${extras[0]!.toLowerCase()}`;
}

/** Reject pattern jargon leaking into the color field. Empty when unknown. */
function sanitizeColorToken(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^(bicolore|tricolore|tuxedo|tabby|tigré|calico|colorpoint|unknown|indétermin)/i.test(v)) {
    return '';
  }
  return v;
}

function composePatternDisplay(patternFr: string, tabby?: string | null): string {
  if (!patternFr || patternFr === 'Indéterminé') return 'Indéterminé';
  if (patternFr === 'Tigré' && tabby && tabby !== 'unknown') {
    return `Tigré (${tabby})`;
  }
  return patternFr;
}

/**
 * Particularité joueur : marques visibles d'abord, motif en secours.
 * Évite d'afficher seulement « Bicolore » quand des marques existent.
 */
function composeParticularite(
  markings: string[],
  patternDisplay: string,
  secondaryColors: string[],
): string | undefined {
  const cleanMarkings = markings
    .map((m) => m.trim())
    .filter((m) => m && !/^aucune$/i.test(m) && m.toLowerCase() !== 'unknown');

  if (cleanMarkings.length > 0) {
    return cleanMarkings.slice(0, 4).join(', ');
  }

  const inferred: string[] = [];
  if (secondaryColors.some((c) => /blanc/i.test(c))) {
    inferred.push('Marques blanches');
  }
  if (patternDisplay === 'Tigré' || patternDisplay.startsWith('Tigré')) {
    inferred.push('Pelage tigré');
  }
  if (inferred.length > 0) return inferred.join(', ');

  if (
    patternDisplay &&
    patternDisplay !== 'Indéterminé' &&
    !/^bicolore$/i.test(patternDisplay)
  ) {
    return patternDisplay;
  }

  // Bicolore alone is weak as a "particularité" — skip if nothing else.
  return undefined;
}

function isRoboticDescription(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (/^un chat .+ de type /.test(t)) return true;
  if (/de type (persian|persan|siamois|bengal)/i.test(t)) return true;
  if (/fiche technique|race probable|morpholog/i.test(t)) return true;
  return false;
}

function normalizeV1Analysis(json: VisionJson) {
  const status = (json.status ?? '').toLowerCase();
  const userMessage = json.user_message?.trim() || NOT_A_CAT_MESSAGE;
  const cat = json.cat ?? null;
  const noFiche =
    json.is_cat === false ||
    status === 'not_a_cat' ||
    status === 'low_quality' ||
    status === 'multiple_cats' ||
    !cat;

  if (noFiche) {
    if (status === 'multiple_cats') {
      return buildNoCatAnalysis({
        code: 'MULTIPLE_CATS',
        title: 'Plusieurs chats détectés',
        message:
          userMessage ||
          'Plusieurs chats ont été détectés. Photographie un seul chat à la fois.',
      });
    }
    if (status === 'low_quality') {
      return buildNoCatAnalysis({
        code: 'LOW_QUALITY',
        title: 'Photo trop floue',
        message:
          userMessage ||
          'La photo est trop floue pour identifier ce chat. Reprends-en une plus nette.',
      });
    }
    return buildNoCatAnalysis({
      code: 'NOT_A_CAT',
      title: 'Photo invalide',
      message:
        userMessage || 'Cette photo ne semble pas contenir de chat.',
    });
  }

  const coat = cat.coat ?? {};
  const physical = cat.physical_features ?? {};
  const morphology = cat.morphology ?? null;

  const lengthKey = resolveCoatLength(coat.length, coat.confidence);
  const resolvedBreed = resolveBreed({
    breedKey: cat.type?.breed_key,
    label: cat.type?.label,
    confidence: cat.type?.confidence,
    coatLength: lengthKey,
    morphology,
    visibleEvidence: asStringList(cat.type?.visible_evidence, 8),
  });

  const primaryColor = labelFr(COLOR_FR, coat.primary_color, '');
  const secondary = labelFr(COLOR_FR, coat.secondary_color, '');
  const additional = asStringList(coat.additional_colors, 4)
    .map((c) => labelFr(COLOR_FR, c, ''))
    .filter(Boolean);
  const secondaryColors = [secondary, ...additional].filter(
    (c) => c && c !== primaryColor,
  );
  const lengthFr = labelFr(LENGTH_FR, lengthKey === 'unknown' ? '' : lengthKey, '');
  const textureFr = labelFr(TEXTURE_FR, coat.texture, '');
  const patternFr = labelFr(PATTERN_FR, coat.pattern, '');
  const suggestedName = cat.generated_name?.trim() || '';
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
  if (resolvedBreed.demoted) {
    warnings.push('Race incertaine → Race inconnue.');
  }
  const habitat =
    cat.environment?.description?.trim() ||
    labelFr(ENV_FR, cat.environment?.label, '') ||
    undefined;
  const pose = labelFr(POSE_FR, cat.pose?.label, '');
  const eyes = labelFr(EYE_FR, physical.eye_color, '');
  const confidence =
    scoreToPercent(cat.type?.confidence) ??
    scoreToPercent(json.image_quality?.score) ??
    scoreToPercent(coat.confidence);

  const colorDisplay = composeColorDisplay(primaryColor, secondaryColors);
  const coatDisplay = composeCoatDisplay(lengthFr, textureFr);
  const patternDisplay = composePatternDisplay(patternFr, coat.tabby_pattern);
  const particularite = composeParticularite(
    distinctiveFeatures,
    patternDisplay,
    secondaryColors,
  );

  const rawDescription = cat.description?.trim() || '';
  // Never invent a story — if Vision description is robotic/empty, leave empty for the form.
  const description = !isRoboticDescription(rawDescription) ? rawDescription : '';

  const mapped = {
    color: colorDisplay,
    breed: resolvedBreed.label,
    coat: coatDisplay,
    description,
    suggestedName,
    gender: 'unknown' as const,
    eyes: eyes || undefined,
    size: physical.body_shape?.trim() || undefined,
    tags: traits,
    species: 'Chat',
    estimatedAge: labelFr(AGE_FR, physical.age_group, '') || undefined,
    bodyType:
      physical.face_shape?.trim() || physical.body_shape?.trim() || undefined,
    secondaryColors: secondaryColors.length > 0 ? secondaryColors : undefined,
    coatPattern: particularite,
    coatTexture: textureFr || undefined,
    ears: physical.ears?.trim() || undefined,
    condition:
      json.image_quality?.usable === false ? 'Qualité limitée' : undefined,
    confidence: resolvedBreed.confidencePercent || confidence,
    distinctiveFeatures:
      distinctiveFeatures.length > 0 ? distinctiveFeatures : undefined,
    habitat: habitat || undefined,
    state: pose || undefined,
    requiresUserConfirmation:
      json.requires_user_confirmation === true || resolvedBreed.demoted,
    warnings: warnings.length > 0 ? warnings : undefined,
    catCount: typeof json.cat_count === 'number' ? json.cat_count : undefined,
    analysisStatus: status || 'success',
    notACat: false as const,
  };

  console.log('[vision-map]', {
    breed: mapped.breed,
    breedConfidence: resolvedBreed.confidencePercent,
    color: mapped.color,
    coat: mapped.coat,
    name: mapped.suggestedName,
    particularite: mapped.coatPattern,
    traits: mapped.tags,
    description: mapped.description?.slice(0, 120),
  });

  return mapped;
}

function normalizeLegacyAnalysis(json: VisionJson) {
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

  const primaryRaw = json.mainColor?.trim() || json.color?.trim() || '';
  const composedParts = primaryRaw.split(/\s+et\s+/i).map((p) => p.trim()).filter(Boolean);
  const primaryPart = sanitizeColorToken(composedParts[0] ?? '');
  const secondaryFromColor = composedParts.slice(1).map(sanitizeColorToken);
  const secondaryColors = [
    ...secondaryFromColor,
    ...asStringList(json.secondaryColors, 6).map(sanitizeColorToken),
  ].filter((c) => c && c.toLowerCase() !== primaryPart.toLowerCase());

  const resolvedBreed = resolveBreed({
    label: json.breed?.trim() || '',
    confidence:
      typeof rawConfidence === 'number'
        ? rawConfidence > 1
          ? rawConfidence / 100
          : rawConfidence
        : 0,
    coatLength: json.coatLength?.trim() || json.coat?.trim(),
  });
  const lengthKey = resolveCoatLength(
    json.coatLength?.trim() || json.coat?.trim(),
    typeof rawConfidence === 'number' ? rawConfidence : undefined,
  );
  const coat = labelFr(LENGTH_FR, lengthKey === 'unknown' ? '' : lengthKey, '');
  const traits = asStringList(json.traits ?? json.tags, 8);
  const distinctiveFeatures = asStringList(json.distinctiveFeatures, 8).filter(
    (f) => !/^aucune$/i.test(f),
  );
  const colorDisplay = composeColorDisplay(primaryPart, secondaryColors);
  const particularite = composeParticularite(
    distinctiveFeatures,
    json.coatPattern?.trim() || '',
    secondaryColors,
  );
  const nextDescription = !isRoboticDescription(description) ? description : '';

  return {
    color: colorDisplay,
    breed: resolvedBreed.label,
    coat,
    description: nextDescription,
    suggestedName: name,
    gender: normalizeGender(json.gender),
    eyes: json.eyeColor?.trim() || json.eyes?.trim() || undefined,
    size: json.size?.trim() || undefined,
    tags: traits,
    species: json.species?.trim() || undefined,
    estimatedAge: json.estimatedAge?.trim() || undefined,
    estimatedWeight: json.estimatedWeight?.trim() || undefined,
    bodyType: json.bodyType?.trim() || undefined,
    secondaryColors: secondaryColors.length > 0 ? secondaryColors : undefined,
    coatPattern: particularite || json.coatPattern?.trim() || undefined,
    coatTexture: json.coatTexture?.trim() || undefined,
    ears: json.ears?.trim() || undefined,
    tail: json.tail?.trim() || undefined,
    condition: json.condition?.trim() || undefined,
    confidence: resolvedBreed.confidencePercent || confidence,
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

/** Normalize Vision JSON → form DTO. Never invent missing fields. */
export function normalizeAnalysis(json: VisionJson, _fallback?: unknown) {
  if (isV1Schema(json)) {
    return normalizeV1Analysis(json);
  }
  return normalizeLegacyAnalysis(json);
}
