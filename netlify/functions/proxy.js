const https = require('https');

exports.handler = async function(event) {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAClmRUihDHuefRHe7ZpoWfJJRgJZCO6twq36FaPUawBOC3EtMWWtFUMDLAUIxjA/exec";

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

  function fetchWithRedirect(url, method, body, redirectCount) {
    redirectCount = redirectCount || 0;
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const reqOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: method || 'GET',
        headers: { 'Content-Type': 'text/plain' }
      };

      const req = https.request(reqOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(fetchWithRedirect(res.headers.location, 'GET', null, redirectCount + 1));
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
    const data = await fetchWithRedirect(targetUrl, event.httpMethod, event.body);
    const resolved = await data;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: typeof resolved === 'string' ? resolved : JSON.stringify(resolved)
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.toString() })
    };
  }
};