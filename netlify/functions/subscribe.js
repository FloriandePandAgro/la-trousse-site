const https = require('https');

const TAG_ID = 2089814;

function apiCall(hostname, path, method, headers, body) {
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() { reject(new Error('timeout')); }, 8000);
    var req = https.request({ hostname: hostname, path: path, method: method, headers: headers }, function(res) {
      clearTimeout(timer);
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve({ status: res.statusCode, body: data }); });
    });
    req.on('error', function(e) { clearTimeout(timer); reject(e); });
    if (body) { req.write(body); }
    req.end();
  });
}

exports.handler = function(event, context, callback) {
  console.log('Function called, method:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return callback(null, { statusCode: 405, body: 'Method Not Allowed' });
  }

  var email = '';
  var firstName = '';
  try {
    var parsed = JSON.parse(event.body || '{}');
    email = (parsed.email || '').trim();
    firstName = (parsed.firstName || '').trim();
  } catch(e) {
    console.log('Parse error:', e.message);
    return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'Corps invalide' }) });
  }

  console.log('Email recu:', email);

  if (!email || email.indexOf('@') === -1) {
    return callback(null, { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) });
  }

  var apiKey = process.env.SIO_API_KEY;
  console.log('API key present:', !!apiKey);

  if (!apiKey) {
    return callback(null, { statusCode: 500, body: JSON.stringify({ error: 'Config manquante' }) });
  }

  var contactPayload = JSON.stringify({ email: email, firstName: firstName });

  apiCall(
    'api.systeme.io',
    '/api/contacts',
    'POST',
    {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(contactPayload),
      'X-API-Key': apiKey
    },
    contactPayload
  ).then(function(createRes) {
    console.log('SIO create status:', createRes.status);
    console.log('SIO create body:', createRes.body);

    var contactId = null;
    try { contactId = JSON.parse(createRes.body).id; } catch(e) {}

    if (createRes.status >= 400 && createRes.status !== 409) {
      return callback(null, { statusCode: 502, body: JSON.stringify({ error: 'Erreur SIO', code: createRes.status }) });
    }

    if (!contactId) {
      return callback(null, { statusCode: 200, body: JSON.stringify({ success: true }) });
    }

    var tagPayload = JSON.stringify({ id: TAG_ID });
    return apiCall(
      'api.systeme.io',
      '/api/contacts/' + contactId + '/tags',
      'POST',
      {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(tagPayload),
        'X-API-Key': apiKey
      },
      tagPayload
    ).then(function(tagRes) {
      console.log('SIO tag status:', tagRes.status, tagRes.body);
      return callback(null, { statusCode: 200, body: JSON.stringify({ success: true }) });
    });

  }).catch(function(e) {
    console.log('Error:', e.message);
    return callback(null, { statusCode: 500, body: JSON.stringify({ error: e.message }) });
  });
};
