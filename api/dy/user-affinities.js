import { getRequestBody, json } from './_utils.js';

const AFFINITY_SEC = '8794982';
const AFFINITY_BASE_URL = 'https://rcom.dynamicyield.com/userAffinities';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await getRequestBody(req);
    const uid = typeof payload?.uid === 'string' ? payload.uid.trim() : '';

    if (!uid) {
      json(res, 400, { error: 'Missing uid' });
      return;
    }

    const url = `${AFFINITY_BASE_URL}?sec=${AFFINITY_SEC}&uid=${encodeURIComponent(uid)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      let details = null;
      try {
        details = await response.json();
      } catch {
        details = { message: 'Affinity service returned non-JSON response' };
      }

      json(res, response.status, {
        error: 'Dynamic Yield user affinities call failed',
        details,
      });
      return;
    }

    const body = await response.json();
    const categories = body?.categories && typeof body.categories === 'object' ? body.categories : {};
    const countriesSource =
      (body?.offer_country && typeof body.offer_country === 'object' && body.offer_country) ||
      (body?.offerCountry && typeof body.offerCountry === 'object' && body.offerCountry) ||
      (body?.countries && typeof body.countries === 'object' && body.countries) ||
      (body?.offerCountries && typeof body.offerCountries === 'object' && body.offerCountries) ||
      (body?.countryAffinities && typeof body.countryAffinities === 'object' && body.countryAffinities) ||
      {};

    json(res, 200, { uid, categories, countries: countriesSource });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : 'Unexpected server error' });
  }
}
