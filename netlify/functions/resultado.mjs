// GET /api/resultado?id=..&t=..  → resultado para mostrar en pantalla (enlace del correo)
import { evaluar, comparar } from '../../lib/scanner.mjs';
import { leerRespuesta, baseComparacion } from '../../lib/db.mjs';
import { json, resultadoPantalla } from '../../lib/servicio.mjs';

export default async (req) => {
  const u = new URL(req.url);
  const reg = await leerRespuesta(u.searchParams.get('id') || '');
  if (!reg || reg.token !== u.searchParams.get('t')) return json({ error: 'No encontramos este informe' }, 404);
  const ev = evaluar(reg.datos);
  return json({ id: reg.id, t: reg.token, empresa: reg.datos.empresa, email: reg.datos.email, resultado: resultadoPantalla(ev, comparar(ev, await baseComparacion())) });
};
export const config = { path: '/api/resultado' };
