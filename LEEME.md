# Scanner de Industrialización · CDT-CChC

Sitio web del scanner con:

- **Formulario** con las mismas preguntas del formulario de Google anterior.
- **Resultados en pantalla** al terminar.
- **Botón "Descargar informe (PDF)"**, con el mismo diseño del informe que se enviaba antes.
- **Botón "Enviar por correo"**, que acepta uno o varios correos.
- **Base de datos** incluida en Netlify (Netlify Blobs): no necesita cuentas externas.
- **Página de administración** (`/admin.html`) para ver las respuestas, descargarlas en Excel (CSV), bajar el PDF de cualquier empresa y reenviar informes.

Las comparaciones (nacional, macrozona y tamaño) usan las 111 respuestas del scanner anterior más todas las nuevas. De las anteriores solo se guardaron los puntajes, sin nombres ni correos.

---

## Publicarlo en Netlify (una sola vez, unos 20 minutos)

### 1. Subir el proyecto a GitHub
1. Crea una cuenta gratuita en https://github.com (o usa la de la organización).
2. Arriba a la derecha: **+ > New repository**. Nombre: `scanner-industrializacion`. Márcalo como **Private** y crea el repositorio.
3. En el repositorio vacío haz clic en **"uploading an existing file"**.
4. Descomprime el ZIP y arrastra **todo el contenido de la carpeta** (no la carpeta misma) a la página.
5. Haz clic en **Commit changes**.

### 2. Conectar con Netlify
1. Crea una cuenta en https://app.netlify.com. Puedes entrar con la misma cuenta de GitHub.
2. **Add new project > Import an existing project > GitHub** y elige `scanner-industrializacion`.
3. No cambies nada de la configuración y haz clic en **Deploy**. En 1 a 2 minutos tendrás una dirección del tipo `https://nombre.netlify.app`.
4. Opcional: en **Domain management** puedes cambiar el nombre (por ejemplo `scanner-industrializacion.netlify.app`) o usar un dominio propio.

### 3. Configurar las variables, en Netlify: *Project configuration > Environment variables*

| Variable | Valor | Para qué |
|---|---|---|
| `ADMIN_CLAVE` | una clave larga que solo tú conozcas | entrar a `/admin.html` |
| `MAIL_FROM` | `Scanner de Industrialización <productividad@cchc.cl>` | remitente de los correos |
| `MAIL_REPLY_TO` | `productividad@cchc.cl` | a dónde llegan las respuestas |
| `MAIL_BCC` | (opcional) tu correo | recibir copia de cada informe enviado |

Más **una** de estas opciones de envío de correo:

**Opción A, recomendada: la cuenta de Google de productividad@cchc.cl.** Requiere que esa cuenta tenga la verificación en 2 pasos activada.
1. Entra con productividad@cchc.cl a https://myaccount.google.com/apppasswords y crea una "contraseña de aplicación" llamada *Scanner*.
2. Agrega estas variables:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `productividad@cchc.cl`
   - `SMTP_PASS` = la contraseña de 16 letras que te dio Google
3. Si no aparece la opción de contraseñas de aplicación, pídele a TI que la habilite para esa cuenta.

**Opción B: Brevo** (gratis hasta 300 correos al día).
1. Crea una cuenta en https://www.brevo.com.
2. En **Senders**, agrega productividad@cchc.cl y confírmalo desde ese buzón.
3. Para que los correos no lleguen a spam, pídele a TI que autentique el dominio cchc.cl en Brevo (*Domains > Authenticate*).
4. Crea una API key en **SMTP & API > API Keys** y agrégala como `BREVO_API_KEY`.

Después de guardar las variables: **Deploys > Trigger deploy > Deploy project** para que se apliquen.

### 4. Probar
1. Abre el sitio, responde el scanner con una empresa de prueba, descarga el PDF y envíatelo por correo.
2. Entra a `https://tu-sitio.netlify.app/admin.html` con tu clave: ahí debe aparecer la respuesta de prueba.

### 5. Difundir
Reemplaza el enlace del formulario de Google por la nueva dirección en el QR, los correos y los afiches.

---

## Respuestas del formulario de Google anterior
1. En `/admin.html`, abre **"Importar respuestas del formulario de Google anterior"**, elige `respuestas-formulario-google.json` y haz clic en **Importar**. No se duplican si lo repites.
2. Para enviar los informes que no llegaron, abre **"Enviar informes pendientes"**, elige la fecha desde la cual enviar y haz clic en **Enviar pendientes**. Puedes incluir una nota de disculpa por la demora.

## Uso diario
- **Ver y descargar respuestas:** `/admin.html` → "Descargar todas las respuestas". Se abre en Excel.
- **Reenviar un informe:** en `/admin.html`, botón **Enviar** en la fila de la empresa.
- **Cambiar textos de recomendaciones o preguntas:** `lib/scanner.mjs` y `lib/preguntas.mjs`. Edítalos en GitHub (ícono del lápiz) y Netlify se actualiza solo.

## Estructura
```
public/            sitio (index.html, app.js, estilos.css, admin.html, imágenes)
netlify/functions  API: responder, resultado, informe (PDF), enviar (correo), admin
lib/               cálculo del scanner, PDF, base de datos, correo, datos históricos
```
