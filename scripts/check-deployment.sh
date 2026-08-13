#!/bin/bash
# Script de vérification du déploiement CatDex
# Usage: ./scripts/check-deployment.sh

set -e

echo "🔍 Vérification du déploiement CatDex"
echo ""

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier une URL
check_url() {
  local url=$1
  local name=$2
  
  echo -n "Vérification $name ($url)... "
  
  if curl -s -f -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ OK${NC}"
    return 0
  else
    echo -e "${RED}✗ ERREUR${NC}"
    return 1
  fi
}

# Vérifier les variables d'environnement
echo "📋 Variables d'environnement :"
echo ""

if [ -f .env ]; then
  API_URL=$(grep EXPO_PUBLIC_API_URL .env | cut -d '=' -f2)
  SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)
  
  echo "API URL: $API_URL"
  echo "Supabase URL: $SUPABASE_URL"
  echo ""
else
  echo -e "${RED}❌ Fichier .env manquant${NC}"
  echo ""
fi

# Vérifier l'API backend
echo "🔧 Backend API :"
echo ""

if [ -n "$API_URL" ]; then
  check_url "$API_URL/health" "Health endpoint"
else
  echo -e "${YELLOW}⚠️  EXPO_PUBLIC_API_URL non configuré${NC}"
fi

echo ""

# Vérifier Supabase
echo "🗄️  Supabase :"
echo ""

if [ -n "$SUPABASE_URL" ]; then
  check_url "$SUPABASE_URL" "Supabase instance"
else
  echo -e "${YELLOW}⚠️  EXPO_PUBLIC_SUPABASE_URL non configuré${NC}"
fi

echo ""

# Vérifier que les secrets ne sont pas des placeholders
echo "🔐 Sécurité :"
echo ""

if [ -f .env ]; then
  if grep -q "your-" .env || grep -q "changeme" .env || grep -q "example" .env; then
    echo -e "${RED}❌ Des placeholders sont encore présents dans .env${NC}"
    echo "Remplace toutes les valeurs 'your-*' par tes vraies clés"
  else
    echo -e "${GREEN}✓ Pas de placeholder détecté${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Fichier .env manquant${NC}"
fi

echo ""

# Vérifier les fichiers de configuration
echo "📁 Configuration :"
echo ""

files_ok=0
files_total=0

check_file() {
  local file=$1
  local name=$2
  files_total=$((files_total + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $name"
    files_ok=$((files_ok + 1))
  else
    echo -e "${RED}✗${NC} $name (manquant)"
  fi
}

check_file "render.yaml" "render.yaml"
check_file "eas.json" "eas.json"
check_file "app.json" "app.json"
check_file "server/Dockerfile" "server/Dockerfile"

echo ""

# Résumé
echo "📊 Résumé :"
echo ""

if [ "$files_ok" -eq "$files_total" ] && [ -f .env ]; then
  echo -e "${GREEN}✅ Tout semble prêt pour le déploiement !${NC}"
  echo ""
  echo "Prochaines étapes :"
  echo "1. Déploie l'API sur Render : https://dashboard.render.com"
  echo "2. Déploie le web avec : ./scripts/deploy-web.sh"
  echo "3. Build l'app mobile avec : eas build --platform all"
else
  echo -e "${YELLOW}⚠️  Quelques éléments nécessitent ton attention${NC}"
  echo ""
  echo "Consulte docs/ops/DEPLOYMENT.md pour plus de détails."
fi

echo ""
