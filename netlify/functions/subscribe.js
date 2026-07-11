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

  try {
    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        email,
        firstName,
        tags: [{ name: 'La Trousse - Ressources' }],
      }),
    });

    const body = await res.text();
    console.log('SIO status:', res.status, body);

    // 200 = créé, 409 = déjà existant (les deux sont OK)
    if (res.ok || res.status === 409) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 502, body: JSON.stringify({ error: 'Erreur Systeme.io', detail: body }) };
  } catch (e) {
    console.error('Fetch error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
