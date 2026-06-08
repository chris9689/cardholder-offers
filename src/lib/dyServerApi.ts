import { CardType } from '../contexts/CardContext';
import { getDyRecommendationContext, getPageId } from './dynamicYield';

type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET';

interface DyCookieRecord {
  name: string;
  value: string;
  maxAge?: string;
}

interface DyIdentity {
  user: {
    dyid?: string;
    dyid_server?: string;
    active_consent_accepted: boolean;
  };
  session: {
    dy?: string;
  };
}

interface HeroBannerPayload {
  image?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
}

const STORAGE_KEYS = {
  dyid: ['_dyid', 'dyid'],
  dyidServer: ['_dyid_server', 'dyid_server'],
  session: ['_dyjsession', 'dy'],
} as const;

function getCookie(name: string): string | undefined {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

function getLocalValue(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/.test(ua)) {
    return 'TABLET';
  }

  if (/mobile|android|iphone|ipod/.test(ua)) {
    return 'MOBILE';
  }

  return 'DESKTOP';
}

function readIdentity(): DyIdentity {
  const dyid = getLocalValue(STORAGE_KEYS.dyid) || getCookie('_dyid');
  const dyidServer = getLocalValue(STORAGE_KEYS.dyidServer) || getCookie('_dyid_server') || dyid;
  const dySession = getLocalValue(STORAGE_KEYS.session) || getCookie('_dyjsession');

  return {
    user: {
      dyid,
      dyid_server: dyidServer,
      active_consent_accepted: true,
    },
    session: {
      dy: dySession,
    },
  };
}

function applyReturnedCookies(cookies: DyCookieRecord[] | undefined): void {
  if (!cookies || cookies.length === 0) {
    return;
  }

  cookies.forEach((cookieRecord) => {
    if (!cookieRecord.name || !cookieRecord.value) {
      return;
    }

    const maxAge = Number(cookieRecord.maxAge || '0');
    const maxAgeDirective = Number.isFinite(maxAge) && maxAge > 0 ? `; max-age=${maxAge}` : '';
    document.cookie = `${cookieRecord.name}=${encodeURIComponent(cookieRecord.value)}; path=/${maxAgeDirective}; SameSite=Lax`;
    window.localStorage.setItem(cookieRecord.name, cookieRecord.value);

    if (cookieRecord.name === '_dyjsession') {
      window.localStorage.setItem('dy', cookieRecord.value);
    }

    if (cookieRecord.name === '_dyid') {
      window.localStorage.setItem('dyid', cookieRecord.value);
    }

    if (cookieRecord.name === '_dyid_server') {
      window.localStorage.setItem('dyid_server', cookieRecord.value);
    }
  });
}

function buildBasePayload(pathname: string, cardType: CardType) {
  const recommendationContext = getDyRecommendationContext(pathname);
  const pageId = getPageId(pathname);
  const identity = readIdentity();

  return {
    user: identity.user,
    session: identity.session,
    context: {
      page: {
        type: recommendationContext.type,
        location: window.location.href,
        data: recommendationContext.type === 'PRODUCT' ? recommendationContext.data || [pageId] : [pageId],
      },
      device: {
        userAgent: navigator.userAgent,
        type: detectDeviceType(),
      },
      pageAttributes: {
        tier: cardType,
      },
    },
  };
}

export async function trackPageview(pathname: string, cardType: CardType): Promise<void> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    options: {
      isImplicitPageview: true,
    },
  };

  const response = await fetch('/api/dy/pageview', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return;
  }

  try {
    const body = await response.json();
    applyReturnedCookies(body?.cookies);
  } catch {
    // no-op: pageview can return empty body in some integrations
  }
}

export async function chooseHeroBanner(pathname: string, cardType: CardType): Promise<HeroBannerPayload | null> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['Hero Banner Campaign'],
      groups: ['Homepage'],
    },
    options: {
      isImplicitPageview: false,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const payloadData = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!payloadData || typeof payloadData !== 'object') {
    return null;
  }

  return payloadData as HeroBannerPayload;
}

export type { HeroBannerPayload };
