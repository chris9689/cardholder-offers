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

export interface DyProductData {
  group_id?: string;
  categories?: string[];
  in_stock?: boolean;
  name: string;
  url?: string;
  image_url?: string;
  logo_url?: string;
  brand?: string;
  card_tier?: string;
  country_code?: string;
  locale?: string;
  language_code?: string;
  offer_country?: string;
  price?: number;
  [key: string]: unknown;
}

export interface DyRecommendationSlot {
  sku: string;
  productData: DyProductData;
  slotId?: string;
}

export interface HomepageChoiceResult {
  heroBanner: HeroBannerPayload | null;
  recommendations: DyRecommendationSlot[];
  recsTitle: string;
  recsSubtitle: string;
}

export interface PdpChoiceResult {
  recommendations: DyRecommendationSlot[];
  recsTitle: string;
}

export interface UserBarData {
  name: string;
  cardType: CardType;
  points: number;
}

export interface UserAffinityProfile {
  uid: string;
  categories: Record<string, number>;
  countries: Record<string, number>;
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

  const user: DyIdentity['user'] = { active_consent_accepted: true };
  if (dyid) {
    user.dyid = dyid;
    user.dyid_server = dyidServer;
  }

  const session: DyIdentity['session'] = {};
  if (dySession) {
    session.dy = dySession;
  }

  return { user, session };
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
        card_tier: cardType,
        selected_tier: cardType,
      },
      customAttributes: {
        tier: cardType,
        card_tier: cardType,
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
      isImplicitPageview: true,
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

export async function chooseHomepageGroup(pathname: string, cardType: CardType): Promise<HomepageChoiceResult> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['Hero Banner Campaign'],
      groups: ['Homepage'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const empty: HomepageChoiceResult = {
    heroBanner: null,
    recommendations: [],
    recsTitle: 'Recommended Offers',
    recsSubtitle: 'Personalized Picks',
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return empty;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  let heroBanner: HeroBannerPayload | null = null;
  let recommendations: DyRecommendationSlot[] = [];
  let recsTitle = empty.recsTitle;
  let recsSubtitle = empty.recsSubtitle;

  for (const choice of body?.choices ?? []) {
    const variation = choice?.variations?.[0];
    if (!variation) continue;

    if (choice.type === 'DECISION' && variation.payload?.data) {
      heroBanner = variation.payload.data as HeroBannerPayload;
    } else if (choice.type === 'RECS_DECISION' && variation.payload?.data) {
      const data = variation.payload.data as { custom?: { title?: string; subtitle?: string }; slots?: DyRecommendationSlot[] };
      recommendations = data.slots ?? [];
      recsTitle = data.custom?.title ?? recsTitle;
      recsSubtitle = data.custom?.subtitle ?? recsSubtitle;
    }
  }

  return { heroBanner, recommendations, recsTitle, recsSubtitle };
}

export async function choosePdpRecommendations(sku: string, cardType: CardType): Promise<PdpChoiceResult> {
  const base = buildBasePayload(`/offers/${encodeURIComponent(sku)}`, cardType);
  const payload = {
    ...base,
    context: {
      ...base.context,
      page: {
        type: 'PRODUCT',
        location: window.location.href,
        data: [sku],
      },
    },
    selector: {
      names: ['PDP Recommendation'],
      groups: ['Productpage'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const fallback: PdpChoiceResult = {
    recommendations: [],
    recsTitle: 'Recommended for You',
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return fallback;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  for (const choice of body?.choices ?? []) {
    const variation = choice?.variations?.[0];
    if (choice?.type !== 'RECS_DECISION' || !variation?.payload?.data) {
      continue;
    }

    const data = variation.payload.data as { custom?: { title?: string }; slots?: DyRecommendationSlot[] };
    return {
      recommendations: data.slots ?? [],
      recsTitle: data.custom?.title ?? fallback.recsTitle,
    };
  }

  return fallback;
}

export type { HeroBannerPayload };

// ─── Experience Search ────────────────────────────────────────────────────────

export interface DySearchFacetValue {
  name: string;
  count: number;
}

export interface DySearchFacet {
  column: string;
  displayName: string;
  valuesType: string;
  values: DySearchFacetValue[];
}

export interface DySearchResult {
  slots: DyRecommendationSlot[];
  facets: DySearchFacet[];
  totalNumResults: number;
  searchQuery: string;
  normalizedQuery: string;
}

export async function performDySearch(
  query: string,
  pathname: string,
  cardType: CardType,
  offset = 0,
  numItems = 25,
  filters: Record<string, string[]> = {},
): Promise<DySearchResult> {
  const empty: DySearchResult = { slots: [], facets: [], totalNumResults: 0, searchQuery: query, normalizedQuery: query };

  if (!query.trim()) return empty;

  const identity = readIdentity();
  const recommendationContext = getDyRecommendationContext(pathname);
  const pageId = getPageId(pathname);

  const filterConditions = Object.entries(filters)
    .filter(([, values]) => values.length > 0)
    .map(([column, values]) => ({
      type: 'ATTRIBUTE' as const,
      column,
      operator: 'IN_LIST' as const,
      args: values,
    }));

  const payload = {
    user: identity.user,
    session: identity.session,
    context: {
      page: {
        type: recommendationContext.type,
        location: window.location.href,
        data: [pageId],
      },
      device: {
        userAgent: navigator.userAgent,
        type: detectDeviceType(),
      },
      pageAttributes: {
        tier: cardType,
      },
    },
    selector: {
      name: 'Semantic Search',
    },
    query: {
      text: query,
      ...(filterConditions.length > 0 ? { conditions: filterConditions } : {}),
    },
    options: {
      offset,
      numItems,
      returnAnalyticsMetadata: false,
      isImplicitClientData: false,
    },
  };

  const response = await fetch('/api/dy/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) return empty;

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const data = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!data) return empty;

  return {
    slots: data.slots ?? [],
    facets: data.facets ?? [],
    totalNumResults: data.totalNumResults ?? 0,
    searchQuery: data.searchQuery ?? query,
    normalizedQuery: data.normalizedQuery ?? query,
  };
}

// ─── Shopping Muse ────────────────────────────────────────────────────────────

export interface DyShoppingMuseWidget {
  title?: string;
  slots: DyRecommendationSlot[];
}

export interface DyShoppingMuseResult {
  assistant: string;
  support: boolean;
  chatId?: string;
  widgets: DyShoppingMuseWidget[];
}

export async function performShoppingMuse(
  prompt: string,
  pathname: string,
  cardType: CardType,
  chatId?: string,
  userVariables?: UserBarData | null,
): Promise<DyShoppingMuseResult | null> {
  if (!prompt.trim()) {
    return null;
  }

  const basePayload = buildBasePayload(pathname, cardType);

  const payload: Record<string, unknown> = {
    ...basePayload,
    context: {
      ...basePayload.context,
      pageAttributes: {
        ...basePayload.context.pageAttributes,
        ...(userVariables
          ? {
              user_name: userVariables.name,
              user_card_tier: cardType,
              user_points: userVariables.points,
            }
          : {}),
      },
    },
    query: {
      text: prompt,
      ...(chatId ? { chatId } : {}),
    },
    selector: {
      name: 'Shopping Muse',
    },
    options: {
      productData: {
        skusOnly: false,
      },
    },
  };

  const response = await fetch('/api/dy/shopping-muse', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const data = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    assistant: typeof data.assistant === 'string' ? data.assistant : 'No response available.',
    support: Boolean(data.support),
    chatId: typeof data.chatId === 'string' ? data.chatId : undefined,
    widgets: Array.isArray(data.widgets) ? data.widgets : [],
  };
}

export async function chooseUserBar(pathname: string, cardType: CardType): Promise<UserBarData | null> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['User Status Bar API'],
    },
    options: {
      isImplicitPageview: false,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  try {
    const response = await fetch('/api/dy/choose', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    applyReturnedCookies(body?.cookies);

    const payloadData = body?.choices?.[0]?.variations?.[0]?.payload?.data?.userBar;
    if (!payloadData || typeof payloadData !== 'object') {
      return null;
    }

    const data = payloadData as {
      name?: unknown;
      cardType?: unknown;
      points?: unknown;
    };

    const normalizedName = typeof data.name === 'string' && data.name.trim().length > 0 ? data.name.trim() : null;
    const normalizedPointsRaw = typeof data.points === 'number' ? data.points : Number(data.points);
    const normalizedPoints = Number.isFinite(normalizedPointsRaw) ? normalizedPointsRaw : 0;
    return {
      name: normalizedName ?? 'Cardholder',
      // Keep selected tier as source of truth to prevent stale/incorrect API cardType from overriding UI state.
      cardType,
      points: normalizedPoints,
    };
  } catch {
    return null;
  }
}

export async function fetchUserAffinities(): Promise<UserAffinityProfile | null> {
  const identity = readIdentity();
  const uid = identity.user.dyid;

  if (!uid) {
    return null;
  }

  try {
    const response = await fetch('/api/dy/user-affinities', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    const rawCategories = body?.categories;
    const rawCountries = body?.countries;

    const categories: Record<string, number> = {};
    if (rawCategories && typeof rawCategories === 'object') {
      for (const [key, value] of Object.entries(rawCategories as Record<string, unknown>)) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          categories[key] = numericValue;
        }
      }
    }

    const countries: Record<string, number> = {};
    if (rawCountries && typeof rawCountries === 'object') {
      for (const [key, value] of Object.entries(rawCountries as Record<string, unknown>)) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          countries[key] = numericValue;
        }
      }
    }

    return { uid, categories, countries };
  } catch {
    return null;
  }
}
