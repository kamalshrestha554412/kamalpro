exports.handler = async function(event) {
  const SCRIPT_URL = "https://https://script.google.com/macros/s/AKfycbwJfSSbp_LEkCA2lbA0_nDctPNJGGZZ4x6TdfcBrHu-Le86mIle4BH3OrhZYXl2zRM/exec";
  
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

  try {
    const url = event.queryStringParameters && event.queryStringParameters.action 
      ? SCRIPT_URL + '?action=' + event.queryStringParameters.action
      : SCRIPT_URL;
    
    const options = { method: event.httpMethod };
    if (event.body) options.body = event.body;
    
    const response = await fetch(url, options);
    const data = await response.text();
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: err.toString() })
    };
  }
};