import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Connexion automatique à votre base Upstash Redis sur Vercel
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCommand(command) {
  if (!KV_URL || !KV_TOKEN) return null;
  const response = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) }); return response.json(); }  // Convertit une heure "14h30" en format UTC "20270501T123000Z" pour Google Calendar (Belgique = UTC+2 en mai) function getUtcStart(timeStr, isJournee) { const match = String(timeStr \vert{}\vert{} '').match(/(\d{1,2})[h:](\d{2})/i); if (!match) return isJournee ? '20270501T123000Z' : '20270501T170000Z'; const hourUtc = Math.max(0, parseInt(match[1], 10) - 2); return `20270501T${String(hourUtc).padStart(2, '0')}${match[2]}00Z`; }  export default async function handler(req, res) { // 1. CHARGER LA LISTE DES INVITÉS DANS LE BACKOFFICE (GET) if (req.method === 'GET') { try { const data = await kvCommand(['LRANGE', 'rsvps_lisa_nathan', 0, -1]); const list = data && Array.isArray(data.result) ? data.result.map((item) => JSON.parse(item)) : []; return res.status(200).json({ rsvps: list }); } catch (err) { return res.status(200).json({ rsvps: [] }); } }  // 2. SUPPRIMER UN INVITÉ DEPUIS LE BACKOFFICE (DELETE) if (req.method === 'DELETE') { try { const { id } = req.body; const data = await kvCommand(['LRANGE', 'rsvps_lisa_nathan', 0, -1]); if (data && Array.isArray(data.result)) { const filtered = data.result .map((item) => JSON.parse(item)) .filter((r) => r.id !== id); await kvCommand(['DEL', 'rsvps_lisa_nathan']); for (let i = filtered.length - 1; i >= 0; i--) { await kvCommand(['LPUSH', 'rsvps_lisa_nathan', JSON.stringify(filtered[i])]); } } return res.status(200).json({ success: true }); } catch (err) { return res.status(500).json({ error: err.message }); } }  // 3. ENREGISTRER UNE RÉPONSE & ENVOYER LE MAIL DE CONFIRMATION (POST) if (req.method !== 'POST') { return res.status(405).json({ error: 'Méthode non autorisée' }); }  const entry = req.body; const { prenom, nom, email, presence, parcours, accompagnants = 0, accompagnantsList = [], scheduleSnapshot = [], motDoux, skipEmail } = entry;  try { const savedEntry = { ...entry, id: entry.id \vert{}\vert{} 'rsvp-' + Date.now(), createdAt: entry.createdAt \vert{}\vert{} new Date().toISOString() };  // Sauvegarde dans Upstash Redis if (KV_URL && KV_TOKEN) { await kvCommand(['LPUSH', 'rsvps_lisa_nathan', JSON.stringify(savedEntry)]); }  // Si ajout manuel depuis le backoffice (/admin), on n'envoie pas d'e-mail if (skipEmail) { return res.status(200).json({ success: true, entry: savedEntry }); }  const totalPersonnes = presence ? 1 + Number(accompagnants) : 0; const listAccompagnants = accompagnantsList && accompagnantsList.length > 0 ? accompagnantsList .map((a) => `${a.prenom} ${a.nom}`.trim()) .filter(Boolean) .join(', ') : 'Aucun';  const isJournee = parcours === 'journee'; const steps = Array.isArray(scheduleSnapshot) && scheduleSnapshot.length > 0 ? scheduleSnapshot : isJournee ? [ { time: '14h30', title: 'Accueil des Invités' }, { time: '15h00', title: 'Cérémonie' }, { time: '16h30', title: 'Vin d’honneur & Cocktail' }, { time: '19h00', title: 'Dîner & Festivités' }, { time: '22h30', title: 'Ouverture du Bal & Soirée' } ] : [ { time: '19h00', title: 'Accueil & Dîner de Mariage' }, { time: '21h30', title: 'Pièce Montée & Animations' }, { time: '22h30', title: 'Ouverture du Bal & Soirée' } ];  const heureArrivee = steps[0]?.time \vert{}\vert{} (isJournee ? '14h30' : '19h00'); const programmeHtml = steps .map((s) => `<strong>${s.time} :</strong> ${s.title}${s.subtitle ? ` — <em>${s.subtitle}</em>` : ''}`)
      .join('<br/>');

    const mapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert+Belgique';
    const wazeUrl =
      'https://waze.com/ul?q=Chemin%20du%20Moulin%20al%20Poudre%202%201435%20Mont-Saint-Guibert';
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent( 'Mariage de Lisa & Nathan' )}&dates=${getUtcStart(heureArrivee, isJournee)}/20270502T010000Z&details=${encodeURIComponent( `Mariage de Lisa & Nathan — Rendez-vous dès ${heureArrivee}. Dress code : Palette Coucher de Soleil.` )}&location=${encodeURIComponent(
      'Domaine du Moulin al Poudre, Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert, Belgique'
    )}`;

    // A. E-mail de confirmation envoyé à l'invité (Style épuré fond blanc)
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
              Bonjour ${prenom}${nom},
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #292524; margin-bottom: 28px;">
              ${
                presence
                  ? 'Merci pour votre réponse. Nous avons bien reçu votre confirmation de présence et avons terriblement hâte de célébrer notre mariage à vos côtés le <strong>samedi 1er mai 2027</strong>.'
                  : 'Merci pour votre réponse. Nous avons bien noté que vous ne pourrez malheureusement pas être parmi nous le 1er mai 2027. Nous penserons très fort à vous !'
              }
            </p>

            <!-- Encadré central -->
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
                    ? `Rendez-vous le 1er Mai 2027 dès <strong style="color: #b8862d;">${heureArrivee}</strong>`
                    : 'Réponse bien transmise aux mariés'
                }
              </div>
            </div>

            ${
              presence
                ? `
              <!-- Boutons Itinéraire & Agenda -->
              <div style="text-align: center; margin-bottom: 34px;">
                <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #14171f; color: #e5b95c; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 13px; padding: 13px 22px; border-radius: 10px; border: 1.5px solid #b8862d; margin: 4px;">
                  Voir sur Google Maps
                </a>
                <a href="${wazeUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #1c1917; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 13px; padding: 13px 22px; border-radius: 10px; border: 1.5px solid #d6d3d1; margin: 4px;">
                  Itinéraire Waze
                </a>
                <br/>
                <a href="${googleCalUrl}" target="_blank" style="display: inline-block; color: #b8862d; text-decoration: underline; font-family: Arial, sans-serif; font-size: 12px; margin-top: 12px;">
                  + Ajouter à mon Google Agenda
                </a>
              </div>

              <!-- Programme dynamique -->
              <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                VOTRE PROGRAMME
              </div>
              <p style="font-size: 15px; line-height: 1.75; color: #1c1917; margin-top: 0; margin-bottom: 22px;">
                ${programmeHtml}
              </p>

              <!-- Lieu & Dress Code -->
              <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                LIEU &amp; DRESS CODE
              </div>
              <p style="font-size: 15px; line-height: 1.65; color: #1c1917; margin-top: 0; margin-bottom: 22px;">
                <strong>Domaine du Moulin al Poudre</strong><br/>
                Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert<br/>
                <strong>Dress code :</strong> Palette Coucher de Soleil (du jaune solaire à l’orange couchant).
              </p>

              <!-- Accompagnants -->
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

            <p style="font-size: 14px; font-style: italic; color: #57534e; margin-top: 28px; margin-bottom: 24px;">
              Avec toute notre affection, Lisa &amp; Nathan.
            </p>

            <div style="border-top: 1px solid #f0ede6; padding-top: 16px; text-align: center;">
              <a href="https://www.rmbooth.com" target="_blank" style="font-family: Arial, sans-serif; font-size: 11px; color: #a8a29e; text-decoration: underline;">
                Vous aussi, créez un site sur mesure pour vos faire-part de mariage — www.rmbooth.com
              </a>
            </div>
          </div>
        </div>
      `
    });

    // B. Notification interne pour Lisa & Nathan
    await resend.emails.send({
      from: 'Site Mariage <contact@lisaetnathan.site>',
      to: ['lisa.safique@outlook.be'],
      subject: `🔔 Nouveau RSVP : ${prenom} ${nom} (${presence ? 'Présent' : 'Absent'})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
          <h2 style="color: #b8862d;">Nouvelle réponse RSVP reçue !</h2>
          <p><strong>Nom :</strong> ${prenom}${nom}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Statut :</strong> ${presence ? `Présent (${totalPersonnes} pers. au total)` : 'Absent'}</p>
          <p><strong>Parcours :</strong> ${isJournee ? `Journée (${heureArrivee})` : `Repas du soir (${heureArrivee})`}</p>
          <p><strong>Accompagnants (${accompagnants}) :</strong> ${listAccompagnants}</p>${motDoux ? `<p><strong>Mot doux :</strong> « ${motDoux} »</p>` : ''}
        </div>
      `
    });

    return res.status(200).json({ success: true, entry: savedEntry });
  } catch (error) {
    console.error('Erreur API send-rsvp:', error);
    return res.status(500).json({ error: error.message });
  }
}
