import { callDy, getRequestBody, json } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await getRequestBody(req);
    const result = await callDy('/serve/user/agent-assistant', payload);

    if (!result.ok) {
      json(res, result.status, {
        error: 'Dynamic Yield Shopping Muse call failed',
        details: result.body,
      });
      return;
    }

    json(res, 200, result.body || {});
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : 'Unexpected server error' });
  }
}