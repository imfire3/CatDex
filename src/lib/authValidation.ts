/** Auth field validation for CatDex signup / login. */

const PSEUDO_RE = /^[a-zA-Z0-9\s\-_+\[\]]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_RE = /[^A-Za-z0-9]/;
const DIGIT_RE = /\d/;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 100;

export type PasswordRuleId = 'length' | 'digit' | 'special';

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `Au moins ${PASSWORD_MIN_LENGTH} caractères`,
    test: (value) =>
      value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: 'digit',
    label: 'Au moins un chiffre',
    test: (value) => DIGIT_RE.test(value),
  },
  {
    id: 'special',
    label: 'Au moins un caractère spécial (!@#…)',
    test: (value) => SPECIAL_RE.test(value),
  },
];

export function getPasswordRuleStatus(value: string): Record<PasswordRuleId, boolean> {
  return {
    length: PASSWORD_RULES[0].test(value),
    digit: PASSWORD_RULES[1].test(value),
    special: PASSWORD_RULES[2].test(value),
  };
}

export function isPasswordStrong(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function validatePseudo(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Le pseudo doit faire entre 3 et 20 caractères.';
  }
  if (!PSEUDO_RE.test(trimmed)) {
    return 'Lettres, chiffres, espaces, - + _ [ ] uniquement.';
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'L’e-mail est requis.';
  if (!EMAIL_RE.test(trimmed)) return 'Adresse e-mail invalide.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!PASSWORD_RULES[0].test(value)) {
    return `Le mot de passe doit faire entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères.`;
  }
  if (!PASSWORD_RULES[1].test(value)) {
    return 'Ajoute au moins un chiffre.';
  }
  if (!PASSWORD_RULES[2].test(value)) {
    return 'Ajoute au moins un caractère spécial (!@#…).';
  }
  return null;
}

/** Login only — do not enforce signup strength (legacy accounts). */
export function validateLoginPassword(value: string): string | null {
  if (!value) return 'Le mot de passe est requis.';
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return `Le mot de passe doit faire entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères.`;
  }
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Répète ton mot de passe.';
  if (confirm !== password) return 'Les mots de passe ne correspondent pas.';
  return null;
}

/** Live confirm check — only when the user has started typing the confirmation. */
export function livePasswordConfirmError(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return null;
  if (confirm !== password) return 'Les mots de passe ne correspondent pas.';
  return null;
}
