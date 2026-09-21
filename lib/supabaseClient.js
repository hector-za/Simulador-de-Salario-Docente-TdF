// Cliente de Supabase pensado para usarse DESDE EL NAVEGADOR (páginas React).
// Usa la "anon key", que es pública por diseño: no da acceso a nada que las
// políticas de seguridad (RLS) de la base de datos no permitan.
import { createClient } from '@supabase/supabase-js';

// Mientras el sitio funcione solo con el simulador (Fase 1), todavía no hace
// falta tener Supabase configurado. Estos valores de reserva evitan que la
// compilación se rompa por esa razón; el día que se activen las cuentas
// (Fase 2, normativa con suscripción), completar las variables de entorno
// reales hace que todo esto empiece a funcionar de verdad.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'clave-de-reserva';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
