/** Auth field validation for CatDex signup / login. */

const PSEUDO_RE = /^[a-zA-Z0-9\s\-_+\[\]]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (value.length < 6 || value.length > 100) {
    return 'Le mot de passe doit faire entre 6 et 100 caractères.';
  }
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (confirm !== password) return 'Les mots de passe ne correspondent pas.';
  return null;
}
