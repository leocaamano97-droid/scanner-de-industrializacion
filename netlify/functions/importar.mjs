// POST /api/importar (encabezado x-clave)  {registros: [...]}  → importa respuestas del formulario de Google anterior
import { createHash, randomBytes } from 'node:crypto';
import { evaluar, resumen, PREGUNTAS, ROLES } from '../../lib/scanner.mjs';
import { importarRegistros } from '../../lib/db.mjs';
import { json } from '../../lib/servicio.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  if (!process.env.ADMIN_CLAVE || req.headers.get('x-clave') !== process.env.ADMIN_CLAVE) return json({ error: 'Clave incorrecta' }, 401);
  let b; try { b = await req.json(); } catch { return json({ error: 'Archivo no válido' }, 400); }
  const entrada = Array.isArray(b.registros) ? b.registros.slice(0, 200) : [];
  const regs = [];
  for (const x of entrada) {
    const d = x.datos || {};
    if (!d.empresa || !d.respuestas) continue;
    const respuestas = {};
    for (const q of PREGUNTAS) {
      const v = d.respuestas[q.id];
      respuestas[q.id] = q.roles ? (Array.isArray(v) ? ROLES.filter(r => v.includes(r)) : []) : (['a', 'b', 'c', 'd', 'e'].includes(v) ? v : null);
    }
    const datos = { ...d, empresa: String(d.empresa).trim().slice(0, 120), email: String(d.email || '').trim(), respuestas };
    const id = 'gf-' + createHash('sha1').update(String(x.fecha) + '|' + datos.empresa + '|' + datos.email).digest('hex').slice(0, 14);
    regs.push({ id, token: randomBytes(12).toString('hex'), fecha: new Date(x.fecha).toISOString(), origen: 'Formulario Google', datos,
      resultado: resumen(evaluar(datos)), envios: [], consentimiento: { acepta: null, nota: 'Respondido en el formulario de Google anterior' } });
  }
  const agregados = await importarRegistros(regs);
  return json({ ok: true, recibidos: entrada.length, agregados, omitidos: regs.length - agregados });
};
export const config = { path: '/api/importar' };
