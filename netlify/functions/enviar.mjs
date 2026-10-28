// POST /api/enviar {id, t, para}  → envía el informe en PDF a uno o más correos
import { leerRespuesta, actualizarRespuesta } from '../../lib/db.mjs';
import { json, enviarInforme, correosValidos, sitioDe } from '../../lib/servicio.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  const reg = await leerRespuesta(String(b.id || ''));
  const admin = process.env.ADMIN_CLAVE && b.admin === process.env.ADMIN_CLAVE;
  if (!reg || (reg.token !== b.t && !admin)) return json({ error: 'No encontramos este informe' }, 404);
  const para = correosValidos(b.para);
  if (!para.length) return json({ error: 'Escribe al menos un correo válido' }, 400);
  if (!admin && (reg.envios || []).filter(e => e.ok).length >= 10) return json({ error: 'Se alcanzó el máximo de envíos para este informe' }, 429);
  reg.envios = reg.envios || [];
  try {
    await enviarInforme(reg, para, sitioDe(req));
    reg.envios.push({ fecha: new Date().toISOString(), para, ok: true, admin: !!admin });
    await actualizarRespuesta(reg);
    return json({ ok: true, para });
  } catch (e) {
    reg.envios.push({ fecha: new Date().toISOString(), para, ok: false, error: String(e.message) });
    await actualizarRespuesta(reg);
    const sinConfig = /no está configurado/.test(String(e.message));
    return json({ error: admin || sinConfig ? (sinConfig ? 'El envío por correo aún no está activado en la plataforma. Por ahora descarga el informe con el botón de arriba.' : String(e.message)) : 'No pudimos enviar el correo. Intenta de nuevo en unos minutos o descarga el informe.' }, 502);
  }
};
export const config = { path: '/api/enviar' };
