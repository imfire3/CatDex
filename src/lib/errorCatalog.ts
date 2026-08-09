/**
 * CatDex error UX catalog — one entry per User Story (Epic: Gestion des erreurs).
 * Source of truth for scanner / permission copy (V1 mock « Gestion des erreurs »).
 */

import type { ErrorStateIcon } from '@/components/ErrorState';
import type { CatAnalysis } from '@/types/cat';

export type CaptureErrorKind =
  | 'cameraPermission'
  | 'locationPermission'
  | 'offline'
  | 'server'
  | 'analysis'
  | 'invalidPhoto'
  | 'blurryPhoto'
  | 'partialCat'
  | 'multipleCats'
  | 'alreadyCaptured'
  | 'unknown';

export type CaptureErrorCopy = {
  kind: CaptureErrorKind;
  icon: ErrorStateIcon;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  /** Keep last photo for retry without retake. */
  preservePhoto: boolean;
};

/** Vision / client error codes that block the Cat Card (US-06…09). */
export const PHOTO_PROBLEM_CODES = [
  'NOT_A_CAT',
  'MULTIPLE_CATS',
  'LOW_QUALITY',
  'BLURRY',
  'PARTIAL_CAT',
  'PHOTO_INVALID',
] as const;

export type PhotoProblemCode = (typeof PHOTO_PROBLEM_CODES)[number];

export const ERROR_CATALOG: Record<CaptureErrorKind, CaptureErrorCopy> = {
  cameraPermission: {
    kind: 'cameraPermission',
    icon: 'camera',
    title: 'Accès à la caméra requis',
    description: 'CatDex a besoin de la caméra pour capturer des chats.',
    primaryLabel: 'Réessayer',
    secondaryLabel: 'Ouvrir les réglages',
    preservePhoto: false,
  },
  locationPermission: {
    kind: 'locationPermission',
    icon: 'location',
    title: 'Accès à la localisation requis',
    description: 'La localisation permet de trouver les chats autour de toi.',
    primaryLabel: 'Réessayer',
    secondaryLabel: 'Ouvrir les réglages',
    preservePhoto: false,
  },
  offline: {
    kind: 'offline',
    icon: 'offline',
    title: 'Pas de connexion',
    description: 'Vérifie ta connexion internet et réessaie.',
    primaryLabel: 'Réessayer',
    preservePhoto: true,
  },
  server: {
    kind: 'server',
    icon: 'server',
    title: 'Serveur indisponible',
    description:
      'L’analyse Vision ne répond pas. En local : lance `npm run server` avec OPENAI_API_KEY dans server/.env.',
    primaryLabel: 'Réessayer',
    preservePhoto: true,
  },
  analysis: {
    kind: 'analysis',
    icon: 'analysis',
    title: 'Impossible d’identifier ce chat',
    description: 'L’identification n’a pas pu être effectuée. Réessaie avec une autre photo.',
    primaryLabel: 'Réessayer',
    secondaryLabel: 'Envoyer le rapport',
    preservePhoto: true,
  },
  invalidPhoto: {
    kind: 'invalidPhoto',
    icon: 'photo',
    title: 'Photo invalide',
    description: 'Cette photo ne semble pas contenir de chat.',
    primaryLabel: 'Réessayer avec une autre photo',
    preservePhoto: false,
  },
  blurryPhoto: {
    kind: 'blurryPhoto',
    icon: 'photo',
    title: 'Photo trop floue',
    description: 'La photo est trop floue pour identifier ce chat. Réessaie avec une autre photo.',
    primaryLabel: 'Réessayer avec une autre photo',
    preservePhoto: false,
  },
  partialCat: {
    kind: 'partialCat',
    icon: 'photo',
    title: 'Chat peu visible',
    description: 'Le chat n’est pas suffisamment visible. Centre-le mieux dans le cadre.',
    primaryLabel: 'Réessayer avec une autre photo',
    preservePhoto: false,
  },
  multipleCats: {
    kind: 'multipleCats',
    icon: 'photo',
    title: 'Plusieurs chats détectés',
    description: 'Plusieurs chats ont été détectés. Photographie un seul chat à la fois.',
    primaryLabel: 'Réessayer avec une autre photo',
    preservePhoto: false,
  },
  alreadyCaptured: {
    kind: 'alreadyCaptured',
    icon: 'analysis',
    title: 'Chat déjà découvert',
    description: 'Tu as déjà découvert ce chat. Tu peux revoir sa fiche ou améliorer ta photo.',
    primaryLabel: 'Voir la fiche',
    secondaryLabel: 'Réessayer avec une autre photo',
    preservePhoto: false,
  },
  unknown: {
    kind: 'unknown',
    icon: 'analysis',
    title: 'Une erreur est survenue',
    description: 'L’identification n’a pas pu être effectuée. Réessaie ou envoie-nous un rapport.',
    primaryLabel: 'Réessayer',
    secondaryLabel: 'Envoyer le rapport',
    preservePhoto: true,
  },
};

export function photoProblemKindFromCode(
  code: string | undefined,
): CaptureErrorKind {
  switch ((code ?? '').toUpperCase()) {
    case 'MULTIPLE_CATS':
      return 'multipleCats';
    case 'LOW_QUALITY':
    case 'BLURRY':
      return 'blurryPhoto';
    case 'PARTIAL_CAT':
      return 'partialCat';
    case 'NOT_A_CAT':
    case 'PHOTO_INVALID':
    default:
      return 'invalidPhoto';
  }
}

/** Resolve display copy for a Vision photo-problem analysis. */
export function resolvePhotoProblemCopy(
  analysis: Pick<CatAnalysis, 'errorCode' | 'errorTitle' | 'errorMessage' | 'description'> | null,
): CaptureErrorCopy {
  const kind = photoProblemKindFromCode(analysis?.errorCode);
  const base = ERROR_CATALOG[kind];
  const title = analysis?.errorTitle?.trim();
  const description =
    analysis?.errorMessage?.trim() || analysis?.description?.trim();

  return {
    ...base,
    // Prefer catalog titles (no emoji) when server still ships emoji titles.
    title: title && !/[🐾]/u.test(title) ? title : base.title,
    description: description || base.description,
  };
}

export function classifyThrownAnalysisError(
  error: unknown,
): 'offline' | 'server' | 'analysis' {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('internet') ||
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('joindre') ||
    message.includes('pas de connexion')
  ) {
    return 'offline';
  }
  if (
    message.includes('503') ||
    message.includes('502') ||
    message.includes('504') ||
    message.includes('unavailable') ||
    message.includes('indisponible') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('trop de temps') ||
    message.includes('openai_api_key') ||
    message.includes('configure openai')
  ) {
    return 'server';
  }
  return 'analysis';
}

export function formatAlreadyCapturedDescription(input: {
  discoveredAt?: string;
  views?: number;
}): string {
  const parts: string[] = [];
  if (input.discoveredAt) {
    try {
      const date = new Date(input.discoveredAt);
      if (!Number.isNaN(date.getTime())) {
        parts.push(
          `Première capture le ${date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}`,
        );
      }
    } catch {
      // ignore
    }
  }
  if (typeof input.views === 'number' && input.views >= 0) {
    const seen = Math.max(1, input.views);
    parts.push(seen === 1 ? 'Observé une fois' : `Observé ${seen} fois`);
  }
  if (parts.length === 0) return ERROR_CATALOG.alreadyCaptured.description;
  return parts.join(' · ');
}
