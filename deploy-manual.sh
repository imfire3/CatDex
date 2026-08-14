#!/bin/bash
# Script de déploiement manuel sur Netlify
# Usage: ./deploy-manual.sh

set -e

echo "🚀 Déploiement CatDex sur Netlify"
echo "=================================="
echo ""

# Vérifier que dist/ existe
if [ ! -d "dist" ]; then
  echo "❌ Le dossier dist/ n'existe pas. Lancez d'abord : npm run web:build"
  exit 1
fi

echo "✅ Build trouvé dans dist/"
echo ""

# Vérifier si netlify CLI est installé
if ! command -v netlify &> /dev/null && ! [ -f "node_modules/.bin/netlify" ]; then
  echo "📦 Installation de Netlify CLI..."
  npm install --save-dev netlify-cli
fi

echo "🔧 Netlify CLI prêt"
echo ""

# Afficher les options
echo "Options de déploiement :"
echo "1. Déploiement automatique (nécessite login)"
echo "2. Instructions pour déploiement manuel"
echo ""
read -p "Choisissez une option (1 ou 2) : " choice

case $choice in
  1)
    echo ""
    echo "🔐 Connexion à Netlify..."
    npx netlify login
    
    echo ""
    echo "🌐 Initialisation du site..."
    npx netlify init
    
    echo ""
    echo "📤 Déploiement en production..."
    npx netlify deploy --prod --dir=dist
    
    echo ""
    echo "✅ Déploiement terminé !"
    echo ""
    echo "⚠️  N'oubliez pas de configurer les variables d'environnement :"
    echo "   - EXPO_PUBLIC_SUPABASE_URL"
    echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - EXPO_PUBLIC_API_URL"
    echo ""
    echo "Puis rebuild et redéployez :"
    echo "   npm run web:build"
    echo "   npx netlify deploy --prod --dir=dist"
    ;;
    
  2)
    echo ""
    echo "📦 Déploiement manuel :"
    echo ""
    echo "1. Allez sur https://app.netlify.com/"
    echo "2. Cliquez sur 'Add new site' → 'Deploy manually'"
    echo "3. Glissez-déposez le dossier 'dist/' de ce projet"
    echo "4. Une fois déployé, configurez les variables d'environnement :"
    echo "   - Site settings → Environment variables"
    echo "   - Ajoutez :"
    echo "     EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co"
    echo "     EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key"
    echo "     EXPO_PUBLIC_API_URL=https://catdex-api.onrender.com"
    echo "5. Redéployez pour que les variables prennent effet"
    echo ""
    echo "📍 Le dossier à déployer : $(pwd)/dist"
    echo ""
    ;;
    
  *)
    echo "❌ Option invalide"
    exit 1
    ;;
esac

echo "📚 Documentation complète : DEPLOY_NOW.md"
