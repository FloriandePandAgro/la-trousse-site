const https = require('https');

function post(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, firstName;
  try {
    ({ email, firstName = '' } = JSON.parse(event.body));
  } catch {
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

  const payload = JSON.stringify({
    email,
    firstName,
    tags: [{ name: 'La Trousse - Ressources' }],
  });

  const options = {
    hostname: 'api.systeme.io',
    path: '/api/contacts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'X-API-Key': apiKey,
    },
  };

  try {
    const res = await post(options, payload);
    console.log('SIO status:', res.status, res.body);

    if (res.status === 200 || res.status === 201 || res.status === 409) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 502, body: JSON.stringify({ error: 'Erreur Systeme.io', detail: res.body }) };
  } catch (e) {
    console.error('Erreur réseau:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
