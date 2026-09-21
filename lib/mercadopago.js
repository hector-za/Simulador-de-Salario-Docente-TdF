// Funciones para hablar con la API de Suscripciones de Mercado Pago.
// Se usa "fetch" directo a la API REST (sin el SDK oficial) para no depender
// de una librería externa extra: son solo dos llamadas HTTP.

const MP_BASE_URL = 'https://api.mercadopago.com';

function headersMP() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
  };
}

// Crea una suscripción ("preapproval") asociada al plan que se configuró una
// única vez en Mercado Pago (ver README, paso "Crear el plan de suscripción").
// - emailUsuario: el mail del docente que se está por suscribir.
// - idUsuario: el id del usuario en Supabase (se guarda como "external_reference"
//   para poder identificarlo después, cuando llegue el aviso de pago).
// Devuelve el objeto de la suscripción creada, que incluye "init_point": el
// link de checkout al que hay que mandar al usuario para que pague.
export async function crearSuscripcion(emailUsuario, idUsuario) {
  const backUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/panel`;

  const respuesta = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: 'POST',
    headers: headersMP(),
    body: JSON.stringify({
      preapproval_plan_id: process.env.MP_PLAN_ID,
      reason: 'Suscripción — Simulador de Salario Docente TdF',
      external_reference: idUsuario,
      payer_email: emailUsuario,
      back_url: backUrl,
      status: 'pending',
    }),
  });

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos?.message || 'No se pudo crear la suscripción en Mercado Pago');
  }
  return datos;
}

// Consulta el estado actual de una suscripción por su id. Se usa desde el
// webhook, cuando Mercado Pago nos avisa que algo cambió, para confirmar
// qué cambió exactamente (no hay que confiar ciegamente en el aviso).
export async function obtenerSuscripcion(idSuscripcion) {
  const respuesta = await fetch(`${MP_BASE_URL}/preapproval/${idSuscripcion}`, {
    method: 'GET',
    headers: headersMP(),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos?.message || 'No se pudo consultar la suscripción en Mercado Pago');
  }
  return datos;
}
