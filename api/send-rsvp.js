import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Récupération automatique des clés de la base de données Vercel / Upstash
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCommand(command) {
  if (!KV_URL || !KV_TOKEN) return null;
  const response = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  return response.json();
}

export default async function handler(req, res) {
  // 1. CHARGER LES RÉPONSES DANS LE BACKOFFICE (GET)
  if (req.method === 'GET') {
    try {
      const data = await kvCommand(['LRANGE', 'rsvps_lisa_nathan', 0, -1]);
      const list = data && Array.isArray(data.result)
        ? data.result.map((item) => JSON.parse(item))
        : [];
      return res.status(200).json({ rsvps: list });
    } catch (err) {
      return res.status(200).json({ rsvps: [] });
    }
  }

  // 2. SUPPRIMER UNE RÉPONSE DEPUIS LE BACKOFFICE (DELETE)
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const data = await kvCommand(['LRANGE', 'rsvps_lisa_nathan', 0, -1]);
      if (data && Array.isArray(data.result)) {
        const filtered = data.result
          .map((item) => JSON.parse(item))
          .filter((r) => r.id !== id);
        await kvCommand(['DEL', 'rsvps_lisa_nathan']);
        for (let i = filtered.length - 1; i >= 0; i--) {
          await kvCommand(['LPUSH', 'rsvps_lisa_nathan', JSON.stringify(filtered[i])]);
        }
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. ENREGISTRER UN RSVP & ENVOYER LES E-MAILS (POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const entry = req.body;
  const {
    prenom,
    nom,
    email,
    presence,
    parcours,
    accompagnants = 0,
    accompagnantsList = [],
    motDoux,
    skipEmail
  } = entry;

  try {
    // A. Sauvegarde permanente dans la base de données du backoffice
    const savedEntry = {
      ...entry,
      id: entry.id || 'rsvp-' + Date.now(),
      createdAt: entry.createdAt || new Date().toISOString()
    };

    if (KV_URL && KV_TOKEN) {
      await kvCommand(['LPUSH', 'rsvps_lisa_nathan', JSON.stringify(savedEntry)]);
    }

    // Si c'est un ajout manuel depuis le backoffice (/admin), on n'envoie pas de mail
    if (skipEmail) {
      return res.status(200).json({ success: true, entry: savedEntry });
    }

    const totalPersonnes = presence ? 1 + Number(accompagnants) : 0;
    const listAccompagnants =
      accompagnantsList && accompagnantsList.length > 0
        ? accompagnantsList.map((a) => `${a.prenom} ${a.nom}`.trim()).filter(Boolean).join(', ')
        : 'Aucun';

    const mapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert+Belgique';

    // B. E-mail de confirmation envoyé à l'invité (Style épuré sans fond)
    await resend.emails.send({
      from: 'Lisa & Nathan <contact@lisaetnathan.site>',
      to: [email],
      subject: presence
        ? 'Confirmation de présence — Mariage de Lisa & Nathan'
        : 'Mariage de Lisa & Nathan — Merci pour votre réponse',
      html: `
        <div style="background-color: #ffffff; padding: 24px 12px; font-family: Georgia, 'Times New Roman', serif; color: #1c1917;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 20px; padding: 36px 28px;">
            
            <h1 style="font-size: 24px; font-weight: normal; color: #111111; margin-top: 0; margin-bottom: 18px;">
              Bonjour ${prenom} ${nom},
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #292524; margin-bottom: 28px;">
              ${
                presence
                  ? 'Merci pour votre réponse. Nous avons bien reçu votre confirmation de présence et avons terriblement hâte de célébrer notre mariage à vos côtés le <strong>samedi 1er mai 2027</strong>.'
                  : 'Merci pour votre réponse. Nous avons bien noté que vous ne pourrez malheureusement pas être parmi nous le 1er mai 2027. Nous penserons très fort à vous !'
              }
            </p>

            <!-- Encadré central épuré -->
            <div style="border: 1px solid #ece8e1; border-radius: 14px; padding: 26px 20px; text-align: center; margin-bottom: 28px; background-color: #fdfcfb;">
              <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #57534e; margin-bottom: 12px;">
                VOTRE CONFIRMATION
              </div>
              <div style="font-size: 38px; font-weight: bold; color: #b8862d; margin-bottom: 10px;">
                ${
                  presence
                    ? `${totalPersonnes} ${totalPersonnes > 1 ? 'Personnes' : 'Personne'}`
                    : 'Absent(e)'
                }
              </div>
              <div style="font-size: 15px; color: #292524;">
                ${
                  presence
                    ? `Rendez-vous le 1er Mai 2027 dès <strong style="color: #b8862d;">${
                        parcours === 'journee' ? '14h30' : '19h00'
                      }</strong>`
                    : 'Réponse bien transmise aux mariés'
                }
              </div>
            </div>

            ${
              presence
                ? `
              <!-- Bouton sombre à bordure dorée -->
              <div style="text-align: center; margin-bottom: 34px;">
                <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #14171f; color: #e5b95c; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 10px; border: 1.5px solid #b8862d;">
                  Voir l’itinéraire sur Google Maps
                </a>
              </div>

              <!-- Section Détails -->
              <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                LIEU & PROGRAMME
              </div>
              <p style="font-size: 15px; line-height: 1.65; color: #1c1917; margin-top: 0; margin-bottom: 22px;">
                <strong>Domaine du Moulin al Poudre</strong><br/>
                Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert<br/>
                Accueil prévu dès ${
                  parcours === 'journee'
                    ? '14h30 pour la cérémonie suivie du vin d’honneur et des festivités.'
                    : '19h00 pour le cocktail de bienvenue, le dîner et la soirée.'
                }<br/>
                <strong>Dress code :</strong> Palette Coucher de Soleil (du jaune solaire à l’orange couchant).
              </p>

              <!-- Section Accompagnants -->
              <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                ACCOMPAGNANT(S)
              </div>
              <p style="font-size: 15px; color: #44403c; margin-top: 0; margin-bottom: 22px;">
                ${Number(accompagnants) > 0 ? listAccompagnants : 'Aucun (vient seul·e)'}
              </p>
            `
                : ''
            }

            ${
              motDoux
                ? `
              <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                VOTRE MOT DOUX
              </div>
              <p style="font-size: 15px; font-style: italic; color: #44403c; margin-top: 0; margin-bottom: 22px;">
                « ${motDoux} »
              </p>
            `
                : ''
            }

            <p style="font-size: 14px; font-style: italic; color: #57534e; margin-top: 28px; margin-bottom: 0;">
              Avec toute notre affection, Lisa &amp; Nathan.
            </p>
          </div>
        </div>
      `
    });

    // C. Notification envoyée sur votre boîte outlook.be
    await resend.emails.send({
      from: 'Site Mariage <contact@lisaetnathan.site>',
      to: ['lisa.safique@outlook.be'],
      subject: `🔔 Nouveau RSVP : ${prenom} ${nom} (${presence ? 'Présent' : 'Absent'})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
          <h2 style="color: #b8862d;">Nouvelle réponse RSVP reçue !</h2>
          <p><strong>Nom :</strong> ${prenom} ${nom}</p>
          <p><strong>Email de l'invité :</strong> ${email}</p>
          <p><strong>Statut :</strong> ${presence ? `Présent (${totalPersonnes} pers. au total)` : 'Absent'}</p>
          <p><strong>Parcours :</strong> ${parcours === 'journee' ? 'Journée & Cérémonie (14h30)' : 'Repas du soir (19h00)'}</p>
          <p><strong>Accompagnants (${accompagnants}) :</strong> ${listAccompagnants}</p>
          ${motDoux ? `<p><strong>Mot doux :</strong> « ${motDoux} »</p>` : ''}
        </div>
      `
    });

    return res.status(200).json({ success: true, entry: savedEntry });
  } catch (error) {
    console.error('Erreur API RSVP:', error);
    return res.status(500).json({ error: error.message });
  }
}
