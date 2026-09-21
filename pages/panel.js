// FASE 2 del proyecto (normativa con suscripción): esta página ya está lista
// y probada, pero mientras el sitio esté solo en la Fase 1 (simulador
// gratuito) no está enlazada desde ningún lado. Para activarla, ver el README.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// Estados posibles de la pantalla, para no mezclar "todavía no sé" con "ya sé
// que no está pagado": evita el parpadeo de mostrar el cartel de "suscribite"
// una fracción de segundo antes de confirmar que en realidad sí pagó.
const ESTADOS = {
  CARGANDO: 'cargando',
  SIN_SESION: 'sin_sesion',
  SIN_SUSCRIPCION: 'sin_suscripcion',
  ACTIVO: 'activo',
};

export default function Panel() {
  const router = useRouter();
  const [estado, setEstado] = useState(ESTADOS.CARGANDO);
  const [email, setEmail] = useState('');
  const [seccion, setSeccion] = useState('simulador'); // 'simulador' | 'normativa'
  const [generandoLink, setGenerandoLink] = useState(false);
  const [errorSuscripcion, setErrorSuscripcion] = useState('');

  useEffect(() => {
    verificarAcceso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verificarAcceso() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setEstado(ESTADOS.SIN_SESION);
      router.push('/login');
      return;
    }

    setEmail(session.user.email);

    const respuesta = await fetch('/api/estado-suscripcion', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!respuesta.ok) {
      setEstado(ESTADOS.SIN_SUSCRIPCION);
      return;
    }

    const datos = await respuesta.json();
    setEstado(datos.activo ? ESTADOS.ACTIVO : ESTADOS.SIN_SUSCRIPCION);
  }

  async function suscribirse() {
    setErrorSuscripcion('');
    setGenerandoLink(true);

    const { data: { session } } = await supabase.auth.getSession();
    const respuesta = await fetch('/api/mercadopago/crear-suscripcion', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const datos = await respuesta.json();
    setGenerandoLink(false);

    if (!respuesta.ok) {
      setErrorSuscripcion(datos?.error || 'No se pudo iniciar el pago. Probá de nuevo en unos minutos.');
      return;
    }

    // Se manda al usuario al checkout de Mercado Pago para que autorice el pago recurrente.
    window.location.href = datos.init_point;
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (estado === ESTADOS.CARGANDO || estado === ESTADOS.SIN_SESION) {
    return (
      <div className="contenedor">
        <p style={{ textAlign: 'center' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="barra-superior">
        <span>{email}</span>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>

      {estado === ESTADOS.SIN_SUSCRIPCION && (
        <div className="contenedor">
          <div className="tarjeta">
            <h2 style={{ textAlign: 'center', color: 'var(--navy-800)' }}>
              Activá tu suscripción para acceder
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
              Con la suscripción activa vas a poder usar el simulador de salario
              y consultar la normativa educativa provincial.
            </p>
            {errorSuscripcion && <div className="mensaje-error">{errorSuscripcion}</div>}
            <button className="boton" onClick={suscribirse} disabled={generandoLink}>
              {generandoLink ? 'Generando link de pago...' : 'Suscribirme'}
            </button>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '12px', textAlign: 'center' }}>
              Vas a ser redirigido a Mercado Pago para autorizar el pago recurrente.
              Si ya pagaste y todavía ves este mensaje, esperá un minuto y recargá
              la página — el acceso se activa automáticamente apenas Mercado Pago confirma el pago.
            </p>
          </div>
        </div>
      )}

      {estado === ESTADOS.ACTIVO && (
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '20px' }}>
          <div className="tabs">
            <button
              className={`tab ${seccion === 'simulador' ? 'activo' : ''}`}
              onClick={() => setSeccion('simulador')}
            >
              Simulador
            </button>
            <button
              className={`tab ${seccion === 'normativa' ? 'activo' : ''}`}
              onClick={() => setSeccion('normativa')}
            >
              Normativa
            </button>
          </div>

          {seccion === 'simulador' && (
            <iframe
              src="/simulador-salario-docente.html"
              title="Simulador de Salario Docente"
              style={{ width: '100%', height: '85vh', border: 'none', borderRadius: '14px' }}
            />
          )}

          {seccion === 'normativa' && (
            <div className="tarjeta">
              <h2 style={{ color: 'var(--navy-800)' }}>Normativa educativa</h2>
              <p style={{ color: 'var(--ink-soft)' }}>
                Todavía no se cargó contenido en esta sección. Muy pronto vas a
                poder consultar acá la normativa educativa de Tierra del Fuego.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
