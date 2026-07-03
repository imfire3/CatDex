const EMAIL_FORMAT =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const BLOCKED_LOCAL_PARTS = new Set([
  "test",
  "example",
  "email",
  "user",
  "foo",
  "bar",
  "sample",
  "demo",
  "admin",
  "root",
  "null",
  "undefined",
]);

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.test",
  "invalid.com",
  "localhost",
]);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string) {
  return EMAIL_FORMAT.test(normalizeEmail(email));
}

export function isBlockedAuthEmail(email: string) {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return false;

  const localPart = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);

  if (BLOCKED_DOMAINS.has(domain)) return true;
  if (BLOCKED_LOCAL_PARTS.has(localPart)) return true;

  return false;
}

export function validateSignupEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return "Entre ton adresse email.";
  }
  if (!isValidEmailFormat(normalized)) {
    return "Cette adresse email n'est pas valide. Vérifie le format (ex: prenom@gmail.com).";
  }
  if (isBlockedAuthEmail(normalized)) {
    return "Les adresses de test (comme test@gmail.com) sont refusées. Utilise ton vrai email ou un pseudo unique, par ex. prenom.nom@gmail.com.";
  }
  return null;
}

export function validateSignupUsername(username: string) {
  const value = username.trim();
  if (!value) {
    return "Choisis un pseudo.";
  }
  if (value.length < 3 || value.length > 24) {
    return "Le pseudo doit contenir entre 3 et 24 caractères.";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    return "Le pseudo ne peut contenir que des lettres, chiffres et underscores (_).";
  }
  return null;
}

export function validateSignupPassword(password: string) {
  if (!password) {
    return "Entre un mot de passe.";
  }
  if (password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return null;
}
