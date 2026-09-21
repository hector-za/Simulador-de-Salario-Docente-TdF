import { obtenerUsuarioDesdeToken, supabaseAdmin } from '../../../lib/supabaseAdmin';
import { crearSuscripcion } from '../../../lib/mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const usuario = await obtenerUsuarioDesdeToken(req.headers.authorization);
  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const suscripcion = await crearSuscripcion(usuario.email, usuario.id);

    // Se guarda el id de la suscripción ya en este momento (en estado "pendiente"),
    // para que el webhook la pueda encontrar después aunque llegue antes de que
    // el usuario vuelva a la pantalla del panel.
    await supabaseAdmin
      .from('perfiles')
      .update({ mercadopago_suscripcion_id: suscripcion.id })
      .eq('id', usuario.id);

    return res.status(200).json({ init_point: suscripcion.init_point });
  } catch (err) {
    console.error('Error creando suscripción en Mercado Pago:', err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago con Mercado Pago' });
  }
}
