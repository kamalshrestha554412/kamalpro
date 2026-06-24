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

  return new Promise((resolve) => {
    const urlObj = new URL(targetUrl);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: event.httpMethod,
      headers: {}
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: err.toString() })
      });
    });

    if (event.body) req.write(event.body);
    req.end();
  });
};