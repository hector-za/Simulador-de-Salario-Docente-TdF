// Cliente de Supabase con la "service role key": tiene permisos totales sobre
// la base de datos, sin pasar por las políticas de seguridad (RLS).
//
// MUY IMPORTANTE: este archivo solo se debe importar desde código que corre
// en el servidor (carpeta pages/api). Si se importara desde una página React,
// la clave secreta terminaría expuesta en el navegador de cualquier visitante.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'clave-de-reserva';

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Recibe el header "Authorization: Bearer <token>" que manda el navegador
// (el token de sesión del usuario logueado) y devuelve el usuario al que
// pertenece, verificándolo contra Supabase. Si el token no es válido, o no
// vino ninguno, devuelve null.
export async function obtenerUsuarioDesdeToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
