#!/bin/bash
# Script de déploiement web pour CatDex
# Usage: ./scripts/deploy-web.sh [netlify|vercel|github-pages]

set -e

PLATFORM=${1:-netlify}

echo "🚀 Déploiement CatDex Web sur $PLATFORM"
echo ""

# Vérifier que les variables d'environnement sont configurées
if [ ! -f .env ]; then
  echo "❌ Erreur : Fichier .env manquant"
  echo "Copie .env.example vers .env et configure tes clés :"
  echo "  cp .env.example .env"
  exit 1
fi

# Vérifier que l'URL de l'API est configurée
if grep -q "localhost" .env 2>/dev/null; then
  echo "⚠️  Attention : .env contient 'localhost'"
  echo "Pour la production, utilise l'URL de ton API déployée :"
  echo "  EXPO_PUBLIC_API_URL=https://ton-api.onrender.com"
  echo ""
  read -p "Continuer quand même ? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "📦 Build de la version web..."
npx expo export --platform web

echo ""
echo "✅ Build terminé !"
echo ""

case $PLATFORM in
  netlify)
    echo "📤 Déploiement sur Netlify..."
    if ! command -v netlify &> /dev/null; then
      echo "Installation de Netlify CLI..."
      npm install -g netlify-cli
    fi
    npx netlify deploy --prod --dir dist
    ;;
  
  vercel)
    echo "📤 Déploiement sur Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "Installation de Vercel CLI..."
      npm install -g vercel
    fi
    vercel --prod
    ;;
  
  github-pages)
    echo "📤 Déploiement sur GitHub Pages..."
    if ! command -v gh-pages &> /dev/null; then
      echo "Installation de gh-pages..."
      npm install -g gh-pages
    fi
    npx gh-pages -d dist -m "Deploy CatDex web"
    ;;
  
  *)
    echo "❌ Plateforme inconnue : $PLATFORM"
    echo "Usage: ./scripts/deploy-web.sh [netlify|vercel|github-pages]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "Prochaines étapes :"
echo "1. Teste l'app web déployée"
echo "2. Configure les redirect URLs dans Supabase"
echo "3. Partage le lien avec tes amis !"
