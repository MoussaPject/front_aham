#!/bin/bash

# Script de build pour Vercel
echo "🚀 Build Angular pour Vercel"

# Installer les dépendances
npm ci

# Build pour production avec SSR
echo "📦 Build Angular SSR..."
npm run vercel-build

echo "✅ Build terminé pour Vercel"
