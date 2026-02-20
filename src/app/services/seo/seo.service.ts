import { Injectable, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  canonicalUrl?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  update(config: SeoConfig): void {
    this.titleService.setTitle(config.title);

    if (config.description) {
      this.metaService.updateTag({ name: 'description', content: config.description });
      this.metaService.updateTag({ property: 'og:description', content: config.description });
    }

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
    }

    if (config.canonicalUrl) {
      this.setCanonicalUrl(config.canonicalUrl);
    }

    if (config.jsonLd) {
      this.setJsonLd(config.jsonLd);
    }
  }

  setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setJsonLd(jsonLd: SeoConfig['jsonLd']): void {
    const id = 'jsonld-seo';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      this.document.head.appendChild(script);
    }

    const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    script.text = JSON.stringify(payload.length === 1 ? payload[0] : payload);
  }
}
