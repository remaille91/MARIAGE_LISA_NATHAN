import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

function getUtcStart(timeStr, isJournee) {
  const match = String(timeStr || '').match(/(\d{1,2})[h:](\d{2})/i);
  if (!match) return isJournee ? '20270501T123000Z' : '20270501T170000Z';
  const hourUtc = Math.max(0, parseInt(match[1], 10) - 2);
  return `20270501T${String(hourUtc).padStart(2, '0')}${match[2]}00Z`;
}

export default async function handler(req, res) {
  try {
    // 1. Si l'appel vient du bouton Backoffice, on sauvegarde la dernière version du programme dans Redis
    let activeSchedule = req.body && req.body.scheduleData ? req.body.scheduleData : null;
    if (activeSchedule) {
      await kvCommand(['SET', 'schedule_lisa_nathan', JSON.stringify(activeSchedule)]);
    } else {
      const savedSched = await kvCommand(['GET', 'schedule_lisa_nathan']);
      if (savedSched && savedSched.result) {
        try {
          activeSchedule = JSON.parse(savedSched.result);
        } catch (e) {
          activeSchedule = null;
        }
      }
    }

    // 2. Récupérer tous les invités depuis Upstash Redis
    const data = await kvCommand(['LRANGE', 'rsvps_lisa_nathan', 0, -1]);
    const allRsvps =
      data && Array.isArray(data.result)
        ? data.result.map((item) => JSON.parse(item))
        : [];

    // 3. Filtrer uniquement les invités PRÉSENTS qui n'ont PAS ENCORE reçu le rappel J-7
    const pendingGuests = allRsvps.filter(
      (g) =>
        g.presence === true &&
        !g.reminderSent &&
        g.email &&
        g.email.includes('@') &&
        !g.email.includes('non-renseigne')
    );

    // Limite stricte de 80 e-mails par jour (sous le quota gratuit de 100/jour de Resend)
    const DAILY_BATCH_LIMIT = 80;
    const batchToSend = pendingGuests.slice(0, DAILY_BATCH_LIMIT);

    if (batchToSend.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        remainingCount: 0,
        message: 'Tous les invités présents ont déjà reçu leur e-mail de récapitulatif J-7 !'
      });
    }

    const mapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Chemin+du+Moulin+al+Poudre+2+1435+Mont-Saint-Guibert+Belgique';
    const wazeUrl =
      'https://waze.com/ul?q=Chemin%20du%20Moulin%20al%20Poudre%202%201435%20Mont-Saint-Guibert';

    let sentCount = 0;
    const sentIds = new Set();

    // 4. Envoi personnalisé selon le parcours de chaque invité (Journée vs Repas du soir)
    for (const guest of batchToSend) {
      const isJournee = guest.parcours === 'journee';
      const steps =
        (activeSchedule && activeSchedule[guest.parcours]) ||
        guest.scheduleSnapshot ||
        (isJournee
          ? [
              { time: '14h30', title: 'Accueil des Invités' },
              { time: '15h00', title: 'Cérémonie' },
              { time: '16h30', title: 'Vin d’honneur & Cocktail' },
              { time: '19h00', title: 'Dîner & Festivités' },
              { time: '22h30', title: 'Ouverture du Bal & Soirée' }
            ]
          : [
              { time: '19h00', title: 'Accueil & Dîner de Mariage' },
              { time: '21h30', title: 'Pièce Montée & Animations' },
              { time: '22h30', title: 'Ouverture du Bal & Soirée' }
            ]);

      const heureArrivee = steps[0]?.time || (isJournee ? '14h30' : '19h00');
      const programmeHtml = steps
        .map((s) => `<strong>${s.time} :</strong> ${s.title}${s.subtitle ? ` — <em>${s.subtitle}</em>` : ''}`)
        .join('<br/>');

      const totalPersonnes = 1 + (Number(guest.accompagnants) || 0);
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        'Mariage de Lisa & Nathan'
      )}&dates=${getUtcStart(heureArrivee, isJournee)}/20270502T010000Z&details=${encodeURIComponent(
        `Mariage de Lisa & Nathan — Rendez-vous dès ${heureArrivee}. Dress code : Palette Coucher de Soleil.`
      )}&location=${encodeURIComponent(
        'Domaine du Moulin al Poudre, Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert, Belgique'
      )}`;

      try {
        await resend.emails.send({
          from: 'Lisa & Nathan <contact@lisaetnathan.site>',
          to: [guest.email],
          subject: 'J-7 — Le mariage de Lisa & Nathan approche !',
          html: `
            <div style="background-color: #ffffff; padding: 24px 12px; font-family: Georgia, 'Times New Roman', serif; color: #1c1917;">
              <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 20px; padding: 36px 28px;">
                
                <h1 style="font-size: 24px; font-weight: normal; color: #111111; margin-top: 0; margin-bottom: 18px;">
                  Bonjour ${guest.prenom} ${guest.nom},
                </h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #292524; margin-bottom: 28px;">
                  Plus qu’une petite semaine avant le grand jour ! Nous avons terriblement hâte de vous retrouver le <strong>samedi 1er mai 2027</strong> pour célébrer notre mariage. Voici votre récapitulatif pratique :
                </p>

                <!-- Encadré Horaire personnalisé -->
                <div style="border: 1px solid #ece8e1; border-radius: 14px; padding: 26px 20px; text-align: center; margin-bottom: 28px; background-color: #fdfcfb;">
                  <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #57534e; margin-bottom: 12px;">
                    VOTRE HEURE D’ARRIVÉE
                  </div>
                  <div style="font-size: 38px; font-weight: bold; color: #b8862d; margin-bottom: 10px;">
                    Dès ${heureArrivee}
                  </div>
                  <div style="font-size: 15px; color: #292524;">
                    Présence confirmée pour <strong>${totalPersonnes} ${totalPersonnes > 1 ? 'personnes' : 'personne'}</strong>
                  </div>
                </div>

                <!-- Boutons Itinéraire & Agenda -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #14171f; color: #e5b95c; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 13px; padding: 13px 22px; border-radius: 10px; border: 1.5px solid #b8862d; margin: 4px;">
                    Itinéraire Google Maps
                  </a>
                  <a href="${wazeUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #1c1917; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 13px; padding: 13px 22px; border-radius: 10px; border: 1.5px solid #d6d3d1; margin: 4px;">
                    Ouvrir dans Waze
                  </a>
                  <br/>
                  <a href="${googleCalUrl}" target="_blank" style="display: inline-block; color: #b8862d; text-decoration: underline; font-family: Arial, sans-serif; font-size: 12px; margin-top: 12px;">
                    + Ajouter à mon Google Agenda
                  </a>
                </div>

                <!-- Programme dynamique -->
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                  VOTRE PROGRAMME DU 1ER MAI
                </div>
                <p style="font-size: 15px; line-height: 1.75; color: #1c1917; margin-top: 0; margin-bottom: 22px;">
                  ${programmeHtml}
                </p>

                <!-- Lieu & Dress Code -->
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; letter-spacing: 2.5px; text-transform: uppercase; color: #b8862d; margin-bottom: 8px;">
                  ADRESSE &amp; DRESS CODE
                </div>
                <p style="font-size: 15px; line-height: 1.65; color: #1c1917; margin-top: 0; margin-bottom: 22px;">
                  <strong>Domaine du Moulin al Poudre</strong><br/>
                  Chemin du Moulin al Poudre 2, 1435 Mont-Saint-Guibert<br/>
                  <strong>Dress code :</strong> Palette Coucher de Soleil (une touche ou tenue complète du jaune doré à l’orange couchant).
                </p>

                <p style="font-size: 14px; font-style: italic; color: #57534e; margin-top: 28px; margin-bottom: 24px;">
                  À samedi prochain ! Avec toute notre affection, Lisa &amp; Nathan.
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

        sentIds.add(guest.id);
        sentCount++;
      } catch (err) {
        console.error(`Erreur envoi rappel à ${guest.email}:`, err);
      }
    }

    // 5. Sauvegarder dans Redis que ces invités ont bien reçu leur rappel (reminderSent: true)
    const updatedAllRsvps = allRsvps.map((r) =>
      sentIds.has(r.id)
        ? { ...r, reminderSent: true, reminderSentAt: new Date().toISOString() }
        : r
    );

    await kvCommand(['DEL', 'rsvps_lisa_nathan']);
    for (let i = updatedAllRsvps.length - 1; i >= 0; i--) {
      await kvCommand(['LPUSH', 'rsvps_lisa_nathan', JSON.stringify(updatedAllRsvps[i])]);
    }

    const remainingCount = pendingGuests.length - sentCount;

    return res.status(200).json({
      success: true,
      sentCount,
      remainingCount,
      message: `${sentCount} e-mail(s) de rappel envoyé(s) aujourd'hui. Il reste ${remainingCount} invité(s) à notifier sur les prochains jours.`
    });
  } catch (error) {
    console.error('Erreur globale API send-reminders:', error);
    return res.status(500).json({ error: error.message });
  }
}
