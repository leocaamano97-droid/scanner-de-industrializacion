// Envío de correos. Se configura con variables de entorno en Netlify (usar UNA opción):
//  A) Brevo:  BREVO_API_KEY
//  B) Resend: RESEND_API_KEY
//  C) SMTP (ej. Gmail/Google Workspace con contraseña de aplicación): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Además: MAIL_FROM (ej: "Scanner de Industrialización <productividad@cchc.cl>"), MAIL_REPLY_TO, MAIL_BCC (opcional)
import nodemailer from 'nodemailer';

const env = k => (typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env.get(k) : process.env[k]) || '';

function remitente() {
  const from = env('MAIL_FROM') || 'Scanner de Industrialización <productividad@cchc.cl>';
  const m = from.match(/^(.*)<(.+)>$/);
  return m ? { name: m[1].trim().replace(/^"|"$/g, ''), email: m[2].trim() } : { name: '', email: from.trim() };
}

export const correoConfigurado = () => !!(env('BREVO_API_KEY') || env('RESEND_API_KEY') || env('SMTP_HOST'));

export async function enviarCorreo({ para, asunto, html, texto, adjunto }) {
  const de = remitente(), replyTo = env('MAIL_REPLY_TO') || 'productividad@cchc.cl', bcc = env('MAIL_BCC');
  if (env('BREVO_API_KEY')) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: { 'api-key': env('BREVO_API_KEY'), 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: de, to: para.map(email => ({ email })), bcc: bcc ? [{ email: bcc }] : undefined, replyTo: { email: replyTo },
        subject: asunto, htmlContent: html, textContent: texto,
        attachment: adjunto ? [{ name: adjunto.nombre, content: Buffer.from(adjunto.datos).toString('base64') }] : undefined }),
    });
    if (!r.ok) throw new Error('Brevo: ' + r.status + ' ' + (await r.text()).slice(0, 300));
    return;
  }
  if (env('RESEND_API_KEY')) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: 'Bearer ' + env('RESEND_API_KEY'), 'content-type': 'application/json' },
      body: JSON.stringify({ from: de.name ? `${de.name} <${de.email}>` : de.email, to: para, bcc: bcc || undefined, reply_to: replyTo,
        subject: asunto, html, text: texto,
        attachments: adjunto ? [{ filename: adjunto.nombre, content: Buffer.from(adjunto.datos).toString('base64') }] : undefined }),
    });
    if (!r.ok) throw new Error('Resend: ' + r.status + ' ' + (await r.text()).slice(0, 300));
    return;
  }
  if (env('SMTP_HOST')) {
    const port = +(env('SMTP_PORT') || 465);
    const t = nodemailer.createTransport({ host: env('SMTP_HOST'), port, secure: port === 465,
      auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined });
    await t.sendMail({ from: { name: de.name, address: de.email }, to: para.join(','), bcc: bcc || undefined, replyTo, subject: asunto, html, text: texto,
      attachments: adjunto ? [{ filename: adjunto.nombre, content: Buffer.from(adjunto.datos), contentType: 'application/pdf' }] : undefined });
    return;
  }
  throw new Error('El envío de correos aún no está configurado (faltan variables de entorno).');
}
