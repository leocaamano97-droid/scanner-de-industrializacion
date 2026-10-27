// Lógica del Scanner de Industrialización: puntajes, niveles, comparaciones y recomendaciones.
import { FORM } from './preguntas.mjs';

export const PREGUNTAS = FORM.preguntas;
export const LISTAS = FORM.listas;
export const ROLES = LISTAS.roles;
export const PUNTAJE = { a: 0.01, b: 0.25, c: 0.5, d: 0.75, e: 1 };
export const UMBRAL_BAJO = 0.25, UMBRAL_MEDIO = 0.6;

export const AMBITOS = [
  { k: 'CE', nombre: 'Conceptualización y estrategia',
    intro: 'Sin una visión clara, las acciones carecen de dirección. Integrar la industrialización en la estrategia empresarial asegura objetivos alineados y un impacto sostenido en el mercado.' },
  { k: 'HA', nombre: 'Habilitantes',
    intro: 'Los recursos y herramientas son el motor del cambio. Adoptar tecnologías como BIM, Lean y DfMA impulsa la eficiencia y competitividad en la construcción.' },
  { k: 'RO', nombre: 'Roles',
    intro: 'El talento adecuado marca la diferencia. Evaluar y desarrollar competencias clave garantiza equipos preparados para liderar la industrialización.' },
  { k: 'IN', nombre: 'Integración temprana y colaboración',
    intro: 'La construcción es un esfuerzo conjunto. Fomentar la colaboración interna y la integración temprana con socios y proveedores mejora resultados y reduce riesgos.' },
];

export const RECO = {
  P1: ['Es importante que tu empresa considere la CI como una estrategia clave para mejorar eficiencia y competitividad.',
    'Considerar la CI como una opción estratégica es positivo; convertir esta intención en un plan fortalecerá el posicionamiento de la empresa.',
    'La prioridad dada a la CI es excelente; sigue en este camino y evalúa nuevas oportunidades para maximizar los beneficios.'],
  P2: ['Es recomendable aumentar el conocimiento sobre MMC en la empresa para que el equipo comprenda sus beneficios en los proyectos.',
    'Ampliar el conocimiento sobre MMC a más miembros del equipo facilitará la adopción de estas prácticas.',
    'El conocimiento avanzado sobre MMC es una ventaja; mantén las capacitaciones y fomenta su aplicación en proyectos clave.'],
  P3: ['Incorporar técnicas de análisis de mercado fortalecerá la toma de decisiones y permitirá anticipar tendencias sectoriales.',
    'Aplicar técnicas básicas de análisis es un buen comienzo; adoptar métodos avanzados optimizará la planificación.',
    'El uso avanzado de análisis de mercado es excelente; sigue utilizándolo para adaptarte rápidamente a cambios en el sector.'],
  P4: ['Implementar un sistema de medición de indicadores clave permitirá un mejor seguimiento y optimización de los proyectos.',
    'El monitoreo de algunos indicadores es positivo; ampliar el sistema mejorará la visibilidad y ajustes en tiempo real.',
    'El seguimiento detallado de indicadores es una excelente práctica; mantén y optimiza este sistema para asegurar la eficiencia.'],
  P5: ['Es importante incluir factores logísticos, como accesibilidad y tiempos de transporte, en las decisiones de CI.',
    'Considerar algunos aspectos logísticos es positivo; integrar una evaluación más amplia aumentará la eficiencia de los proyectos.',
    'El análisis avanzado de logística es una ventaja competitiva; continúa usando estas herramientas para optimizar la ejecución.'],
  P6: ['Es recomendable invertir en capacitación para que el equipo adquiera habilidades en montaje de soluciones industrializadas.',
    'Ampliar la capacitación en montaje fortalecerá la ejecución y éxito de proyectos de soluciones industrializadas.',
    'Contar con un equipo capacitado en montaje es una ventaja; sigue perfeccionando estas habilidades para asegurar calidad.'],
  P7: ['Es recomendable que la empresa comience a familiarizarse con los principios de DfMA para optimizar los procesos de manufactura y ensamblaje.',
    'Aplicar principios de DfMA en algunos procesos es un buen comienzo. Ampliar esta aplicación a toda la cadena de diseño mejorará la eficiencia.',
    'La implementación avanzada de DfMA es una excelente práctica. Mantén este enfoque y busca innovaciones que optimicen aún más el diseño y manufactura.'],
  P8: ['Incorporar plataformas digitales y comenzar a explorar la metodología BIM fortalecerá la colaboración y el control de proyectos.',
    'Usar plataformas digitales y aplicar BIM en algunos proyectos es positivo; integrarlos en todos los procesos mejorará la eficiencia y coordinación.',
    'La integración avanzada de BIM y plataformas digitales es una ventaja significativa. Continúa optimizando su uso para mejorar la precisión y colaboración.'],
  P9: ['Conocer y aplicar los principios de Lean permitirá optimizar procesos y reducir desperdicios en la empresa.',
    'La aplicación de principios Lean en algunos procesos es positiva; expandirlos a toda la organización generará mayor eficiencia.',
    'La adopción avanzada de Lean es excelente. Sigue aplicando estos principios y busca áreas adicionales donde optimizar los procesos.'],
  P12: ['Es recomendable que la empresa considere la evaluación de competencias clave para asegurar que el personal cuente con habilidades adecuadas para los proyectos.',
    'Evaluar algunas competencias es un buen inicio; ampliar esta evaluación a competencias estratégicas mejorará la capacidad del equipo.',
    'La evaluación integral de competencias es una excelente práctica. Mantén y optimiza este enfoque para fomentar un equipo altamente capacitado.'],
  P13: ['Considera incorporar la integración temprana de equipos y proveedores para mejorar la planificación y reducir riesgos en los proyectos.',
    'El esfuerzo por integrar a equipos y proveedores es positivo; formalizar este proceso desde etapas tempranas mejorará la colaboración.',
    'La integración temprana formal y estructurada es excelente. Mantén este enfoque para optimizar la comunicación y eficiencia del proyecto.'],
  P14: ['Fomentar una cultura de colaboración interna beneficiará los proyectos y reducirá los riesgos de trabajo aislado en los equipos.',
    'La cooperación entre equipos es positiva; formalizar una cultura de colaboración fortalecerá los resultados y la alineación organizacional.',
    'La colaboración sólida y comprometida es una gran ventaja. Sigue impulsando esta integración para mejorar la eficiencia y el alcance de los proyectos.'],
  P15: ['Desarrollar un enfoque estructurado para la planificación y selección de proveedores optimizará la cadena de suministro y reducirá los tiempos de respuesta.',
    'La planificación anticipada de adquisiciones es un buen avance; implementar una estrategia más estructurada fortalecerá la relación y eficiencia con proveedores.',
    'La planificación cuidadosa y estructurada de adquisiciones es excelente. Mantén esta capacidad para asegurar calidad y eficiencia en la cadena de suministro.'],
};

const MACROZONA = [
  ['arica', 'Macrozona Norte'], ['tarapac', 'Macrozona Norte'], ['antofagasta', 'Macrozona Norte'], ['atacama', 'Macrozona Norte'],
  ['coquimbo', 'Macrozona Centro'], ['valpara', 'Macrozona Centro'], ['metropolitana', 'Macrozona Centro'],
  ['higgins', 'Macrozona Centro Sur'], ['maule', 'Macrozona Centro Sur'], ['ñuble', 'Macrozona Centro Sur'], ['biob', 'Macrozona Centro Sur'],
  ['araucan', 'Macrozona Sur'], ['los ríos', 'Macrozona Sur'], ['los lagos', 'Macrozona Sur'],
  ['aysén', 'Macrozona Austral'], ['magallanes', 'Macrozona Austral'], ['internacional', 'Internacional'],
];
const TAMANO = { 'Entre 1 y 25': 'Pequeña', 'Entre 25 y 200': 'Mediana', 'Más de 200': 'Grande' };
export const PLURAL_TAMANO = { 'Pequeña': 'PEQUEÑAS', 'Mediana': 'MEDIANAS', 'Grande': 'GRANDES' };

export const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
export const macrozona = region => (MACROZONA.find(([k]) => norm(region).includes(k)) || [, ''])[1];
export const pct = x => (x == null || isNaN(x) ? '–' : Math.round(x * 100) + '%');
export function nivel(x) {
  if (x == null || isNaN(x)) return '';
  x = Math.round(x * 100) / 100;
  return x < UMBRAL_BAJO ? 'BAJO' : x < UMBRAL_MEDIO ? 'MEDIO' : 'ALTO';
}
const prom = a => { const v = a.filter(x => x != null && !isNaN(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };

/** Valida y limpia una respuesta enviada desde el formulario web. Devuelve {ok, errores, r}. */
export function validar(body) {
  const e = [];
  const s = (k, max = 200) => String(body?.[k] ?? '').trim().slice(0, max);
  const r = {
    empresa: s('empresa', 120), region: s('region'), email: s('email', 300), utilidad: s('utilidad'), facturacion: s('facturacion'),
    cobertura: s('cobertura'), personas: s('personas'), cargo: s('cargo', 120), experiencia: s('experiencia'), primera: s('primera'),
    socia: s('socia'), respuestas: {},
  };
  if (!r.empresa) e.push('Nombre de la empresa');
  if (!LISTAS.regiones.includes(r.region)) e.push('Región');
  if (!LISTAS.personas.includes(r.personas)) e.push('Cantidad de personas');
  for (const q of PREGUNTAS) {
    const v = body?.respuestas?.[q.id];
    if (q.roles) r.respuestas[q.id] = Array.isArray(v) ? ROLES.filter(x => v.includes(x)) : [];
    else if (['a', 'b', 'c', 'd', 'e'].includes(v)) r.respuestas[q.id] = v;
    else e.push(q.corto);
  }
  return { ok: e.length === 0, errores: e, r };
}

/** Calcula puntajes a partir de una respuesta limpia. */
export function evaluar(r) {
  const p = {}, det = {};
  for (const q of PREGUNTAS) {
    const v = r.respuestas[q.id];
    if (q.roles) {
      const marc = v || [];
      p[q.id] = marc.length === 0 ? 0.01 : marc.length / ROLES.length;
      det[q.id] = { roles: marc, faltan: ROLES.filter(x => !marc.includes(x)) };
    } else {
      p[q.id] = v ? PUNTAJE[v] : null;
      det[q.id] = { letra: v || null };
    }
  }
  const amb = {};
  for (const a of AMBITOS) amb[a.k] = prom(PREGUNTAS.filter(q => q.amb === a.k).map(q => p[q.id]));
  const global = prom(AMBITOS.map(a => amb[a.k]));
  return { p, det, amb, global, macrozona: macrozona(r.region), tamano: TAMANO[r.personas] || '' };
}

function grupo(lista, filtro) {
  const g = lista.filter(filtro);
  const out = { n: g.length, global: prom(g.map(x => x.global)), amb: {} };
  for (const a of AMBITOS) out.amb[a.k] = prom(g.map(x => x.amb?.[a.k]));
  return out;
}

/** Comparaciones contra la base (lista de {global, amb, macrozona, tamano}). */
export function comparar(ev, base) {
  const { macrozona: mz, tamano: tam } = ev;
  return {
    nacional: grupo(base, () => true),
    macrozona: grupo(base, x => mz && x.macrozona === mz),
    tamanoNacional: grupo(base, x => tam && x.tamano === tam),
    tamanoMacrozona: grupo(base, x => tam && mz && x.tamano === tam && x.macrozona === mz),
  };
}

const lista = a => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]);

export function recomendacion(ev, k) {
  const partes = [];
  for (const q of PREGUNTAS.filter(q => q.amb === k)) {
    const d = ev.det[q.id];
    if (q.id === 'P10') partes.push(d.faltan.length
      ? 'Definir claramente los roles en el equipo es importante para establecer las responsabilidades. Los roles que faltan definir son: ' + lista(d.faltan) + '.'
      : 'Todos los roles del equipo están claramente definidos.');
    else if (q.id === 'P11') partes.push(d.faltan.length
      ? 'Además, contar con gente con experiencia o capacitación en CI en estos roles ayuda a implementar la industrialización como estrategia. Los roles en los que faltan experiencia o capacitación son: ' + lista(d.faltan) + '.'
      : 'Todos los roles cuentan con personas con experiencia o capacitación en CI.');
    else if (d.letra) partes.push(RECO[q.id][d.letra === 'a' || d.letra === 'b' ? 0 : d.letra === 'c' ? 1 : 2]);
  }
  return partes.join(' ');
}

/** Resumen compacto para guardar en la base y usar como comparación. */
export const resumen = ev => ({ global: ev.global, amb: ev.amb, macrozona: ev.macrozona, tamano: ev.tamano });
