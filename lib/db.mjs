// "Base de datos" del scanner: Netlify Blobs (almacenamiento incluido en Netlify, sin cuentas externas).
// - respuestas/<id>  : cada respuesta completa (datos, respuestas, resultado, token de descarga)
// - indice           : lista liviana de resultados para calcular promedios de comparación
import { getStore } from '@netlify/blobs';
import { HISTORICO } from './historico.mjs';

const store = () => getStore({ name: 'scanner-industrializacion', consistency: 'strong' });

export async function guardarRespuesta(reg) {
  const s = store();
  await s.setJSON('respuestas/' + reg.id, reg);
  const indice = (await s.get('indice', { type: 'json' })) || [];
  indice.push({ id: reg.id, fecha: reg.fecha, global: reg.resultado.global, amb: reg.resultado.amb,
    macrozona: reg.resultado.macrozona, tamano: reg.resultado.tamano });
  await s.setJSON('indice', indice);
}

export const leerRespuesta = id => (/^[a-z0-9-]{8,40}$/.test(id) ? store().get('respuestas/' + id, { type: 'json' }) : null);
export const actualizarRespuesta = reg => store().setJSON('respuestas/' + reg.id, reg);

/** Base de comparación: respuestas históricas (Google Forms) + respuestas nuevas. */
export async function baseComparacion() {
  const indice = (await store().get('indice', { type: 'json' })) || [];
  return HISTORICO.concat(indice);
}

export async function todasLasRespuestas() {
  const s = store();
  const { blobs } = await s.list({ prefix: 'respuestas/' });
  const out = [];
  for (let i = 0; i < blobs.length; i += 20) {
    const lote = await Promise.all(blobs.slice(i, i + 20).map(b => s.get(b.key, { type: 'json' })));
    out.push(...lote.filter(Boolean));
  }
  return out.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}
