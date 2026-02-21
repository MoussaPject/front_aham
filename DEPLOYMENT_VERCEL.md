# Configuration Vercel - Guide de déploiement

## 📋 Paramètres Vercel à configurer

### 1. Project Settings
- **Project Name**: ahma-dile-boutique
- **Framework Preset**: Angular
- **Root Directory**: front-end/
- **Build Command**: npm run vercel-build
- **Output Directory**: dist
- **Install Command**: npm ci

### 2. Environment Variables
Dans **Settings → Environment Variables**, ajoutez :

```
NODE_ENV=production
HTTPS=true
```

### 3. Build Settings
- **Node.js Version**: 20.x
- **Build Command**: npm run vercel-build
- **Output Directory**: dist
- **Install Command**: npm ci

### 4. Domain Settings
- **Custom Domain**: votre-domaine.com (optionnel)
- **Auto-Assignment**: *.vercel.app

## 🚀 Déploiement

### Premier déploiement
1. Push votre code sur GitHub
2. Vercel détectera automatiquement les changements
3. Le build commencera automatiquement

### Déploiements suivants
- Chaque push sur `main` déclenche un déploiement
- Pull Requests créent des déploiements de preview

## 🔧 Fichiers de configuration créés

- `vercel.json` - Configuration Vercel
- `.vercelignore` - Fichiers ignorés
- `vercel-build.sh` - Script de build
- `angular.json` - Configuration build Vercel

## 📊 Monitoring
- Logs disponibles dans Vercel Dashboard
- Analytics intégrés
- Performance monitoring

## 🔒 HTTPS
- HTTPS automatique sur tous les domaines
- Certificats SSL renouvelés automatiquement
