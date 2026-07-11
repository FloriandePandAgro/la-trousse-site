const https = require('https');

const TAG_ID = 2089814; // "La Trousse - Ressources"

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
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var email = '', firstName = '';
  try {
    var parsed = JSON.parse(event.body || '{}');
    email = (parsed.email || '').trim();
    firstName = (parsed.firstName || '').trim();
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps invalide' }) };
  }

  if (!email || email.indexOf('@') === -1) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  var apiKey = process.env.SIO_API_KEY;
  if (!apiKey) {
    console.error('SIO_API_KEY manquante');
    return { statusCode: 500, body: JSON.stringify({ error: 'Config manquante' }) };
  }

  try {
    // Étape 1 : créer le contact
    var contactPayload = JSON.stringify({ email: email, firstName: firstName });
    var createRes = await apiCall(
      'api.systeme.io', '/api/contacts', 'POST',
      {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(contactPayload),
        'X-API-Key': apiKey
      },
      contactPayload
    );

    console.log('SIO create:', createRes.status, createRes.body);

    var contactId = null;
    try { contactId = JSON.parse(createRes.body).id; } catch(e) {}

    if (createRes.status >= 400 && createRes.status !== 409) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Erreur SIO', code: createRes.status }) };
    }

    // Étape 2 : assigner le tag
    if (contactId) {
      var tagPayload = JSON.stringify({ id: TAG_ID });
      var tagRes = await apiCall(
        'api.systeme.io', '/api/contacts/' + contactId + '/tags', 'POST',
        {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(tagPayload),
          'X-API-Key': apiKey
        },
        tagPayload
      );
      console.log('SIO tag:', tagRes.status, tagRes.body);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch(e) {
    console.error('Erreur:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
