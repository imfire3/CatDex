import type { AuthError } from "@supabase/supabase-js";

const FRENCH_MESSAGES: Record<string, string> = {
  email_address_invalid:
    "Cette adresse email est refusée par le serveur (souvent les adresses de test comme test@gmail.com). Utilise ton vrai email.",
  email_address_not_authorized:
    "Impossible d'envoyer un email de confirmation avec le service par défaut. Configure un SMTP personnalisé dans Supabase ou désactive la confirmation email pour les tests.",
  email_exists: "Un compte existe déjà avec cet email. Connecte-toi ou utilise une autre adresse.",
  user_already_exists: "Un compte existe déjà avec cet email. Connecte-toi ou utilise une autre adresse.",
  over_email_send_rate_limit:
    "Trop de tentatives avec cet email. Attends quelques minutes avant de réessayer.",
  over_request_rate_limit: "Trop de tentatives. Attends quelques minutes avant de réessayer.",
  email_not_confirmed:
    "Confirme ton email via le lien reçu avant de te connecter.",
  invalid_credentials: "Identifiant ou mot de passe incorrect.",
  weak_password: "Mot de passe trop faible. Utilise au moins 6 caractères.",
  signup_disabled: "Les inscriptions sont désactivées sur ce projet.",
  validation_failed: "Certaines informations ne sont pas valides. Vérifie ton email et ton pseudo.",
};

export function formatAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Une erreur inattendue est survenue.";
  }

  const authError = error as AuthError & { code?: string };
  const code = authError.code;
  if (code && FRENCH_MESSAGES[code]) {
    return FRENCH_MESSAGES[code];
  }

  const message = authError.message ?? "";
  if (message.includes("Unable to validate email address")) {
    return "Cette adresse email n'est pas acceptée. Évite les adresses de test (ex: test@gmail.com) et vérifie qu'il n'y a pas d'espace en trop.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }

  return message || "Une erreur inattendue est survenue.";
}
