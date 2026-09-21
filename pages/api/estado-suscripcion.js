import { supabaseAdmin, obtenerUsuarioDesdeToken } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const usuario = await obtenerUsuarioDesdeToken(req.headers.authorization);
  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { data: perfil, error } = await supabaseAdmin
    .from('perfiles')
    .select('estado_suscripcion')
    .eq('id', usuario.id)
    .single();

  if (error) {
    return res.status(500).json({ error: 'No se pudo consultar el estado de la suscripción' });
  }

  return res.status(200).json({ activo: perfil?.estado_suscripcion === 'activo' });
}
