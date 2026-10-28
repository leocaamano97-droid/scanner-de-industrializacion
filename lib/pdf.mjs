// Informe PDF del Scanner de Industrialización (diseño 2026).
import { PDFDocument, rgb, LineCapStyle } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { A } from './assets.mjs';
import { AMBITOS, PREGUNTAS, ROLES, pct, nivel, RECO, PLURAL_TAMANO } from './scanner.mjs';

const W = 595.28, H = 841.89, M = 46, CW = W - 2 * M;
const hex = h => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
const mix = (a, b, t) => rgb(a.red + (b.red - a.red) * t, a.green + (b.green - a.green) * t, a.blue + (b.blue - a.blue) * t);
const C = {
  navy: hex('14306B'), blue: hex('0B6CF2'), cyan: hex('25B4E8'), red: hex('E30613'), orange: hex('E08A00'), green: hex('1E8A4C'),
  txt: hex('1F2A37'), mut: hex('5B6B7F'), line: hex('D9E2EE'), bg: hex('F3F6FB'), white: rgb(1, 1, 1), soft: hex('EAF1FE'),
};
const NIV = { BAJO: C.red, MEDIO: C.orange, ALTO: C.green };
const NIV_BG = { BAJO: hex('FDECEC'), MEDIO: hex('FDF3E1'), ALTO: hex('E6F4EC') };
const LECTURA = {
  BAJO: 'La industrialización aún no forma parte de la forma de trabajar de la empresa. Es el momento de definir una visión y dar los primeros pasos con pilotos acotados y medibles.',
  MEDIO: 'La empresa reconoce el valor de la industrialización y ha dado pasos, pero de forma parcial o poco sistemática. El desafío es estandarizar y escalar lo que ya funciona.',
  ALTO: 'La industrialización está integrada en la estrategia y en la operación. El desafío es optimizar, medir resultados y liderar la colaboración con la cadena de valor.',
};
const b64 = s => Uint8Array.from(Buffer.from(s, 'base64'));
export const CONTACTO = 'Equipo Productividad CDT-CChC · productividad@cchc.cl';

export async function generarInformePdf({ empresa, ev, comp, datos = {} }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle('Informe Scanner de Industrialización - ' + empresa);
  doc.setAuthor('CDT - CChC');
  const F = { r: await doc.embedFont(b64(A.poppins400)), m: await doc.embedFont(b64(A.poppins600)), b: await doc.embedFont(b64(A.poppins700)) };
  const IMG = { logos: await doc.embedPng(b64(A.logos)) };
  for (const k of ['ce', 'ha', 'ro', 'in']) IMG[k] = await doc.embedPng(b64(A['icon_' + k]));
  const ICON = { CE: IMG.ce, HA: IMG.ha, RO: IMG.ro, IN: IMG.in };
  const fecha = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' }).format(new Date());
  let pg, nPag = 0;

  // ---------- primitivas (coordenadas en puntos, "top" medido desde arriba) ----------
  const rect = (x, top, w, h, o = {}) => pg.drawRectangle({ x, y: H - top - h, width: w, height: h, color: o.fill, borderColor: o.border, borderWidth: o.border ? (o.bw || 0.8) : 0, opacity: o.op });
  function rrect(x, top, w, h, r, o = {}) {
    r = Math.min(r, h / 2, w / 2);
    const p = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
    pg.drawSvgPath(p, { x, y: H - top, color: o.fill, borderColor: o.border, borderWidth: o.border ? (o.bw || 0.8) : 0 });
  }
  const line = (x1, t1, x2, t2, color = C.line, th = 0.8) => pg.drawLine({ start: { x: x1, y: H - t1 }, end: { x: x2, y: H - t2 }, thickness: th, color });
  function wrap(s, font, size, w) {
    const out = [];
    for (const par of String(s).split('\n')) {
      let cur = '';
      for (const word of par.split(' ')) {
        const t = cur ? cur + ' ' + word : word;
        if (font.widthOfTextAtSize(t, size) > w && cur) { out.push(cur); cur = word; } else cur = t;
      }
      out.push(cur);
    }
    return out;
  }
  /** Escribe texto; devuelve el alto usado. o: {size, font, color, w, align, lh, max} */
  function text(s, x, top, o = {}) {
    const font = o.font || F.r, size = o.size || 9.5, color = o.color || C.txt, w = o.w || CW, lh = size * (o.lh || 1.35);
    let ls = o.nowrap ? [String(s)] : wrap(s, font, size, w);
    if (o.max && ls.length > o.max) { ls = ls.slice(0, o.max); ls[o.max - 1] = ls[o.max - 1].replace(/\s*\S*$/, '') + '…'; }
    ls.forEach((ln, i) => {
      const tw = font.widthOfTextAtSize(ln, size);
      const px = o.align === 'center' ? x + (w - tw) / 2 : o.align === 'right' ? x + w - tw : x;
      pg.drawText(ln, { x: px, y: H - top - size * 0.98 - i * lh, size, font, color, opacity: o.op });
    });
    return ls.length * lh;
  }
  const alto = (s, font, size, w, lh = 1.35) => wrap(s, font, size, w).length * size * lh;
  function chip(t, x, top, color, bgc, size = 7.5) {
    const w = F.b.widthOfTextAtSize(t, size) + 14;
    rrect(x, top, w, size + 8, (size + 8) / 2, { fill: bgc || color });
    text(t, x, top + 4, { font: F.b, size, color: bgc ? color : C.white, w, align: 'center', nowrap: true });
    return w;
  }
  function barra(x, top, w, val, color, ref, h = 8) {
    rrect(x, top, w, h, h / 2, { fill: C.line });
    if (val != null) rrect(x, top, Math.max(h, w * val), h, h / 2, { fill: color });
    if (ref != null) { rect(x + w * ref - 1, top - 3, 2.2, h + 6, { fill: C.navy }); }
  }
  function delta(a, b, x, top, size = 8.5) {
    if (a == null || b == null) return 0;
    const d = Math.round(a * 100) - Math.round(b * 100);
    const col = d > 0 ? C.green : d < 0 ? C.red : C.mut;
    const t = (d > 0 ? '+' : '') + d + ' pts';
    if (d !== 0) pg.drawSvgPath(d > 0 ? 'M 0 6 L 6 6 L 3 0 Z' : 'M 0 0 L 6 0 L 3 6 Z', { x, y: H - top - 2, color: col });
    text(t, x + (d !== 0 ? 9 : 0), top - 1, { font: F.m, size, color: col, nowrap: true });
    return 9 + F.m.widthOfTextAtSize(t, size);
  }
  function arco(cx, cy, r, a0, a1, color, th) { // ángulos en grados, sentido horario desde arriba
    const pts = [], n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 3));
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; pts.push([cx + r * Math.sin(a), -(cy + r * Math.cos(a))]); }
    const p = 'M ' + pts.map(q => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join(' L ');
    pg.drawSvgPath(p, { x: 0, y: 0, borderColor: color, borderWidth: th, borderLineCap: LineCapStyle.Round });
  }
  function gauge(cx, cy, r, val, color) {
    arco(cx, cy, r, -120, 120, C.line, 13);
    if (val != null && val > 0.005) arco(cx, cy, r, -120, -120 + 240 * Math.min(1, val), color, 13);
    // marcas de nivel (25% y 60%)
    for (const v of [0.25, 0.6]) { const a = (-120 + 240 * v) * Math.PI / 180; pg.drawLine({ start: { x: cx + (r - 10) * Math.sin(a), y: cy + (r - 10) * Math.cos(a) }, end: { x: cx + (r + 10) * Math.sin(a), y: cy + (r + 10) * Math.cos(a) }, thickness: 1.2, color: C.white }); }
  }
  const nueva = () => { pg = doc.addPage([W, H]); nPag++; };
  function pie() {
    line(M, H - 34, W - M, H - 34);
    text('Scanner de Industrialización · ' + empresa, M, H - 28, { size: 7.5, color: C.mut, w: CW - 40, max: 1 });
    text(String(nPag), M, H - 28, { size: 7.5, color: C.mut, align: 'right' });
  }
  function encabezado(eyebrow, titulo) {
    rect(0, 0, W, 6, { fill: C.blue }); rect(W - 120, 0, 120, 6, { fill: C.red });
    text(eyebrow.toUpperCase(), M, 34, { font: F.m, size: 8, color: C.blue });
    text(titulo, M, 47, { font: F.b, size: 20, color: C.navy });
    rect(M, 78, 40, 3, { fill: C.red });
  }
  const tamTxt = ev.tamano ? 'Empresa ' + ev.tamano.toLowerCase() : '';

  // =============== 1. PORTADA ===============
  nueva();
  const steps = 90;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const col = t < 0.6 ? mix(C.navy, C.blue, t / 0.6) : mix(C.blue, C.cyan, (t - 0.6) / 0.4);
    rect(0, (H * 0.74) * i / steps, W, H * 0.74 / steps + 1, { fill: col });
  }
  // formas decorativas
  pg.drawSvgPath(`M ${W * 0.45} 0 L ${W} 0 L ${W} ${H * 0.55} Z`, { x: 0, y: H, color: C.white, opacity: 0.06 });
  pg.drawSvgPath(`M ${W} ${H * 0.25} L ${W} ${H * 0.74} L ${W * 0.4} ${H * 0.74} Z`, { x: 0, y: H, color: C.white, opacity: 0.07 });
  pg.drawSvgPath('M 0 0 L 46 0 L 46 46 L 32 33 L 32 13 L 0 13 Z', { x: W - M - 46, y: H - 56, color: C.red });
  text('Scanner de Industrialización  |  Pilar Productividad  |  Compromiso PRO', M, 58, { size: 8.5, color: C.white, op: 0.85 });
  rrect(M, 120, 90, 22, 11, { border: C.white, bw: 1 });
  text('Informe', M, 124, { size: 10, color: C.white, w: 90, align: 'center' });
  text('SCANNER DE', M, 168, { font: F.b, size: 30, color: C.white });
  text('INDUSTRIALIZACIÓN', M, 204, { font: F.b, size: 36, color: C.white });
  rect(M, 262, 50, 4, { fill: C.red });
  let tt = 286;
  tt += text(empresa.toUpperCase(), M, tt, { font: F.b, size: 22, color: C.white, w: CW * 0.8, lh: 1.15, max: 3 }) + 6;
  text([tamTxt, datos.region].filter(Boolean).join('  ·  '), M, tt, { size: 10.5, color: C.white, op: 0.9 });
  // tarjeta del resultado
  const nG = nivel(ev.global);
  rrect(M, 430, 250, 120, 14, { fill: C.white });
  gauge(M + 62, H - 498, 40, ev.global, NIV[nG]);
  text(pct(ev.global), M + 22, 482, { font: F.b, size: 20, color: C.navy, w: 80, align: 'center', nowrap: true });
  text('Nivel global', M + 125, 455, { size: 9, color: C.mut });
  chip(nG, M + 125, 472, NIV[nG]);
  text('de industrialización', M + 125, 496, { size: 9, color: C.mut });
  text(fecha, M, 584, { size: 9.5, color: C.white, op: 0.9 });
  pg.drawImage(IMG.logos, { x: W / 2 - 165, y: 70, width: 330, height: 330 * IMG.logos.height / IMG.logos.width });

  // =============== 2. RESUMEN ===============
  nueva(); encabezado('Resumen de resultados', 'Tu nivel de industrialización');
  rrect(M, 100, CW, 150, 12, { fill: C.bg });
  gauge(M + 92, H - 190, 58, ev.global, NIV[nG]);
  text(pct(ev.global), M + 42, 168, { font: F.b, size: 30, color: C.navy, w: 100, align: 'center', nowrap: true });
  chip(nG, M + 92 - (F.b.widthOfTextAtSize(nG, 7.5) + 14) / 2, 208, NIV[nG]);
  text('Qué significa', M + 190, 118, { font: F.b, size: 11, color: C.navy });
  text(LECTURA[nG], M + 190, 136, { size: 9.5, w: CW - 210, lh: 1.45 });
  text('Escala: BAJO menos de 25%  ·  MEDIO 25% a 59%  ·  ALTO 60% o más', M + 190, 222, { size: 7.5, color: C.mut });

  // comparaciones
  text('¿Cómo te comparas?', M, 272, { font: F.b, size: 12, color: C.navy });
  const comps = [['Promedio nacional', comp.nacional], [ev.macrozona ? 'Promedio ' + ev.macrozona : 'Promedio macrozona', comp.macrozona],
    [ev.tamano ? 'Empresas ' + PLURAL_TAMANO[ev.tamano].toLowerCase() + ' (nacional)' : 'Empresas de tu tamaño', comp.tamanoNacional],
    [ev.tamano ? 'Empresas ' + PLURAL_TAMANO[ev.tamano].toLowerCase() + ' (macrozona)' : 'Tu tamaño en la macrozona', comp.tamanoMacrozona]];
  const cw4 = (CW - 3 * 10) / 4;
  comps.forEach(([nom, g], i) => {
    const x = M + i * (cw4 + 10);
    rrect(x, 294, cw4, 86, 10, { border: C.line });
    text(nom, x + 10, 302, { size: 7.5, color: C.mut, w: cw4 - 20, max: 2, lh: 1.2 });
    text(g.n ? pct(g.global) : '–', x + 10, 326, { font: F.b, size: 20, color: C.navy, nowrap: true });
    if (g.n) delta(ev.global, g.global, x + 10, 360);
    text(g.n ? g.n + ' resp.' : 'sin datos', x + 10, 361, { size: 7, color: C.mut, w: cw4 - 20, align: 'right', nowrap: true });
  });

  // ámbitos
  text('Resultado por ámbito', M, 402, { font: F.b, size: 12, color: C.navy });
  text('Barra: tu empresa  ·  marca oscura: promedio nacional', M, 404, { size: 7.5, color: C.mut, align: 'right' });
  AMBITOS.forEach((a, i) => {
    const top = 426 + i * 66, x = M, v = ev.amb[a.k], nv = nivel(v);
    rrect(x, top, CW, 58, 10, { fill: i % 2 ? C.white : C.bg, border: i % 2 ? C.line : undefined });
    pg.drawImage(ICON[a.k], { x: x + 12, y: H - top - 46, width: 34, height: 34 });
    text(a.nombre, x + 58, top + 10, { font: F.m, size: 10.5, color: C.navy, w: 230, nowrap: true });
    chip(nv, x + 58 + F.m.widthOfTextAtSize(a.nombre, 10.5) + 8, top + 10, NIV[nv], NIV_BG[nv], 7);
    barra(x + 58, top + 34, 250, v, C.blue, comp.nacional.amb[a.k]);
    text('Nacional ' + pct(comp.nacional.amb[a.k]) + (comp.macrozona.n ? '\nMacrozona ' + pct(comp.macrozona.amb[a.k]) : ''), x + 320, top + 26, { size: 7.5, color: C.mut, w: 110, lh: 1.3 });
    text(pct(v), x + CW - 80, top + 16, { font: F.b, size: 20, color: C.blue, w: 68, align: 'right', nowrap: true });
  });

  // fortalezas y prioridades
  const qs = PREGUNTAS.map(q => ({ q, v: ev.p[q.id] })).filter(o => o.v != null);
  const prior = qs.slice().sort((a, b) => a.v - b.v).slice(0, 3);
  const fuer = qs.slice().sort((a, b) => b.v - a.v).filter(o => o.v >= 0.5).slice(0, 3);
  const half = (CW - 12) / 2;
  rrect(M, 702, half, 92, 10, { fill: NIV_BG.ALTO });
  text('Fortalezas', M + 12, 711, { font: F.b, size: 10, color: C.green });
  if (fuer.length) fuer.forEach((o, i) => text('•  ' + o.q.corto + '  (' + pct(o.v) + ')', M + 12, 730 + i * 15, { size: 8.5, w: half - 24, max: 1 }));
  else text('Aún no hay aspectos sobre 50%. Las prioridades de la derecha son un buen punto de partida.', M + 12, 730, { size: 8.5, w: half - 24 });
  rrect(M + half + 12, 702, half, 92, 10, { fill: NIV_BG.BAJO });
  text('Prioridades para avanzar', M + half + 24, 711, { font: F.b, size: 10, color: C.red });
  prior.forEach((o, i) => text((i + 1) + '.  ' + o.q.corto + '  (' + pct(o.v) + ')', M + half + 24, 730 + i * 15, { size: 8.5, w: half - 24, max: 1 }));
  pie();

  // =============== 3-6. DETALLE POR ÁMBITO ===============
  const txtResp = q => {
    const d = ev.det[q.id];
    if (q.roles) return null;
    const i = 'abcde'.indexOf(d.letra);
    return i >= 0 ? q.opciones[i] : 'Sin respuesta';
  };
  const recoDe = q => {
    const d = ev.det[q.id];
    if (q.id === 'P10') return d.faltan.length ? 'Definir claramente las responsabilidades de los roles que faltan permite liderar los proyectos industrializados con claridad.' : 'Todos los roles están claramente definidos: mantén esta claridad al sumar nuevos proyectos.';
    if (q.id === 'P11') return d.faltan.length ? 'Contar con personas con experiencia o capacitación en CI en estos roles ayuda a implementar la industrialización como estrategia.' : 'Todos los roles cuentan con experiencia en CI: aprovecha a estas personas como referentes internos.';
    return d.letra ? RECO[q.id][d.letra === 'a' || d.letra === 'b' ? 0 : d.letra === 'c' ? 1 : 2] : '';
  };
  const colR = M + 170, wR = CW - 170 - 12;
  const altoFila = (q, s) => {
    const r = txtResp(q), rc = recoDe(q);
    const hResp = q.roles ? 34 : alto('Tu respuesta: ' + r, F.r, s, wR);
    return Math.max(62, 12 + hResp + 6 + alto(rc, F.r, s, wR - 14) + 14);
  };
  const altoAmbito = a => 92 + 16 + PREGUNTAS.filter(q => q.amb === a.k).reduce((t, q) => t + altoFila(q, 8) + 8, 0);
  let cursor = null; // posición vertical en la página actual (null = sin página)
  AMBITOS.forEach(a => {
    const necesario = altoAmbito(a), base = 98;
    if (cursor === null || cursor + 46 + necesario > H - 50) {
      if (cursor !== null) pie();
      nueva(); encabezado('Análisis por ámbito', a.nombre); cursor = base;
    } else {
      cursor += 14;
      text(a.nombre, M, cursor, { font: F.b, size: 20, color: C.navy });
      rect(M, cursor + 31, 40, 3, { fill: C.red });
      cursor += 46;
    }
    const y0 = cursor, v = ev.amb[a.k], nv = nivel(v);
    rrect(M, y0, CW, 92, 12, { fill: C.bg });
    pg.drawImage(ICON[a.k], { x: M + 14, y: H - y0 - 62, width: 48, height: 48 });
    text(a.intro, M + 76, y0 + 12, { size: 9, color: C.txt, w: 250, lh: 1.45 });
    text(pct(v), M + CW - 150, y0 + 8, { font: F.b, size: 28, color: C.blue, w: 136, align: 'right', nowrap: true });
    chip(nv, M + CW - 14 - (F.b.widthOfTextAtSize(nv, 7.5) + 14), y0 + 46, NIV[nv]);
    text('Nacional ' + pct(comp.nacional.amb[a.k]) + (comp.macrozona.n ? '  ·  Macrozona ' + pct(comp.macrozona.amb[a.k]) : ''), M + CW - 230, y0 + 68, { size: 8, color: C.mut, w: 216, align: 'right', nowrap: true });
    const preguntas = PREGUNTAS.filter(q => q.amb === a.k);
    let top = y0 + 108;
    let fs = 8;
    const disponible = H - 50 - top;
    while (fs > 6.6 && preguntas.reduce((t, q) => t + altoFila(q, fs) + 8, 0) > disponible) fs -= 0.3;
    preguntas.forEach(q => {
      const h = altoFila(q, fs), val = ev.p[q.id], nq = nivel(val);
      rrect(M, top, CW, h, 10, { border: C.line });
      rect(M, top + 10, 3, h - 20, { fill: NIV[nq] || C.line });
      text(q.corto, M + 14, top + 10, { font: F.m, size: 9.5, color: C.navy, w: 145, lh: 1.25 });
      // escala de 5 pasos
      const nivelResp = q.roles ? Math.round((ev.det[q.id].roles.length / 5) * 5) : ' abcde'.indexOf(ev.det[q.id].letra || ' ');
      for (let i = 0; i < 5; i++) rrect(M + 14 + i * 17, top + h - 26, 14, 6, 3, { fill: i < nivelResp ? (NIV[nq] || C.blue) : C.line });
      text(pct(val), M + 104, top + h - 31, { font: F.b, size: 10, color: NIV[nq] || C.txt, w: 50, align: 'right', nowrap: true });
      let t = top + 10;
      if (q.roles) {
        text(q.id === 'P10' ? 'Roles claramente definidos:' : 'Roles con experiencia o capacitación en CI:', colR, t, { size: fs, color: C.mut, w: wR });
        let cx = colR;
        ROLES.forEach(r => {
          const ok = ev.det[q.id].roles.includes(r);
          cx += chip(r, cx, t + 13, ok ? C.blue : C.mut, ok ? C.soft : C.bg, 7) + 5;
        });
        t += 34;
      } else {
        t += text('Tu respuesta: ' + txtResp(q), colR, t, { size: fs, color: C.mut, w: wR, lh: 1.35 });
      }
      t += 6;
      rect(colR, t + 1, 2, alto(recoDe(q), F.r, fs, wR - 14) - 2, { fill: C.blue });
      text(recoDe(q), colR + 10, t, { size: fs, color: C.txt, w: wR - 14, lh: 1.35 });
      top += h + 8;
    });
    cursor = top;
  });
  pie();

  // =============== 7. PRÓXIMOS PASOS ===============
  nueva(); encabezado('Cómo seguir', 'Próximos pasos');
  const pasos = [
    ['Comparte este informe', 'Revísalo con la gerencia y los equipos de proyecto. Pide que más personas de tu empresa respondan el scanner para ver si están alineados.'],
    ['Elige 1 o 2 prioridades', 'Parte por los aspectos con menor puntaje que dependan de tu empresa. Define un responsable y un plazo.'],
    ['Haz un piloto y mídelo', 'Prueba la mejora en una obra o un área acotada. Mide antes y después: plazo, costo, horas hombre, retrabajos o % de soluciones industrializadas.'],
    ['Vuelve a medir', 'Responde nuevamente el scanner en 6 a 12 meses para ver tu avance frente al sector.'],
  ];
  pasos.forEach(([t, d], i) => {
    const top = 104 + i * 78;
    pg.drawCircle({ x: M + 18, y: H - top - 18, size: 18, color: i === 3 ? C.red : C.blue });
    text(String(i + 1), M, top + 8, { font: F.b, size: 15, color: C.white, w: 36, align: 'center', nowrap: true });
    text(t, M + 52, top + 2, { font: F.b, size: 12, color: C.navy });
    text(d, M + 52, top + 22, { size: 9.5, w: CW - 60, lh: 1.45 });
  });
  rrect(M, 430, CW, 128, 12, { fill: C.bg });
  text('Metodología', M + 16, 444, { font: F.b, size: 10.5, color: C.navy });
  text('El scanner evalúa 15 aspectos agrupados en cuatro ámbitos. Cada respuesta se valoriza de a) a e): 1%, 25%, 50%, 75% y 100%. ' +
    'Los roles se valorizan según la proporción de roles marcados. El puntaje de cada ámbito es el promedio de sus aspectos y el nivel global es el promedio de los cuatro ámbitos. ' +
    'Las comparaciones consideran todas las evaluaciones recibidas a la fecha de este informe; es una autoevaluación y refleja la percepción de quien responde.',
    M + 16, 462, { size: 8.5, w: CW - 32, lh: 1.45, color: C.txt });
  rrect(M, 580, CW, 70, 12, { fill: C.navy });
  text('¿Dudas o quieres apoyo para avanzar?', M + 18, 594, { font: F.b, size: 11, color: C.white });
  text(CONTACTO, M + 18, 614, { size: 10, color: C.white });
  pg.drawImage(IMG.logos, { x: W / 2 - 150, y: 80, width: 300, height: 300 * IMG.logos.height / IMG.logos.width });
  pie();
  return doc.save();
}
