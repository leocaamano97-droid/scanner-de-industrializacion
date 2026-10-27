// Funciones compartidas por las rutas /api/*
import { AMBITOS, evaluar, comparar, pct, nivel } from './scanner.mjs';
import { baseComparacion } from './db.mjs';
import { generarInformePdf } from './pdf.mjs';
import { enviarCorreo } from './mail.mjs';

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export const limpiarNombre = s => String(s || 'Empresa').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 60);
export const nombrePdf = reg => 'Informe Scanner de Industrialización - ' + limpiarNombre(reg.datos.empresa) + '.pdf';
export const correosValidos = txt => [...new Set(String(txt || '').split(/[,;\s]+/).map(x => x.trim().toLowerCase()).filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)))].slice(0, 5);

export async function informeDe(reg) {
  const ev = evaluar(reg.datos);
  const comp = comparar(ev, await baseComparacion());
  return { ev, comp, pdf: await generarInformePdf({ empresa: reg.datos.empresa, ev, comp }) };
}

/** Resultado para mostrar en pantalla. */
export function resultadoPantalla(ev, comp) {
  const r = x => (x == null ? null : Math.round(x * 100));
  return {
    global: r(ev.global), nivel: nivel(ev.global), macrozona: ev.macrozona, tamano: ev.tamano,
    ambitos: AMBITOS.map(a => ({ k: a.k, nombre: a.nombre, valor: r(ev.amb[a.k]), nivel: nivel(ev.amb[a.k]),
      nacional: r(comp.nacional.amb[a.k]), macrozona: comp.macrozona.n ? r(comp.macrozona.amb[a.k]) : null })),
    comparacion: { nacional: r(comp.nacional.global), macrozona: comp.macrozona.n ? r(comp.macrozona.global) : null,
      tamano: comp.tamanoNacional.n ? r(comp.tamanoNacional.global) : null, n: comp.nacional.n },
  };
}

export async function enviarInforme(reg, para, sitio) {
  const { ev, pdf } = await informeDe(reg);
  const filas = AMBITOS.map(a => `<tr><td style="padding:4px 14px 4px 0">${a.nombre}</td><td><b>${pct(ev.amb[a.k])}</b> ${nivel(ev.amb[a.k])}</td></tr>`).join('');
  const enlace = `${sitio}/?id=${reg.id}&t=${reg.token}`;
  const html = `<div style="font-family:Arial,sans-serif;color:#1F2A37;font-size:14px;max-width:560px">
    <p>Estimado socio:</p>
    <p>Gracias por responder el <b>Scanner de Industrialización</b>. Adjuntamos el informe de resultados de <b>${esc(reg.datos.empresa)}</b>.</p>
    <p style="font-size:16px">Nivel global: <b style="color:#0B6CF2">${pct(ev.global)} (${nivel(ev.global)})</b></p>
    <table style="border-collapse:collapse">${filas}</table>
    <p style="margin:22px 0"><a href="${enlace}" style="background:#0B6CF2;color:#fff;padding:11px 18px;text-decoration:none;border-radius:6px">Ver resultados y descargar informe</a></p>
    <p style="color:#5B6B7F;font-size:12px">Cualquier duda o consulta: Equipo Productividad CDT-CChC · productividad@cchc.cl</p></div>`;
  await enviarCorreo({ para, asunto: 'Informe Scanner de Industrialización – ' + reg.datos.empresa, html,
    texto: `Gracias por responder el Scanner de Industrialización. Nivel global de ${reg.datos.empresa}: ${pct(ev.global)}. El informe va adjunto. También puedes verlo en: ${enlace}`,
    adjunto: { nombre: nombrePdf(reg), datos: pdf } });
}

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const sitioDe = req => (process.env.URL_SITIO || new URL(req.url).origin).replace(/\/$/, '');
