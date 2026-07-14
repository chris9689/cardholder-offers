type DyContextType = 'HOMEPAGE' | 'CATEGORY' | 'PRODUCT' | 'OTHER';

interface DyRecommendationContext {
  type: DyContextType;
  data?: string[];
}

declare global {
  interface Window {
    DY?: {
      recommendationContext?: DyRecommendationContext;
      API?: (command: string, payload?: unknown) => unknown;
    };
  }
}

function normalizePath(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function getDyRecommendationContext(pathname: string): DyRecommendationContext {
  const path = normalizePath(pathname);

  if (path === '/') {
    return { type: 'HOMEPAGE' };
  }

  if (path === '/offers') {
    return { type: 'CATEGORY', data: ['Offers'] };
  }

  if (path.startsWith('/offers/')) {
    const sku = decodeURIComponent(path.replace('/offers/', '').trim());
    if (sku) {
      return { type: 'PRODUCT', data: [sku] };
    }
  }

  if (path === '/search') {
    return { type: 'CATEGORY', data: ['Search'] };
  }

  if (path === '/curated') {
    return { type: 'CATEGORY', data: ['Curated'] };
  }

  if (path === '/account') {
    return { type: 'OTHER', data: ['account'] };
  }

  return { type: 'OTHER', data: [] };
}

export function getPageId(pathname: string): string {
  const path = normalizePath(pathname);

  if (path === '/') {
    return 'home';
  }

  if (path.startsWith('/offers/')) {
    const sku = decodeURIComponent(path.replace('/offers/', '').trim());
    return sku || 'offer-detail';
  }

  if (path === '/offers') {
    return 'offers';
  }

  if (path === '/search') {
    return 'search';
  }

  if (path === '/curated') {
    return 'curated';
  }

  if (path === '/account') {
    return 'account';
  }

  return path.replace(/^\//, '').replace(/\//g, '-') || 'other';
}

export function setDyRecommendationContext(pathname: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.DY = window.DY || {};
  window.DY.recommendationContext = getDyRecommendationContext(pathname);
}

export {};
