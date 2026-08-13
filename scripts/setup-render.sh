#!/bin/bash
# Script interactif pour configurer CatDex avec Render.com
# Usage: ./scripts/setup-render.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║   CatDex Setup - Render.com 🐱     ║"
echo "╔══════════════════════════════════════╗"
echo -e "${NC}"
echo ""

# Fonction pour demander une valeur
ask_value() {
  local prompt=$1
  local var_name=$2
  local current_value=$3
  
  echo -e "${YELLOW}$prompt${NC}"
  if [ -n "$current_value" ] && [ "$current_value" != "your-"* ]; then
    echo -e "${GREEN}Valeur actuelle: $current_value${NC}"
    read -p "Garder cette valeur ? (Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
      echo "$current_value"
      return
    fi
  fi
  
  read -p "Entre la valeur: " value
  echo "$value"
}

echo -e "${BLUE}═══ Étape 1/4 : Vérification du projet${NC}"
echo ""

# Vérifier que les fichiers nécessaires existent
if [ ! -f "render.yaml" ]; then
  echo -e "${RED}❌ render.yaml manquant${NC}"
  exit 1
fi

if [ ! -f "server/Dockerfile" ]; then
  echo -e "${RED}❌ server/Dockerfile manquant${NC}"
  exit 1
fi

echo -e "${GREEN}✓ render.yaml trouvé${NC}"
echo -e "${GREEN}✓ server/Dockerfile trouvé${NC}"
echo ""

echo -e "${BLUE}═══ Étape 2/4 : Configuration des Clés${NC}"
echo ""

# Charger le .env actuel s'il existe
if [ -f ".env" ]; then
  source .env 2>/dev/null || true
fi

echo -e "${YELLOW}Tu vas avoir besoin de 3 clés :${NC}"
echo "1. OPENAI_API_KEY (depuis platform.openai.com)"
echo "2. SUPABASE_URL (depuis supabase.com/dashboard)"
echo "3. SUPABASE_JWT_SECRET (depuis supabase.com/dashboard)"
echo ""
read -p "Prêt à continuer ? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
  echo -e "${YELLOW}D'accord ! Consulte docs/ops/RENDER_SETUP_GUIDE.md pour savoir comment obtenir les clés.${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}━━━ OpenAI API Key ━━━${NC}"
OPENAI_API_KEY=$(ask_value "OpenAI API Key (commence par sk-proj- ou sk-):" "OPENAI_API_KEY" "$OPENAI_API_KEY")

echo ""
echo -e "${BLUE}━━━ Supabase URL ━━━${NC}"
SUPABASE_URL=$(ask_value "Supabase URL (https://xyz.supabase.co):" "SUPABASE_URL" "$EXPO_PUBLIC_SUPABASE_URL")

echo ""
echo -e "${BLUE}━━━ Supabase Anon Key ━━━${NC}"
SUPABASE_ANON=$(ask_value "Supabase Anon Key (commence par eyJhbGc):" "SUPABASE_ANON" "$EXPO_PUBLIC_SUPABASE_ANON_KEY")

echo ""
echo -e "${BLUE}━━━ Supabase JWT Secret ━━━${NC}"
SUPABASE_JWT=$(ask_value "Supabase JWT Secret (Settings → API → JWT Secret):" "SUPABASE_JWT" "$SUPABASE_JWT_SECRET")

echo ""
echo -e "${BLUE}═══ Étape 3/4 : Configuration de .env${NC}"
echo ""

# Créer/mettre à jour .env
cat > .env <<EOF
# Supabase (required for real auth / sync)
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON

# CatDex analysis API (sera mis à jour après déploiement Render)
EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com

# Optional: Enable Supabase debug logging
# EXPO_PUBLIC_SUPABASE_DEBUG=true

# Social auth (off by default)
# EXPO_PUBLIC_AUTH_GOOGLE=true
# EXPO_PUBLIC_AUTH_APPLE=true
EOF

echo -e "${GREEN}✓ Fichier .env créé/mis à jour${NC}"
echo ""

echo -e "${BLUE}═══ Étape 4/4 : Instructions Render.com${NC}"
echo ""

echo -e "${YELLOW}Variables à configurer dans Render :${NC}"
echo ""
echo "┌─────────────────────────┬──────────────────────────────────────┐"
echo "│ Variable                │ Valeur                               │"
echo "├─────────────────────────┼──────────────────────────────────────┤"
echo "│ OPENAI_API_KEY          │ $OPENAI_API_KEY"
echo "│ SUPABASE_URL            │ $SUPABASE_URL"
echo "│ SUPABASE_JWT_SECRET     │ ${SUPABASE_JWT:0:20}..."
echo "│ NODE_ENV                │ production (déjà configuré)          │"
echo "│ PORT                    │ 8787 (déjà configuré)                │"
echo "│ OPENAI_MODEL            │ gpt-4o-mini (déjà configuré)         │"
echo "└─────────────────────────┴──────────────────────────────────────┘"
echo ""

# Créer un fichier avec les variables pour copier-coller
cat > /tmp/catdex-render-vars.txt <<EOF
Variables d'environnement pour Render.com :

OPENAI_API_KEY=$OPENAI_API_KEY
SUPABASE_URL=$SUPABASE_URL
SUPABASE_JWT_SECRET=$SUPABASE_JWT
NODE_ENV=production
PORT=8787
OPENAI_MODEL=gpt-4o-mini
EOF

echo -e "${GREEN}✓ Variables sauvegardées dans /tmp/catdex-render-vars.txt${NC}"
echo ""

echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo ""
echo "1. Va sur https://dashboard.render.com"
echo "2. Connecte ton compte GitHub"
echo "3. Clique 'New +' → 'Blueprint'"
echo "4. Sélectionne le repo CatDex"
echo "5. Configure les variables ci-dessus"
echo "6. Clique 'Apply' et attends 3-5 minutes"
echo ""
echo -e "${YELLOW}📄 Guide détaillé : docs/ops/RENDER_SETUP_GUIDE.md${NC}"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Ouvrir le guide complet maintenant ? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
  if command -v less &> /dev/null; then
    less docs/ops/RENDER_SETUP_GUIDE.md
  else
    cat docs/ops/RENDER_SETUP_GUIDE.md
  fi
fi
