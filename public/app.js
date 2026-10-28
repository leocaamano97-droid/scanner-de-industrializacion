/* Scanner de Industrialización · formulario y resultados */
(function () {
  'use strict';
  var F = window.FORM, L = F.listas;
  var $ = function (s) { return document.querySelector(s); };
  var AMB = [
    { k: 'CE', nombre: 'Conceptualización y estrategia', icon: 'icon_ce', intro: 'Planificación estratégica para integrar la industrialización en el diseño, planificación y ejecución de proyectos.' },
    { k: 'HA', nombre: 'Habilitantes', icon: 'icon_ha', intro: 'Uso de metodologías y herramientas como BIM, Lean y Diseño para Fabricación y Montaje (DfMA).' },
    { k: 'RO', nombre: 'Roles', icon: 'icon_ro', intro: 'Responsabilidades y competencias de los equipos para liderar y ejecutar proyectos industrializados.' },
    { k: 'IN', nombre: 'Integración temprana y colaboración', icon: 'icon_in', intro: 'Coordinación y trabajo conjunto entre los distintos actores del proyecto.' }
  ];
  // Texto legal de tratamiento de datos personales (editar aquí si cambia)
  var TEXTO_LEGAL = 'Los datos personales que usted proporcione durante la actividad serán recabado y utilizado exclusivamente con fines relacionados a la organización de actividades promovidas por la CChC. Le recordamos sus derechos a acceder, rectificar, cancelar, oponerse, revocar el tratamiento de sus datos personales en cualquier momento, contactando directamente CChC. Todo en conformidad con la legislación vigente en Chile sobre protección de datos personales (Ley N° 19.496 sobre Protección de la Vida Privada y la Ley 21.719).';
  var CLAVE = 'scanner-ind-borrador';
  var paso = 0, PASOS = [], datos = { respuestas: {} }, actual = null;

  function guardarBorrador() { try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) {} }
  function leerBorrador() { try { var d = JSON.parse(localStorage.getItem(CLAVE)); if (d && d.respuestas) datos = d; } catch (e) {} }
  function borrarBorrador() { try { localStorage.removeItem(CLAVE); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mostrar(id) { ['v-inicio', 'v-form', 'v-res'].forEach(function (v) { $('#' + v).hidden = v !== id; }); window.scrollTo(0, 0); }

  // ---------- construcción de pasos ----------
  function select(id, etiqueta, opciones, ayuda) {
    return '<div class="campo" data-campo="' + id + '"><label for="f-' + id + '">' + etiqueta + (ayuda ? ' <span class="ayuda">' + ayuda + '</span>' : '') + '</label>' +
      '<select id="f-' + id + '" name="' + id + '"><option value="">Selecciona…</option>' +
      opciones.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></div>';
  }
  function radios(id, etiqueta, opciones) {
    return '<fieldset class="preg" data-campo="' + id + '"><legend>' + etiqueta + '</legend>' + opciones.map(function (o, i) {
      return '<label class="op"><input type="radio" name="' + id + '" value="' + esc(o) + '"><span class="l">' + 'abcdefg'[i] + '</span><span>' + esc(o) + '</span></label>';
    }).join('') + '</fieldset>';
  }
  function pregunta(q, n) {
    if (q.roles) {
      return '<fieldset class="preg" data-preg="' + q.id + '"><legend><span class="n">' + n + '.</span>' + esc(q.titulo) + ' <span class="muted small">(puedes marcar varios o ninguno)</span></legend>' +
        L.roles.map(function (r) {
          return '<label class="op chk"><input type="checkbox" name="' + q.id + '" value="' + r + '"><span class="l">✓</span><span>' + r + '</span></label>';
        }).join('') + '</fieldset>';
    }
    return '<fieldset class="preg" data-preg="' + q.id + '"><legend><span class="n">' + n + '.</span>' + esc(q.titulo) + '</legend>' +
      q.opciones.map(function (o, i) {
        var l = 'abcde'[i];
        return '<label class="op"><input type="radio" name="' + q.id + '" value="' + l + '"><span class="l">' + l + '</span><span>' + esc(o) + '</span></label>';
      }).join('') + '</fieldset>';
  }
  function construir() {
    var html = '';
    PASOS = [];
    // Paso empresa
    html += '<div class="card paso" data-paso="0"><h2>Tu empresa</h2><p class="paso-intro">Estos datos permiten comparar tus resultados con empresas similares.</p>' +
      '<div class="campo" data-campo="empresa"><label for="f-empresa">Nombre de la empresa</label><input id="f-empresa" name="empresa" type="text" maxlength="120" autocomplete="organization"></div>' +
      '<div class="dos">' + select('region', 'Región', L.regiones) + select('cobertura', 'Área de cobertura', L.cobertura) + '</div>' +
      radios('personas', '¿Cuántas personas trabajan en su empresa?', L.personas) +
      '<div class="dos">' + select('cargo', '¿Qué cargo ocupa?', L.cargos) + select('experiencia', 'Años de experiencia en construcción', L.experiencia) + '</div>' +
      '<div class="dos">' + select('facturacion', 'Facturación del último año', L.facturacion) + select('utilidad', 'Utilidad de su último proyecto', L.utilidad) + '</div>' +
      '<div class="dos">' + select('socia', '¿La empresa es socia CCI o CChC?', L.socia) + select('primera', '¿Es primera vez que evalúa a su empresa?', L.primera) + '</div>' +
      '</div>';
    PASOS.push({ tipo: 'empresa', req: ['empresa', 'region', 'personas'] });
    var n = 1;
    AMB.forEach(function (a) {
      var qs = F.preguntas.filter(function (q) { return q.amb === a.k; });
      html += '<div class="card paso" data-paso="' + PASOS.length + '" hidden><div class="paso-tit"><img src="img/' + a.icon + '.png" alt=""><h2>' + a.nombre + '</h2></div>' +
        '<p class="paso-intro">' + a.intro + '</p>' + qs.map(function (q) { return pregunta(q, n++); }).join('') + '</div>';
      PASOS.push({ tipo: 'amb', preguntas: qs });
    });
    html += '<div class="card paso" data-paso="' + PASOS.length + '" hidden><h2>Recibe tu informe</h2>' +
      '<p class="paso-intro">Al enviar verás tus resultados de inmediato y podrás descargar el informe en PDF. Si quieres, también te lo enviamos por correo.</p>' +
      '<div class="campo" data-campo="email"><label for="f-email">Correo para enviar el informe <span class="ayuda">(opcional; puedes poner varios separados por coma)</span></label>' +
      '<input id="f-email" name="email" type="text" inputmode="email" autocomplete="email" placeholder="nombre@empresa.cl"></div>' +
      '<label class="check"><input type="checkbox" id="f-enviar" checked> Enviarme el informe por correo al terminar</label>' +
      '<p class="muted small">Tus respuestas se guardan de forma confidencial y se usan de forma agregada para calcular los promedios de comparación del sector.</p>' +
      '<div class="legal" data-campo="acepto"><p>' + esc(TEXTO_LEGAL) + '</p>' +
      '<label class="check"><input type="checkbox" id="f-acepto"> <span><b>Acepto</b> el tratamiento de mis datos personales en los términos indicados.</span></label></div></div>';
    PASOS.push({ tipo: 'final' });
    $('#pasos').innerHTML = html;
    rellenar();
    $('#form').addEventListener('change', function (e) { leerCampo(e.target); guardarBorrador(); limpiarFalta(e.target); });
    $('#form').addEventListener('input', function (e) { if (e.target.type === 'text') { leerCampo(e.target); guardarBorrador(); } });
  }
  function leerCampo(el) {
    if (!el.name || el.id === 'web') return;
    var q = F.preguntas.filter(function (x) { return x.id === el.name; })[0];
    if (q && q.roles) {
      datos.respuestas[q.id] = Array.prototype.map.call(document.querySelectorAll('input[name="' + q.id + '"]:checked'), function (i) { return i.value; });
    } else if (q) datos.respuestas[q.id] = el.value;
    else datos[el.name] = el.value;
  }
  function rellenar() {
    Object.keys(datos).forEach(function (k) {
      if (k === 'respuestas') return;
      var els = document.getElementsByName(k);
      Array.prototype.forEach.call(els, function (el) { if (el.type === 'radio') el.checked = el.value === datos[k]; else el.value = datos[k] || ''; });
    });
    Object.keys(datos.respuestas).forEach(function (k) {
      var v = datos.respuestas[k];
      Array.prototype.forEach.call(document.getElementsByName(k), function (el) { el.checked = Array.isArray(v) ? v.indexOf(el.value) >= 0 : el.value === v; });
    });
  }
  function limpiarFalta(el) { var c = el.closest('.falta'); if (c) c.classList.remove('falta'); $('#error').textContent = ''; }

  function validarPaso() {
    var p = PASOS[paso], faltan = [];
    document.querySelectorAll('.falta').forEach(function (x) { x.classList.remove('falta'); });
    if (p.tipo === 'empresa') {
      p.req.forEach(function (k) { if (!String(datos[k] || '').trim()) { faltan.push(k); var c = document.querySelector('[data-campo="' + k + '"]'); if (c) c.classList.add('falta'); } });
    } else if (p.tipo === 'final') {
      if (!$('#f-acepto').checked) { faltan.push('acepto'); document.querySelector('[data-campo="acepto"]').classList.add('falta'); }
    } else if (p.tipo === 'amb') {
      p.preguntas.forEach(function (q) { if (!q.roles && !datos.respuestas[q.id]) { faltan.push(q.id); document.querySelector('[data-preg="' + q.id + '"]').classList.add('falta'); } });
    }
    if (faltan.length) {
      $('#error').textContent = faltan.length === 1 && faltan[0] === 'acepto' ? 'Para continuar debes aceptar el tratamiento de datos personales.' : 'Faltan ' + faltan.length + ' respuesta(s) marcadas en rojo.';
      var primero = document.querySelector('.falta'); if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }
  function irA(n) {
    paso = n;
    document.querySelectorAll('.paso').forEach(function (el) { el.hidden = +el.dataset.paso !== n; });
    $('#atras').style.visibility = n === 0 ? 'hidden' : 'visible';
    $('#siguiente').textContent = n === PASOS.length - 1 ? 'Enviar y ver resultados' : 'Siguiente';
    $('#barra').style.width = Math.round((n / (PASOS.length - 1)) * 100) + '%';
    $('#paso-txt').textContent = 'Paso ' + (n + 1) + ' de ' + PASOS.length;
    $('#error').textContent = '';
    window.scrollTo(0, 0);
  }

  // ---------- envío ----------
  function enviar() {
    var b = $('#siguiente');
    b.disabled = true; b.textContent = 'Calculando resultados…';
    var body = JSON.parse(JSON.stringify(datos));
    body.enviarCorreo = $('#f-enviar').checked && !!String(datos.email || '').trim();
    body.web = $('#web').value;
    body.aceptaDatos = $('#f-acepto').checked;
    F.preguntas.forEach(function (q) { if (q.roles && !body.respuestas[q.id]) body.respuestas[q.id] = []; });
    fetch('/api/responder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); })
      .then(function (j) {
        borrarBorrador();
        try { history.replaceState(null, '', '?id=' + j.id + '&t=' + j.t); } catch (e) {}
        verResultado(j);
      })
      .catch(function (e) { $('#error').textContent = e.message + '. Intenta de nuevo.'; })
      .then(function () { b.disabled = false; b.textContent = 'Enviar y ver resultados'; });
  }

  // ---------- resultados ----------
  function difTxt(a, b) {
    if (a == null || b == null) return '';
    var d = a - b;
    return d > 0 ? '<span class="up">▲ +' + d + ' pts</span>' : d < 0 ? '<span class="down">▼ ' + d + ' pts</span>' : '<span class="muted">= igual</span>';
  }
  function verResultado(j) {
    actual = j;
    var r = j.resultado;
    $('#r-empresa').textContent = String(j.empresa || '').toUpperCase();
    $('#r-sub').textContent = [r.tamano ? 'Empresa ' + r.tamano : '', r.macrozona].filter(Boolean).join(' · ');
    $('#r-global').textContent = r.global + '%';
    $('#r-nivel').textContent = r.nivel; $('#r-nivel').className = 'chip ' + r.nivel;
    var arc = $('#g-arc');
    arc.setAttribute('stroke', { BAJO: '#E30613', MEDIO: '#E08A00', ALTO: '#1E8A4C' }[r.nivel] || '#0B6CF2');
    arc.setAttribute('stroke-dasharray', Math.max(1, r.global) + ' 100');
    var c = r.comparacion, filas = [['Promedio nacional', c.nacional]];
    if (c.macrozona != null) filas.push(['Promedio ' + r.macrozona, c.macrozona]);
    if (c.tamano != null) filas.push(['Empresas de tu tamaño (' + String(r.tamano).toLowerCase() + ')', c.tamano]);
    $('#r-comp').innerHTML = '<table><tr><th>Comparación</th><th>Promedio</th><th>Tu empresa</th></tr>' + filas.map(function (f) {
      return '<tr><td>' + esc(f[0]) + '</td><td>' + f[1] + '%</td><td>' + difTxt(r.global, f[1]) + '</td></tr>';
    }).join('') + '</table><p class="muted small">Comparación con ' + c.n + ' evaluaciones de empresas del sector.</p>';
    $('#r-ambitos').innerHTML = r.ambitos.map(function (a, i) {
      return '<div class="amb"><img src="img/' + AMB[i].icon + '.png" alt=""><div><div class="nom">' + esc(a.nombre) + ' <span class="chip ' + a.nivel + '">' + a.nivel + '</span></div>' +
        '<div class="bar"><i style="width:' + a.valor + '%"></i><b style="left:calc(' + a.nacional + '% - 1px)" title="Promedio nacional"></b></div>' +
        '<div class="ref">Nacional ' + a.nacional + '%' + (a.macrozona != null ? ' · Macrozona ' + a.macrozona + '%' : '') + ' · ' + difTxt(a.valor, a.nacional) + '</div></div>' +
        '<div class="val">' + a.valor + '%</div></div>';
    }).join('');
    var q = '?id=' + encodeURIComponent(j.id) + '&t=' + encodeURIComponent(j.t);
    $('#descargar').href = '/api/informe' + q;
    $('#enlace').href = location.origin + '/' + q;
    $('#para').value = j.email || '';
    var m = $('#envio-msg'); m.className = 'msg'; m.textContent = '';
    if (j.correo) {
      m.className = 'msg ' + (j.correo.ok ? 'ok' : 'err');
      m.textContent = j.correo.ok ? '✓ Enviamos el informe a ' + j.correo.para.join(', ') + '. Revisa también la carpeta de spam.' : j.correo.error;
    }
    mostrar('v-res');
  }
  function enviarCorreo() {
    var b = $('#enviar'), m = $('#envio-msg'), para = $('#para').value.trim();
    if (!para) { m.className = 'msg err'; m.textContent = 'Escribe al menos un correo.'; return; }
    b.disabled = true; m.className = 'msg'; m.textContent = 'Enviando…';
    fetch('/api/enviar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: actual.id, t: actual.t, para: para }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); })
      .then(function (j) { m.className = 'msg ok'; m.textContent = '✓ Informe enviado a ' + j.para.join(', ') + '. Revisa también la carpeta de spam.'; })
      .catch(function (e) { m.className = 'msg err'; m.textContent = e.message; })
      .then(function () { b.disabled = false; });
  }

  // ---------- inicio ----------
  $('#comenzar').onclick = function () { mostrar('v-form'); irA(0); };
  $('#atras').onclick = function () { if (paso > 0) irA(paso - 1); };
  $('#siguiente').onclick = function () {
    if (!validarPaso()) return;
    if (paso < PASOS.length - 1) irA(paso + 1); else enviar();
  };
  $('#enviar').onclick = enviarCorreo;
  $('#otra').onclick = function () { datos = { respuestas: {} }; borrarBorrador(); try { history.replaceState(null, '', '/'); } catch (e) {} construir(); mostrar('v-inicio'); };

  leerBorrador();
  construir();
  var u = new URLSearchParams(location.search);
  if (u.get('id') && u.get('t')) {
    fetch('/api/resultado?id=' + encodeURIComponent(u.get('id')) + '&t=' + encodeURIComponent(u.get('t')))
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error); return j; }); })
      .then(verResultado)
      .catch(function () { mostrar('v-inicio'); });
  } else if (Object.keys(datos.respuestas).length || datos.empresa) {
    $('#comenzar').textContent = 'Continuar donde quedé';
  }
})();
