// POST /api/responder  → guarda la respuesta, calcula el resultado y (opcional) envía el informe por correo
import { randomBytes } from 'node:crypto';
import { validar, evaluar, comparar, resumen } from '../../lib/scanner.mjs';
import { guardarRespuesta, baseComparacion } from '../../lib/db.mjs';
import { json, resultadoPantalla, enviarInforme, correosValidos, sitioDe } from '../../lib/servicio.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  if (body.web) return json({ error: 'Rechazado' }, 400); // campo trampa anti-spam
  const v = validar(body);
  if (!v.ok) return json({ error: 'Faltan respuestas: ' + v.errores.join(', ') }, 400);
  const ev = evaluar(v.r);
  const comp = comparar(ev, await baseComparacion());
  const reg = {
    id: Date.now().toString(36) + '-' + randomBytes(4).toString('hex'),
    token: randomBytes(12).toString('hex'),
    fecha: new Date().toISOString(),
    datos: v.r,
    resultado: resumen(ev),
    envios: [],
    consentimiento: { acepta: true, fecha: new Date().toISOString() },
  };
  await guardarRespuesta(reg);
  let correo = null;
  const para = correosValidos(v.r.email);
  if (body.enviarCorreo && para.length) {
    try { await enviarInforme(reg, para, sitioDe(req)); reg.envios.push({ fecha: new Date().toISOString(), para, ok: true }); correo = { ok: true, para }; }
    catch (e) { reg.envios.push({ fecha: new Date().toISOString(), para, ok: false, error: String(e.message) }); correo = { ok: false, error: /no está configurado/.test(String(e.message)) ? 'El envío por correo aún no está activado. Por ahora descarga tu informe con el botón de abajo.' : 'No pudimos enviar el correo ahora. Puedes descargar el informe o intentarlo de nuevo.' }; }
    const { actualizarRespuesta } = await import('../../lib/db.mjs'); await actualizarRespuesta(reg);
  }
  return json({ id: reg.id, t: reg.token, empresa: v.r.empresa, email: v.r.email, resultado: resultadoPantalla(ev, comp), correo });
};
export const config = { path: '/api/responder' };
