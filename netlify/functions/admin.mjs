// GET /api/admin  (encabezado x-clave = ADMIN_CLAVE)  → lista de respuestas;  ?formato=csv → planilla CSV
import { PREGUNTAS, AMBITOS, evaluar, nivel } from '../../lib/scanner.mjs';
import { todasLasRespuestas } from '../../lib/db.mjs';
import { json } from '../../lib/servicio.mjs';
import { correoConfigurado } from '../../lib/mail.mjs';

export default async (req) => {
  const u = new URL(req.url);
  const clave = req.headers.get('x-clave') || u.searchParams.get('clave');
  if (!process.env.ADMIN_CLAVE) return json({ error: 'Falta configurar ADMIN_CLAVE en Netlify' }, 500);
  if (clave !== process.env.ADMIN_CLAVE) return json({ error: 'Clave incorrecta' }, 401);
  const regs = await todasLasRespuestas();
  if (u.searchParams.get('formato') === 'csv') {
    const cab = ['Fecha', 'Empresa', 'Correo', 'Región', 'Macrozona', 'Personas', 'Tamaño', 'Cargo', 'Experiencia', 'Cobertura', 'Facturación', 'Utilidad', 'Primera vez', 'Socia',
      ...PREGUNTAS.map(q => q.id + ' ' + q.corto), 'Global', ...AMBITOS.map(a => a.nombre), 'Nivel global', 'Correos enviados', 'ID'];
    const filas = regs.map(r => {
      const ev = evaluar(r.datos), d = r.datos;
      return [r.fecha, d.empresa, d.email, d.region, ev.macrozona, d.personas, ev.tamano, d.cargo, d.experiencia, d.cobertura, d.facturacion, d.utilidad, d.primera, d.socia,
        ...PREGUNTAS.map(q => q.roles ? (d.respuestas[q.id] || []).join(', ') : d.respuestas[q.id]),
        ev.global, ...AMBITOS.map(a => ev.amb[a.k]), nivel(ev.global), (r.envios || []).filter(e => e.ok).length, r.id];
    });
    const csv = '﻿' + [cab, ...filas].map(f => f.map(x => {
      const s = typeof x === 'number' ? String(Math.round(x * 1000) / 1000).replace('.', ',') : String(x ?? '');
      return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(';')).join('\r\n');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="respuestas-scanner-industrializacion.csv"' } });
  }
  return json({
    correo: correoConfigurado(),
    respuestas: regs.map(r => {
      const ev = evaluar(r.datos);
      return { id: r.id, t: r.token, fecha: r.fecha, empresa: r.datos.empresa, email: r.datos.email, region: r.datos.region, tamano: ev.tamano,
        global: Math.round(ev.global * 100), nivel: nivel(ev.global), envios: (r.envios || []).filter(e => e.ok).length,
        ultimoError: (r.envios || []).filter(e => !e.ok).slice(-1)[0]?.error || '' };
    }),
  });
};
export const config = { path: '/api/admin' };
