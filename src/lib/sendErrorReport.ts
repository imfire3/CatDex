import { Linking, Platform } from 'react-native';

import { recordAnalysisFeedback } from '@/lib/analysisFeedback';

const SUPPORT_EMAIL = 'support@catdex.app';

/** Queue a lightweight failure report + open mail client when available. */
export async function sendAnalysisErrorReport(input?: {
  errorKind?: string;
  message?: string;
}): Promise<{ queued: boolean }> {
  const kind = input?.errorKind?.trim() || 'analysis';
  const detail = input?.message?.trim() || 'Impossible d’identifier ce chat';

  const result = await recordAnalysisFeedback({
    predicted: {
      type: `error:${kind}`,
      color: '',
      coat: '',
      pattern: '',
    },
    corrections: [
      {
        field: 'name',
        predicted: detail,
        corrected: '[rapport erreur utilisateur]',
      },
    ],
    confirmed: false,
  });

  const subject = encodeURIComponent(`CatDex — rapport erreur (${kind})`);
  const body = encodeURIComponent(
    [
      'Bonjour,',
      '',
      `Type d’erreur : ${kind}`,
      `Détail : ${detail}`,
      `Plateforme : ${Platform.OS}`,
      '',
      '— Envoyé depuis CatDex',
    ].join('\n'),
  );

  try {
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  } catch {
    // Report is still queued locally / in Supabase.
  }

  return { queued: result.queued };
}
