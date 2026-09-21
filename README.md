# Simulador de Salario Docente

El proyecto se piensa en dos fases:

- **Fase 1 (la actual)**: el simulador es de acceso libre y gratuito, sin
  login ni pago. Es todo lo que hace falta para publicar el sitio HOY. No
  necesitás crear ninguna cuenta de Supabase ni Mercado Pago todavía.
- **Fase 2 (más adelante)**: cuando tengas armada la normativa, se activa el
  login y la suscripción paga (ya construidos y probados) para darle acceso
  solo a quien pague. Esa parte del sitio (`/panel`, `/login`, `/registro`,
  las rutas de `/api/mercadopago`) ya está lista, simplemente no está
  enlazada desde ningún lado todavía.

Contame en el chat en qué paso estás y seguimos desde ahí — no hace falta que
hagas todo de una sola vez.

## Fase 1 — Publicar el simulador (gratis, sin cuentas extra)

Con esto alcanza para tener el sitio en línea hoy mismo:

1. Subí esta carpeta a un repositorio de GitHub (o pedime ayuda y lo hacemos
   juntos).
2. Entrá a https://vercel.com, creá una cuenta, y elegí **Add New > Project**,
   importando ese repositorio. No hace falta cargar ninguna variable de
   entorno para esta fase.
3. Hacé clic en **Deploy**. En unos minutos vas a tener una URL pública
   (por ejemplo `simulador-docente-tdf.vercel.app`) mostrando el simulador.
4. Si querés un dominio propio, se conecta desde **Project Settings >
   Domains** en Vercel, una vez que lo hayas comprado en cualquier
   registrador (NIC Argentina, por ejemplo).

Y listo — no hace falta nada más mientras estés en esta fase.

## Fase 2 — Activar la normativa con suscripción paga

Cuando tengas la normativa lista, avisame y decidimos juntos cómo mostrarla
(¿lista de PDFs? ¿buscador? ¿por categoría?), la cargamos, y recién ahí
seguís con estos pasos para activar el cobro:

### 1. Crear el proyecto en Supabase (base de datos + login)

1. Entrá a https://supabase.com, creá una cuenta y un proyecto nuevo (elegí
   la región más cercana, por ejemplo São Paulo).
2. Andá a **SQL Editor > New query**, pegá todo el contenido del archivo
   `supabase-schema.sql` de esta carpeta, y ejecutalo. Esto crea la tabla
   `perfiles` donde se guarda el estado de cada suscripción.
3. Andá a **Authentication > Providers** y confirmá que "Email" esté
   habilitado (viene así por defecto).
4. Opcional: en **Authentication > Settings**, podés desactivar "Confirm
   email" si preferís que la gente pueda entrar apenas se registra, sin
   confirmar el mail primero. Para un sitio real recomiendo dejarlo activado.
5. Andá a **Project Settings > API** y copiá estos tres valores (los vas a
   necesitar en el paso 4):
   - `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (¡ojo, esta es secreta, no la compartas!) → va en
     `SUPABASE_SERVICE_ROLE_KEY`

### 2. Crear la aplicación en Mercado Pago

1. Entrá a https://www.mercadopago.com.ar/developers/panel con tu cuenta de
   Mercado Pago.
2. Creá una aplicación nueva (cualquier nombre, por ejemplo "Simulador
   Docente TdF").
3. En la sección de credenciales, copiá el **Access Token de producción**
   → va en `MP_ACCESS_TOKEN`. (Mientras estés probando, podés usar el de
   prueba, pero para cobrar de verdad necesitás el de producción.)

### Crear el plan de suscripción (se hace una sola vez)

El "plan" define el precio y la frecuencia de cobro (mensual o anual). Se
crea una única vez con este comando, reemplazando los valores que quieras
(monto, frecuencia, nombre):

```bash
curl -X POST 'https://api.mercadopago.com/preapproval_plan' \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "reason": "Suscripción Simulador de Salario Docente TdF",
    "auto_recurring": {
      "frequency": 1,
      "frequency_type": "months",
      "transaction_amount": 5000,
      "currency_id": "ARS"
    },
    "back_url": "https://tu-dominio.com/panel"
  }'
```

- `frequency_type` puede ser `"months"` (mensual) o `"years"` (anual).
- `transaction_amount` es el precio en pesos.
- La respuesta trae un campo `"id"` → ese valor va en `MP_PLAN_ID`.

### Configurar el webhook (para que el acceso se active solo)

En el panel de tu aplicación de Mercado Pago, buscá la sección
**Webhooks / Notificaciones** y cargá esta URL (una vez que ya tengas el
sitio desplegado en el paso 4):

```
https://tu-dominio.com/api/mercadopago/webhook
```

Marcá el evento **"Suscripciones" / "subscription_preapproval"**.

### 3. Cargar las variables de entorno en Vercel y volver a desplegar

Como el sitio ya está publicado desde la Fase 1, esta vez las variables se
cargan directo en Vercel (no hace falta pasar por `.env.local`, salvo que
también quieras probarlo en tu computadora antes):

1. En el proyecto de Vercel, andá a **Settings > Environment Variables** y
   cargá las siete variables (las mismas que están listadas en
   `.env.local.example`, con los valores reales que juntaste en los pasos 1
   y 2).
2. Actualizá `NEXT_PUBLIC_SITE_URL` con la URL final del sitio, y cargá esa
   misma URL + `/api/mercadopago/webhook` como webhook en el panel de
   Mercado Pago (parte final del paso 2).
3. Andá a la pestaña **Deployments** y hacé **Redeploy** para que la nueva
   configuración se aplique.

Opcional, para probar en tu computadora antes de tocar producción: copiá
`.env.local.example` a `.env.local`, completalo, y corré `npm install` y
`npm run dev`. Eso sí, el webhook de Mercado Pago no le va a poder avisar a
tu compu (no tiene una dirección pública), así que el pago de punta a punta
solo se puede probar ya publicado.

### 4. Habilitar el acceso a la suscripción desde la portada

Ahora mismo `pages/index.js` muestra únicamente el simulador, sin ningún
link hacia `/login` ni `/panel`. Cuando quieras activar la Fase 2, hay que
agregar ahí un botón o link (por ejemplo "Normativa educativa — con
suscripción") que lleve a `/registro`. Avisame en ese momento y te lo dejo
armado con el precio y el texto que definas.

### 5. Cargar la normativa

Por ahora la pestaña "Normativa" del panel muestra un mensaje de "todavía no
hay contenido". Cuando tengas los documentos, contame cómo querés mostrarlos
(¿lista de PDFs para descargar? ¿texto buscable? ¿por categoría/año?) y
armamos esa sección.

### 6. Un par de cosas para no perder de vista

- **Monotributo**: para facturar este servicio de forma legal en Argentina
  necesitás estar inscripto en AFIP (monotributo social o el que corresponda).
  Sin eso podés cobrar por Mercado Pago igual, pero no vas a poder emitir
  comprobante fiscal.
- **Datos de contacto/soporte**: en algún lugar del sitio conviene dejar un
  mail o WhatsApp de contacto, por si a alguien le falla el pago o el acceso.
