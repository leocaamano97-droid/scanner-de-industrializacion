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

/** Base de comparación. Si ya se importaron las respuestas del formulario anterior, están en el índice;
 *  si no, se suman los puntajes históricos guardados en el código. */
export async function baseComparacion() {
  const s = store();
  const indice = (await s.get('indice', { type: 'json' })) || [];
  const conf = (await s.get('config', { type: 'json' })) || {};
  return conf.importado ? indice : HISTORICO.concat(indice);
}

/** Importa respuestas del formulario anterior (omite las que ya existan). Devuelve cuántas se agregaron. */
export async function importarRegistros(regs) {
  const s = store();
  const nuevos = [];
  for (let i = 0; i < regs.length; i += 10) {
    const lote = regs.slice(i, i + 10);
    const existe = await Promise.all(lote.map(r => s.getMetadata('respuestas/' + r.id)));
    const agregar = lote.filter((r, j) => !existe[j]);
    await Promise.all(agregar.map(r => s.setJSON('respuestas/' + r.id, r)));
    nuevos.push(...agregar);
  }
  const indice = (await s.get('indice', { type: 'json' })) || [];
  const ids = new Set(indice.map(x => x.id));
  for (const r of nuevos) if (!ids.has(r.id)) indice.push({ id: r.id, fecha: r.fecha, global: r.resultado.global, amb: r.resultado.amb, macrozona: r.resultado.macrozona, tamano: r.resultado.tamano });
  await s.setJSON('indice', indice);
  await s.setJSON('config', { importado: true, fechaImportacion: new Date().toISOString() });
  return nuevos.length;
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
