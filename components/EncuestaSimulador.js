import { useEffect, useState } from 'react';

// Se guarda en el navegador de cada visitante para no volver a mostrar la
// encuesta una vez que la respondió o la cerró (aparece una sola vez).
const CLAVE_LOCALSTORAGE = 'encuestaSimuladorEstado';

const OPCIONES_SATISFACCION = ['Muy útil', 'Útil', 'Regular', 'Poco útil'];
const OPCIONES_NIVEL = ['Inicial', 'Primario', 'Secundario', 'Superior'];

export default function EncuestaSimulador() {
  const [fase, setFase] = useState('oculta'); // oculta | invitacion | formulario | enviando | enviado
  const [satisfaccion, setSatisfaccion] = useState('');
  const [nivel, setNivel] = useState('');
  const [mail, setMail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const yaRespondida = window.localStorage.getItem(CLAVE_LOCALSTORAGE);
    if (yaRespondida) return;
    // Se espera a que la persona ya haya tenido tiempo de usar el simulador
    // antes de mostrarle la invitación, en vez de interrumpirla apenas entra.
    const temporizador = setTimeout(() => setFase('invitacion'), 20000);
    return () => clearTimeout(temporizador);
  }, []);

  function descartar() {
    window.localStorage.setItem(CLAVE_LOCALSTORAGE, 'descartada');
    setFase('oculta');
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setFase('enviando');
    try {
      const respuesta = await fetch('/api/encuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satisfaccion: satisfaccion || null,
          nivel_educativo: nivel || null,
          mail: mail || null,
        }),
      });
      if (!respuesta.ok) throw new Error('No se pudo enviar');
      window.localStorage.setItem(CLAVE_LOCALSTORAGE, 'completada');
      setFase('enviado');
      setTimeout(() => setFase('oculta'), 4000);
    } catch (err) {
      setError('No se pudo enviar la respuesta. Probá de nuevo en un momento.');
      setFase('formulario');
    }
  }

  if (fase === 'oculta') return null;

  return (
    <div style={estilos.contenedorFlotante}>
      {fase === 'invitacion' && (
        <div style={estilos.tarjetaFlotante}>
          <button style={estilos.botonCerrar} onClick={descartar} aria-label="Cerrar">×</button>
          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>¿Nos contás qué te pareció el simulador?</p>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Es opcional, te lleva un minuto.
          </p>
          <button className="boton" onClick={() => setFase('formulario')}>Responder</button>
        </div>
      )}

      {(fase === 'formulario' || fase === 'enviando') && (
        <div style={estilos.tarjetaFlotante}>
          <button style={estilos.botonCerrar} onClick={descartar} aria-label="Cerrar">×</button>
          <form onSubmit={enviar}>
            {error && <div className="mensaje-error">{error}</div>}

            <p style={estilos.pregunta}>¿Qué te pareció el simulador?</p>
            {OPCIONES_SATISFACCION.map((op) => (
              <label key={op} style={estilos.opcionRadio}>
                <input
                  type="radio"
                  name="satisfaccion"
                  checked={satisfaccion === op}
                  onChange={() => setSatisfaccion(op)}
                />{' '}
                {op}
              </label>
            ))}

            <p style={estilos.pregunta}>¿En qué nivel educativo te desempeñás?</p>
            {OPCIONES_NIVEL.map((op) => (
              <label key={op} style={estilos.opcionRadio}>
                <input
                  type="radio"
                  name="nivel"
                  checked={nivel === op}
                  onChange={() => setNivel(op)}
                />{' '}
                {op}
              </label>
            ))}

            <p style={estilos.pregunta}>Opcional: dejanos tu mail si querés que te avisemos de novedades</p>
            <input
              type="email"
              placeholder="tu@mail.com"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              style={estilos.inputMail}
            />

            <button type="submit" className="boton" style={{ marginTop: '14px' }} disabled={fase === 'enviando'}>
              {fase === 'enviando' ? 'Enviando...' : 'Enviar respuesta'}
            </button>
          </form>
        </div>
      )}

      {fase === 'enviado' && (
        <div style={estilos.tarjetaFlotante}>
          <p className="mensaje-ok" style={{ margin: 0 }}>¡Gracias por tu respuesta!</p>
        </div>
      )}
    </div>
  );
}

const estilos = {
  contenedorFlotante: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    maxWidth: '320px',
  },
  tarjetaFlotante: {
    position: 'relative',
    background: 'var(--paper)',
    color: 'var(--ink)',
    border: '1px solid var(--navy-700)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-lg)',
    padding: '20px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  botonCerrar: {
    position: 'absolute',
    top: '8px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'var(--ink-soft)',
    lineHeight: 1,
  },
  pregunta: {
    fontWeight: 600,
    fontSize: '14px',
    margin: '14px 0 6px',
  },
  opcionRadio: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '4px',
    cursor: 'pointer',
  },
  inputMail: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #c7d1e6',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
};
