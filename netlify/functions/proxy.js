const https = require('https');

exports.handler = async function(event) {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyv-QLqPnb8PJoXHUvVQbEFiRCtQOHp5yqILrIfDmO51Vi-V3DtzyyJwaUfB6i9QDI/exec";

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST'
      },
      body: ''
    };
  }

  const action = event.queryStringParameters && event.queryStringParameters.action;
  const targetUrl = action ? SCRIPT_URL + '?action=' + action : SCRIPT_URL;

  function fetchWithRedirect(url, options, body, redirectCount) {
    redirectCount = redirectCount || 0;
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const reqOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: { 'Content-Type': 'text/plain' }
      };

      const req = https.request(reqOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(fetchWithRedirect(res.headers.location, { method: 'GET' }, null, redirectCount + 1));
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  try {
    const data = await fetchWithRedirect(targetUrl, { method: event.httpMethod }, event.body);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: typeof data === 'string' ? data : JSON.stringify(data)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.toString() })
    };
  }
};