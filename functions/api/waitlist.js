// Liste d'attente « couvertures pas encore disponibles ».
//
// Le formulaire vit dans une popup sur les pages produit (même origine), poste
// ici, et c'est CETTE fonction qui parle à systeme.io. Aucun sous-domaine, aucun
// DNS : le visiteur ne quitte jamais la-trousse.fr.
//
// Deux champs sont renseignés :
//   matiere_attendue    → la page d'origine (EPS, Maths, Espagnol…)
//   couverture_attendue → la ou les couvertures précises visées (« EPS 3 »)
// Le second est cumulatif : quelqu'un qui veut la 3 puis la 5 finit avec
// « EPS 3, EPS 5 », pas avec la dernière seulement.

const TAG_ID = 2117874; // "🎒 La Trousse - Attente couvertures"
const CHAMP_MATIERE = 'matiere_attendue';
const CHAMP_COUVERTURE = 'couverture_attendue';

// Liste blanche : matière et numéro viennent du HTML, donc du client. Sans borne,
// le champ devient une poubelle non filtrable. Le max sert aussi de garde-fou.
const MATIERES = {
  'EPS': 8,
  'Maths': 11,
  'Espagnol': 10,
  'Anglais': 9,
  'Histoire-Géo': 14,   // 7 série classique + 7 série mythologie
  'Physique-Chimie': 9,
  'SVT': 18,
  'Français': 9,
  'Enseignant': 9
};

const json = (statut, corps) => new Response(JSON.stringify(corps), {
  status: statut,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

/**
 * Accusé de réception envoyé par Resend.
 *
 * Ne lève jamais : une panne d'e-mail ne doit pas faire échouer une inscription
 * déjà enregistrée chez systeme.io. Sans `RESEND_API_KEY` sur le projet Pages,
 * la fonction ne fait rien et le reste continue — c'est le comportement voulu
 * tant que la clé n'est pas posée.
 */
async function envoyerConfirmation(env, email, prenom, matiere, couverture) {
  try {
    const cle = env.RESEND_API_KEY;
    if (!cle) return;

    const bonjour = prenom ? `Bonjour ${prenom},` : 'Bonjour,';
    const quoi = couverture
      ? `la couverture n° ${couverture} de l'agenda de ${matiere}`
      : `les prochaines couvertures de l'agenda de ${matiere}`;

    const texte =
      `${bonjour}\n\n` +
      `C'est noté : vous serez prévenu dès que ${quoi} sera en ligne.\n\n` +
      `Vous n'avez rien d'autre à faire — nous vous écrirons le jour de la mise en vente.\n\n` +
      `À bientôt,\nFlorian\nLa Trousse — https://la-trousse.fr\n\n` +
      `Vous recevez ce message parce que vous avez demandé à être prévenu sur la-trousse.fr. ` +
      `Une réponse à ce mail suffit pour ne plus rien recevoir.`;

    const html =
      `<p>${bonjour}</p>` +
      `<p>C'est noté : vous serez prévenu dès que <strong>${quoi}</strong> sera en ligne.</p>` +
      `<p>Vous n'avez rien d'autre à faire — nous vous écrirons le jour de la mise en vente.</p>` +
      `<p>À bientôt,<br>Florian<br><a href="https://la-trousse.fr">La Trousse</a></p>` +
      `<p style="color:#888;font-size:12px">Vous recevez ce message parce que vous avez demandé ` +
      `à être prévenu sur la-trousse.fr. Une réponse à ce mail suffit pour ne plus rien recevoir.</p>`;

    const rep = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'La Trousse <contact@la-trousse.fr>',
        to: [email],
        subject: couverture
          ? `C'est noté — couverture n° ${couverture} (${matiere})`
          : `C'est noté — agenda de ${matiere}`,
        text: texte,
        html
      })
    });
    if (!rep.ok) console.error('Resend:', rep.status, await rep.text());
  } catch (e) {
    console.error('Resend exception:', e.message);
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let email = '', firstName = '', matiere = '', couverture = '';
  try {
    const parsed = await request.json();
    email = String(parsed.email || '').trim().toLowerCase();
    firstName = String(parsed.firstName || '').trim().slice(0, 60);
    matiere = String(parsed.matiere || '').trim();
    couverture = String(parsed.couverture || '').trim();
  } catch (e) {
    return json(400, { error: 'Corps invalide' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(400, { error: 'Email invalide' });
  }
  if (!Object.prototype.hasOwnProperty.call(MATIERES, matiere)) {
    return json(400, { error: 'Matière inconnue' });
  }

  // Couverture facultative : on peut s'inscrire sans en viser une en particulier.
  let libelleCouv = '';
  if (couverture) {
    const n = Number(couverture);
    if (!Number.isInteger(n) || n < 1 || n > MATIERES[matiere]) {
      return json(400, { error: 'Couverture inconnue' });
    }
    libelleCouv = matiere + ' ' + n;
  }

  const apiKey = env.SIO_API_KEY;
  if (!apiKey) {
    console.error('SIO_API_KEY manquante');
    return json(500, { error: 'Config manquante' });
  }

  const entetes = { 'Content-Type': 'application/json', 'X-API-Key': apiKey };
  const champs = [{ slug: CHAMP_MATIERE, value: matiere }];
  if (libelleCouv) champs.push({ slug: CHAMP_COUVERTURE, value: libelleCouv });

  try {
    // Étape 1 — créer le contact avec sa matière et sa couverture.
    const createRes = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: entetes,
      body: JSON.stringify({
        email,
        fields: firstName
          ? [{ slug: 'first_name', value: firstName }, ...champs]
          : champs
      })
    });
    const createBody = await createRes.text();

    let contactId = null;
    try { contactId = JSON.parse(createBody).id; } catch (e) {}

    // 422 = contact déjà connu (systeme.io ne renvoie pas 409). Ce n'est pas une
    // erreur : on récupère l'id, on cumule la nouvelle couverture aux précédentes.
    if (!contactId && (createRes.status === 409 || createRes.status === 422)) {
      const q = await fetch(
        'https://api.systeme.io/api/contacts?email=' + encodeURIComponent(email),
        { headers: entetes });
      const found = await q.json().catch(() => null);
      const items = found && (found.items || found);
      const contact = Array.isArray(items) && items.length ? items[0] : null;
      contactId = contact && contact.id;

      if (contactId) {
        const maj = [{ slug: CHAMP_MATIERE, value: matiere }];
        if (libelleCouv) {
          const avant = ((contact.fields || [])
            .find(f => f.slug === CHAMP_COUVERTURE) || {}).value || '';
          const liste = avant.split(',').map(s => s.trim()).filter(Boolean);
          if (liste.indexOf(libelleCouv) === -1) liste.push(libelleCouv);
          maj.push({ slug: CHAMP_COUVERTURE, value: liste.join(', ').slice(0, 250) });
        }
        await fetch('https://api.systeme.io/api/contacts/' + contactId, {
          method: 'PATCH',
          headers: { ...entetes, 'Content-Type': 'application/merge-patch+json' },
          body: JSON.stringify({ fields: maj })
        });
      }
    } else if (createRes.status >= 400) {
      console.error('SIO create:', createRes.status, createBody);
      return json(502, { error: 'Erreur SIO', code: createRes.status });
    }

    // Étape 2 — le tag, porte d'entrée de la campagne d'annonce.
    // ⚠️ systeme.io attend `tagId`, pas `id` : avec `id` il répond 400 et rien n'est posé.
    if (contactId && TAG_ID) {
      const tagRes = await fetch(
        'https://api.systeme.io/api/contacts/' + contactId + '/tags', {
          method: 'POST',
          headers: entetes,
          body: JSON.stringify({ tagId: TAG_ID })
        });
      if (!tagRes.ok) console.error('SIO tag:', tagRes.status, await tagRes.text());
    }

    // Étape 3 — l'accusé de réception.
    //
    // Sans lui, on laisse quelqu'un donner son adresse et ne rien recevoir : il ne
    // sait pas si ça a marché, et il redonne son mail ou s'en va. Le bandeau vert
    // à l'écran disparaît au premier rechargement ; le mail, non.
    //
    // ⚠️ Volontairement NON bloquant : si Resend refuse ou si la clé n'est pas
    // posée, l'inscription reste enregistrée et la page affiche quand même son
    // succès. Perdre une adresse parce que l'accusé a échoué serait absurde.
    await envoyerConfirmation(env, email, firstName, matiere, couverture);

    return json(200, { success: true });

  } catch (e) {
    console.error('Erreur:', e.message);
    return json(500, { error: e.message });
  }
}
