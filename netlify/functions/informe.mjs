// GET /api/informe?id=..&t=..  → descarga el PDF del informe
import { leerRespuesta } from '../../lib/db.mjs';
import { json, informeDe, nombrePdf } from '../../lib/servicio.mjs';

export default async (req) => {
  const u = new URL(req.url);
  const reg = await leerRespuesta(u.searchParams.get('id') || '');
  const claveAdmin = process.env.ADMIN_CLAVE && u.searchParams.get('admin') === process.env.ADMIN_CLAVE;
  if (!reg || (reg.token !== u.searchParams.get('t') && !claveAdmin)) return json({ error: 'No encontramos este informe' }, 404);
  const { pdf } = await informeDe(reg);
  return new Response(pdf, { headers: { 'content-type': 'application/pdf',
    'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(nombrePdf(reg))}`, 'cache-control': 'no-store' } });
};
export const config = { path: '/api/informe' };
