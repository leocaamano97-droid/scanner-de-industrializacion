// Genera el PDF del informe con el diseño original del Scanner de Industrialización.
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { A } from './assets.mjs';
import { AMBITOS, pct, nivel, recomendacion, PLURAL_TAMANO } from './scanner.mjs';

const W = 595.28, H = 841.89, IN = 72;
const hex = h => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
const BLUE = hex('0B6CF2'), RED = hex('E30613'), GREEN = hex('1E8A4C'), ORANGE = hex('E08A00'), TXT = hex('1F1F1F'), GREY = hex('333333'), MUTED = hex('6B7280'), WHITE = rgb(1, 1, 1);
const COLOR_NIVEL = { BAJO: RED, MEDIO: ORANGE, ALTO: GREEN };
const b64 = s => Uint8Array.from(Buffer.from(s, 'base64'));

export const CONTACTO = ['Cualquier duda o consulta favor dirigirla a:', 'Equipo Productividad CDT-CChC', 'productividad@cchc.cl'];

export async function generarInformePdf({ empresa, ev, comp }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle('Informe Scanner de Industrialización - ' + empresa);
  doc.setAuthor('CDT - CChC');
  const f = {
    r: await doc.embedFont(b64(A.poppins400)),
    m: await doc.embedFont(b64(A.poppins600)),
    b: await doc.embedFont(b64(A.poppins700)),
  };
  const img = {};
  for (const k of ['pag1', 'pag2', 'pag6']) img[k] = await doc.embedJpg(b64(A[k]));
  for (const k of ['icon_ce', 'icon_ha', 'icon_ro', 'icon_in', 'dial', 'aguja']) img[k] = await doc.embedPng(b64(A[k]));
  const ICON = { CE: img.icon_ce, HA: img.icon_ha, RO: img.icon_ro, IN: img.icon_in };

  // --- utilidades de dibujo (coordenadas en pulgadas desde arriba a la izquierda) ---
  let pg;
  const R = (x, y, w, h, o = {}) => pg.drawRectangle({ x: x * IN, y: H - (y + h) * IN, width: w * IN, height: h * IN,
    color: o.fill, borderColor: o.border, borderWidth: o.border ? (o.bw || 0.75) : 0 });
  const L = (x1, y1, x2, y2, color = BLUE, t = 0.75) => pg.drawLine({ start: { x: x1 * IN, y: H - y1 * IN }, end: { x: x2 * IN, y: H - y2 * IN }, thickness: t, color });
  const ajustar = (s, font, size, w) => { s = String(s); while (s.length > 1 && font.widthOfTextAtSize(s, size) > w * IN) s = s.slice(0, -1); return s; };
  function T(s, x, y, w, h, o = {}) {
    const font = o.font || f.r, size = o.size || 10, color = o.color || TXT;
    const lineas = o.wrap ? envolver(String(s), font, size, w) : [ajustar(s, font, size, w)];
    const lh = size * (o.lh || 1.25);
    const alto = lineas.length * lh;
    let top = y * IN + (o.valign === 'middle' ? (h * IN - alto) / 2 : o.valign === 'bottom' ? h * IN - alto : 0);
    lineas.forEach((ln, i) => {
      const tw = font.widthOfTextAtSize(ln, size);
      const px = o.align === 'center' ? x * IN + (w * IN - tw) / 2 : o.align === 'right' ? (x + w) * IN - tw : x * IN;
      pg.drawText(ln, { x: px, y: H - top - i * lh - size * 0.95, size, font, color });
    });
    return lineas.length * lh / IN;
  }
  function envolver(s, font, size, w) {
    const out = [];
    for (const par of s.split('\n')) {
      let cur = '';
      for (const word of par.split(' ')) {
        const t = cur ? cur + ' ' + word : word;
        if (font.widthOfTextAtSize(t, size) > w * IN && cur) { out.push(cur); cur = word; } else cur = t;
      }
      out.push(cur);
    }
    return out;
  }
  function delta(a, b, x, y, w) {
    if (a == null || b == null || isNaN(b)) return;
    const d = Math.round(a * 100) - Math.round(b * 100);
    const txt = d > 0 ? '+' + d + '%' : d < 0 ? d + '%' : '0%';
    const color = d > 0 ? GREEN : d < 0 ? RED : MUTED, size = 10;
    const tw = f.r.widthOfTextAtSize(txt, size) + 12;
    const x0 = x * IN + (w * IN - tw) / 2, yb = H - y * IN - 9;
    if (d !== 0) pg.drawSvgPath(d > 0 ? 'M 0 7 L 7 7 L 3.5 0 Z' : 'M 0 0 L 7 0 L 3.5 7 Z', { x: x0, y: yb + 8, color });
    pg.drawText(txt, { x: x0 + 12, y: yb, size, font: f.r, color });
  }
  const nueva = () => (pg = doc.addPage([W, H]));
  const fondo = im => pg.drawImage(im, { x: 0, y: 0, width: W, height: H });

  // 1 · Portada
  nueva(); fondo(img.pag1);
  // 2 · Presentación (contacto actualizado)
  nueva(); fondo(img.pag2);
  R(1.22, 8.53, 5.34, 0.95, { fill: hex('F2F2F2') });
  T(CONTACTO[0], 1.4, 8.66, 5.0, 0.2, { font: f.m, size: 9.5, align: 'right' });
  T(CONTACTO[1], 1.4, 8.92, 5.0, 0.2, { size: 9.5, align: 'right' });
  T(CONTACTO[2], 1.4, 9.18, 5.0, 0.2, { size: 9.5, align: 'right' });

  // 3 · Resultados
  nueva();
  R(0.69, 1.6, 6.39, 0.43, { fill: BLUE });
  T(empresa.toUpperCase(), 0.8, 1.6, 6.17, 0.43, { font: f.b, size: 15, color: WHITE, align: 'center', valign: 'middle' });
  if (ev.tamano) T('Empresa ' + ev.tamano, 0.69, 2.12, 6.39, 0.3, { font: f.b, size: 10.5, align: 'center' });
  R(1.2, 3.3, 2.3, 2.3, { border: BLUE });
  pg.drawImage(img.dial, { x: 1.3 * IN, y: H - 5.5 * IN, width: 2.1 * IN, height: 2.1 * IN });
  { // aguja: gira en torno al centro del dial
    const ang = (Math.max(0, Math.min(1, ev.global ?? 0)) - 0.5) * 270; // horario
    const th = -ang * Math.PI / 180, s = 2.1 * IN, cx = 2.35 * IN, cy = H - 4.45 * IN;
    pg.drawImage(img.aguja, { x: cx - s / 2 * (Math.cos(th) - Math.sin(th)), y: cy - s / 2 * (Math.sin(th) + Math.cos(th)), width: s, height: s, rotate: degrees(-ang) });
  }
  T(pct(ev.global), 1.3, 4.88, 2.1, 0.3, { font: f.b, size: 13, align: 'center' });
  R(3.86, 3.3, 3.22, 0.4, { fill: BLUE });
  T('ÁMBITO', 3.93, 3.3, 2, 0.4, { font: f.b, size: 9, color: WHITE, valign: 'middle' });
  T('PORCENTAJE', 5.9, 3.3, 1.1, 0.4, { font: f.b, size: 9, color: WHITE, valign: 'middle', align: 'right' });
  const NOMBRES = { CE: 'CONCEPTUALIZACIÓN Y ESTRATEGIA', HA: 'HABILITANTES', RO: 'ROLES', IN: 'INTEGRACIÓN TEMPRANA Y COLABORACIÓN' };
  AMBITOS.forEach((a, i) => {
    const y = 3.78 + i * 0.47;
    T(NOMBRES[a.k], 3.93, y, 2.2, 0.42, { size: 8.5, valign: 'middle', wrap: true, lh: 1.15 });
    T(pct(ev.amb[a.k]), 6.16, y, 0.85, 0.42, { font: f.b, size: 9, valign: 'middle', align: 'right' });
  });
  const mzNombre = (ev.macrozona || 'Macrozona').toUpperCase();
  function bloque(y, titulo, nac, mz) {
    R(0.69, y, 6.39, 0.22, { fill: BLUE });
    T(titulo, 0.69, y, 6.39, 0.22, { font: f.b, size: 8, color: WHITE, align: 'center', valign: 'middle' });
    [[0.69, 'EMPRESA'], [2.82, 'NACIONAL'], [4.95, mzNombre]].forEach(([x, l]) => T(l, x, y + 0.27, 2.13, 0.22, { font: f.b, size: 8, color: BLUE, align: 'center' }));
    T(pct(ev.global), 0.69, y + 0.55, 2.13, 0.9, { size: 40, align: 'center', valign: 'middle' });
    T(nac.n ? pct(nac.global) : '–', 2.82, y + 0.5, 2.13, 0.55, { size: 28, align: 'center', valign: 'middle' });
    if (nac.n) delta(ev.global, nac.global, 2.82, y + 1.1, 2.13);
    T(mz.n ? pct(mz.global) : '–', 4.95, y + 0.5, 2.13, 0.55, { size: 28, align: 'center', valign: 'middle' });
    if (mz.n) delta(ev.global, mz.global, 4.95, y + 1.1, 2.13);
  }
  bloque(6.85, 'EMPRESAS ESCANEADAS', comp.nacional, comp.macrozona);
  bloque(8.45, ev.tamano ? 'EMPRESAS ' + PLURAL_TAMANO[ev.tamano] + ' ESCANEADAS' : 'EMPRESAS DE TU TAMAÑO ESCANEADAS', comp.tamanoNacional, comp.tamanoMacrozona);

  const titulo = t => { T(t, 0.87, 1.15, 5, 0.4, { font: f.b, size: 15, color: hex('111111') }); R(0.69, 1.58, 3.2, 0.04, { fill: RED }); };

  // 4 · Análisis por ámbitos
  nueva(); titulo('ANÁLISIS POR ÁMBITOS');
  AMBITOS.forEach((a, i) => {
    const y = 2.0 + i * 1.6;
    T(a.nombre, 1.22, y, 5, 0.28, { font: f.b, size: 10.5 });
    pg.drawImage(ICON[a.k], { x: 0.7 * IN, y: H - (y + 0.97) * IN, width: 0.45 * IN, height: 0.45 * IN });
    R(1.22, y + 0.32, 2.13, 0.9, { border: BLUE });
    L(2.29, y + 0.32, 2.29, y + 1.22); L(2.29, y + 0.77, 3.35, y + 0.77);
    T(pct(ev.amb[a.k]), 1.22, y + 0.32, 1.07, 0.9, { font: f.b, size: 22, color: BLUE, align: 'center', valign: 'middle' });
    T('Nacional', 2.33, y + 0.36, 1.0, 0.18, { font: f.b, size: 7 });
    T(comp.nacional.n ? pct(comp.nacional.amb[a.k]) : '–', 2.33, y + 0.54, 0.98, 0.22, { font: f.b, size: 9, align: 'right' });
    T('Macrozonal', 2.33, y + 0.81, 1.0, 0.18, { font: f.b, size: 7 });
    T(comp.macrozona.n ? pct(comp.macrozona.amb[a.k]) : '–', 2.33, y + 0.99, 0.98, 0.22, { font: f.b, size: 9, align: 'right' });
    T(a.intro, 3.91, y + 0.32, 3.2, 0.9, { size: 8, color: GREY, valign: 'middle', wrap: true, lh: 1.35 });
  });

  // 5 · Recomendaciones
  nueva(); titulo('RECOMENDACIONES');
  AMBITOS.forEach((a, i) => {
    const y = 1.95 + i * 2.15, nv = nivel(ev.amb[a.k]);
    T(a.nombre, 1.22, y, 2.0, 0.45, { font: f.b, size: 10, wrap: true, lh: 1.2 });
    pg.drawImage(ICON[a.k], { x: 0.7 * IN, y: H - (y + 1.2) * IN, width: 0.45 * IN, height: 0.45 * IN });
    R(1.22, y + 0.55, 1.6, 0.86, { border: BLUE });
    L(2.29, y + 0.55, 2.29, y + 1.41);
    T(pct(ev.amb[a.k]), 1.22, y + 0.55, 1.07, 0.86, { font: f.b, size: 22, color: BLUE, align: 'center', valign: 'middle' });
    T('NIVEL', 2.29, y + 0.76, 0.53, 0.2, { font: f.b, size: 7, align: 'center' });
    T(nv, 2.29, y + 0.98, 0.53, 0.2, { font: f.b, size: 7, align: 'center', color: COLOR_NIVEL[nv] || TXT });
    T(recomendacion(ev, a.k), 3.39, y + 0.02, 3.75, 2.0, { size: 7.5, color: GREY, wrap: true, lh: 1.4 });
  });

  // 6 · Contraportada
  nueva(); fondo(img.pag6);
  return doc.save();
}
