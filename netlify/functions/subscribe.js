const https = require('https');

const TAG_ID = 2089814; // "La Trousse - Ressources"

function apiCall(options, body) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 8000);
    const req = https.request(options, (res) => {
      clearTimeout(timer);
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email = '', firstName = '';
  try {
    const parsed = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    email = (parsed.email || '').trim();
    firstName = (parsed.firstName || '').trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps invalide' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  const apiKey = process.env.SIO_API_KEY;
  if (!apiKey) {
    console.error('SIO_API_KEY manquante');
    return { statusCode: 500, body: JSON.stringify({ error: 'Config manquante' }) };
  }

  try {
    // Étape 1 : créer le contact
    const contactPayload = JSON.stringify({ email, firstName });
    const createRes = await apiCall({
      hostname: 'api.systeme.io',
      path: '/api/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(contactPayload),
        'X-API-Key': apiKey,
      },
    }, contactPayload);

    console.log('SIO create:', createRes.status, createRes.body);

    let contactId = null;
    if (createRes.status === 200 || createRes.status === 201) {
      try { contactId = JSON.parse(createRes.body).id; } catch {}
    } else if (createRes.status === 409) {
      // Contact déjà existant — on récupère l'ID quand même
      try { contactId = JSON.parse(createRes.body).id; } catch {}
    } else {
      console.error('SIO create error:', createRes.status, createRes.body);
      return { statusCode: 502, body: JSON.stringify({ error: 'Erreur Systeme.io' }) };
    }

    // Étape 2 : assigner le tag
    if (contactId) {
      const tagPayload = JSON.stringify({ id: TAG_ID });
      const tagRes = await apiCall({
        hostname: 'api.systeme.io',
        path: `/api/contacts/${contactId}/tags`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(tagPayload),
          'X-API-Key': apiKey,
        },
      }, tagPayload);
      console.log('SIO tag:', tagRes.status, tagRes.body);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (e) {
    console.error('Erreur:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
