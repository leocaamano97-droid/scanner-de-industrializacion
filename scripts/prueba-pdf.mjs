// Prueba local: genera un informe de ejemplo (node scripts/prueba-pdf.mjs)
import fs from 'node:fs';
import { validar, evaluar, comparar } from '../lib/scanner.mjs';
import { HISTORICO } from '../lib/historico.mjs';
import { generarInformePdf } from '../lib/pdf.mjs';
const body = { empresa: 'Constructora Demo', region: 'Región de Los Lagos', email: 'demo@ejemplo.cl', personas: 'Entre 25 y 200',
  respuestas: { P1: 'b', P2: 'b', P3: 'a', P4: 'b', P5: 'b', P6: 'a', P7: 'a', P8: 'b', P9: 'a', P10: ['Dirección', 'Coordinación', 'Ejecución'], P11: [], P12: 'b', P13: 'b', P14: 'b', P15: 'a' } };
const v = validar(body); if (!v.ok) throw new Error(v.errores.join(', '));
const ev = evaluar(v.r);
const comp = comparar(ev, HISTORICO);
console.log(ev.global, ev.amb, comp.nacional.n, comp.macrozona.n);
fs.writeFileSync(process.argv[2] || 'ejemplo.pdf', await generarInformePdf({ empresa: v.r.empresa, ev, comp }));
