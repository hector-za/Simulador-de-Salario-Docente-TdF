import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { satisfaccion, nivel_educativo, mail } = req.body || {};

  try {
    const { error } = await supabaseAdmin.from('respuestas_encuesta').insert({
      satisfaccion: satisfaccion || null,
      nivel_educativo: nivel_educativo || null,
      mail: mail || null,
    });

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error guardando respuesta de encuesta:', err);
    return res.status(500).json({ error: 'No se pudo guardar la respuesta' });
  }
}
