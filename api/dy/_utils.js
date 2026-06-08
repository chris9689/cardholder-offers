const DY_API_BASE = 'https://dy-api.com/v2';

export function getDyApiKey() {
  const key = process.env.DY_API_KEY;
  if (!key) {
    throw new Error('DY_API_KEY is not configured');
  }
  return key;
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

export function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

export async function callDy(path, payload) {
  const response = await fetch(`${DY_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'dy-api-key': getDyApiKey(),
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body: body || { message: 'Dynamic Yield request failed' },
    };
  }

  return {
    ok: true,
    status: response.status,
    body,
  };
}
