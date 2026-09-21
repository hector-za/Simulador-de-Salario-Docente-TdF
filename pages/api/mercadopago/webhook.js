import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { obtenerSuscripcion } from '../../../lib/mercadopago';

// Mercado Pago manda el aviso de dos formas posibles según la configuración:
// como parámetros en la URL (?type=subscription_preapproval&data.id=XXX) o
// como cuerpo JSON ({ type: 'subscription_preapproval', data: { id: 'XXX' } }).
// Esta función junta ambas formas en un solo resultado.
function extraerIdYTipo(req) {
  const tipo = req.query.type || req.query.topic || req.body?.type;
  const id = req.query['data.id'] || req.body?.data?.id;
  return { tipo, id };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end();
  }

  const { tipo, id } = extraerIdYTipo(req);

  // Se responde 200 rápido salvo que directamente no haya nada que procesar,
  // para que Mercado Pago no reintente de más. Cualquier error se registra
  // igual en los logs del servidor para poder revisarlo.
  if (!id || (tipo !== 'subscription_preapproval' && tipo !== 'preapproval')) {
    return res.status(200).end();
  }

  try {
    // No hay que confiar en los datos que vienen en el aviso: se vuelve a
    // consultar el estado real y actual de la suscripción directamente a la API.
    const suscripcion = await obtenerSuscripcion(id);
    const activo = suscripcion.status === 'authorized';

    // Se busca primero por el id de suscripción guardado, y si no aparece
    // (por ejemplo, la suscripción se creó por fuera del flujo normal), se
    // usa como respaldo el external_reference, que guardamos como el id de
    // usuario de Supabase al crear la suscripción.
    const { data: filasActualizadas } = await supabaseAdmin
      .from('perfiles')
      .update({
        estado_suscripcion: activo ? 'activo' : 'inactivo',
        mercadopago_suscripcion_id: id,
      })
      .eq('mercadopago_suscripcion_id', id)
      .select('id');

    if (!filasActualizadas || filasActualizadas.length === 0) {
      if (suscripcion.external_reference) {
        await supabaseAdmin
          .from('perfiles')
          .update({
            estado_suscripcion: activo ? 'activo' : 'inactivo',
            mercadopago_suscripcion_id: id,
          })
          .eq('id', suscripcion.external_reference);
      }
    }

    return res.status(200).end();
  } catch (err) {
    console.error('Error procesando webhook de Mercado Pago:', err);
    // Se devuelve 200 igual: si el error persiste, es mejor revisarlo en los
    // logs que hacer que Mercado Pago reintente indefinidamente el mismo aviso.
    return res.status(200).end();
  }
}
