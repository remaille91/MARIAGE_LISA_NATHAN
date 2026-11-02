import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prenom, nom, email, presence, parcours, accompagnantsCount, accompagnants, motDoux } = req.body;

  try {
    const listAccompagnants = accompagnants && accompagnants.length > 0
      ? accompagnants.map(a => `${a.prenom} ${a.nom}`).filter(Boolean).join(', ')
      : 'Aucun';

    // 1. E-mail de confirmation envoyé à l'invité
    await resend.emails.send({
      from: 'Lisa & Nathan <contact@lisaetnathan.site>',
      to: [email],
      subject: presence 
        ? 'Confirmation de présence — Mariage de Lisa & Nathan' 
        : 'Mariage de Lisa & Nathan — Merci pour votre réponse',
      html: `
        <div style="font-family: sans-serif; background-color: #1F100B; color: #FFF9F2; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F5B041; font-size: 24px; text-align: center; margin-bottom: 24px;">Lisa & Nathan</h1>
          <p style="font-size: 16px;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6;">
            ${presence 
              ? 'Nous avons bien enregistré votre confirmation de présence pour notre mariage le <strong>1er Mai 2027</strong> à Mont-Saint-Guibert !' 
              : 'Nous avons bien noté que vous ne pourrez malheureusement pas être présent à notre mariage. Nous penserons bien à vous !'}
          </p>

          ${presence ? `
            <div style="background-color: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(245, 176, 65, 0.3);">
              <h3 style="color: #F5B041; margin-top: 0;">Récapitulatif :</h3>
              <ul style="list-style: none; padding-left: 0; font-size: 14px; line-height: 1.8;">
                <li><strong>Programme :</strong> ${parcours === 'journee' ? 'Journée & Cérémonie dès 14h30' : 'Repas du soir dès 19h00'}</li>
                <li><strong>Nombre d’accompagnants :</strong> ${accompagnantsCount}</li>
                ${accompagnantsCount > 0 ? `<li><strong>Accompagnant(s) :</strong> ${listAccompagnants}</li>` : ''}
              </ul>
            </div>
          ` : ''}

          ${motDoux ? `
            <p style="font-size: 14px; font-style: italic; color: #FAF8F5; border-left: 3px solid #F5B041; padding-left: 12px;">
              « ${motDoux} »
            </p>
          ` : ''}

          <p style="font-size: 13px; color: rgba(255, 255, 255, 0.6); text-align: center; margin-top: 32px;">
            À très bientôt,<br/>
            <strong>Lisa & Nathan</strong>
          </p>
        </div>
      `
    });

    // 2. Notification envoyée sur votre boîte outlook.be
    await resend.emails.send({
      from: 'Site Mariage <contact@lisaetnathan.site>',
      to: ['lisa.safique@outlook.be'],
      subject: `🔔 Nouveau RSVP : ${prenom} ${nom} (${presence ? 'Présent' : 'Absent'})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Nouvelle réponse RSVP reçue !</h2>
          <p><strong>Nom :</strong> ${prenom} ${nom}</p>
          <p><strong>Email de l'invité :</strong> ${email}</p>
          <p><strong>Statut :</strong> ${presence ? 'Présent' : 'Absent'}</p>
          <p><strong>Parcours :</strong> ${parcours === 'journee' ? 'Journée & Cérémonie' : 'Repas du soir'}</p>
          <p><strong>Accompagnants (${accompagnantsCount}) :</strong> ${listAccompagnants}</p>
          ${motDoux ? `<p><strong>Mot doux :</strong> « ${motDoux} »</p>` : ''}
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur Resend:', error);
    return res.status(500).json({ error: error.message });
  }
}
