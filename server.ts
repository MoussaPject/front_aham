import express from 'express';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { renderModule } from '@angular/platform-server';
import { AppServerModule } from './src/main.server';

const browserDistFolder = resolve(__dirname, '../browser');
const indexHtmlPath = join(browserDistFolder, 'index.html');
const indexHtml = readFileSync(indexHtmlPath, 'utf-8');

export function app(): express.Express {
  const server = express();

  // Détecter si on est en production HTTPS
  const isProduction = process.env['NODE_ENV'] === 'production';
  const isHttps = process.env['HTTPS'] === 'true' || isProduction;

  // Headers de sécurité pour HTTPS
  server.use((req, res, next) => {
    if (isHttps) {
      // HSTS forcer HTTPS en production
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      // Autres headers de sécurité
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
    next();
  });

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, { 
    maxAge: '1y',
    setHeaders: (res, path) => {
      if (isHttps) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // All other routes render Angular app
  server.get('*', async (req, res, next) => {
    try {
      const url = req.url;

      // S'assurer que l'URL est correcte pour le rendu
      const renderUrl = isHttps ? url.replace(/^http:\/\//, 'https://') : url;

      const html = await renderModule(AppServerModule, {
        document: indexHtml,
        url: renderUrl,
      });

      res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  
  server.listen(port, () => {
    const protocol = process.env['HTTPS'] === 'true' || process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
    console.log(`Node Express server listening on ${protocol}://localhost:${port}`);
    console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
  });
}

run();
