import { useEffect, useState } from 'react';

function esIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function yaInstalada() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Botón para "instalar" el simulador como una app:
// - En Android y computadoras (Chrome/Edge), el propio navegador dispara un
//   evento ("beforeinstallprompt") cuando la página cumple los requisitos;
//   ahí mostramos nuestro botón, que al tocarlo abre el cartel nativo de
//   instalación del navegador.
// - En iPhone, Apple no permite disparar ese cartel desde código: se le
//   muestra en cambio una ayuda con los pasos manuales (Compartir > Agregar
//   a inicio).
export default function InstalarApp() {
  const [promptEvento, setPromptEvento] = useState(null);
  const [mostrarTipIOS, setMostrarTipIOS] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    if (yaInstalada()) {
      setInstalada(true);
      return;
    }

    const manejarPrompt = (e) => {
      e.preventDefault();
      setPromptEvento(e);
    };
    window.addEventListener('beforeinstallprompt', manejarPrompt);
    window.addEventListener('appinstalled', () => setInstalada(true));

    const yaDescartado = window.localStorage.getItem('instalarAppDescartado');
    if (esIOS() && !yaDescartado) {
      setMostrarTipIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', manejarPrompt);
  }, []);

  async function instalar() {
    if (!promptEvento) return;
    promptEvento.prompt();
    const resultado = await promptEvento.userChoice;
    if (resultado.outcome === 'accepted') setInstalada(true);
    setPromptEvento(null);
  }

  function descartarTipIOS() {
    window.localStorage.setItem('instalarAppDescartado', 'si');
    setMostrarTipIOS(false);
  }

  if (instalada) return null;

  if (promptEvento) {
    return (
      <button onClick={instalar} style={estilos.boton}>
        📲 Instalar app
      </button>
    );
  }

  if (mostrarTipIOS) {
    return (
      <div style={estilos.tipIOS}>
        <button style={estilos.cerrar} onClick={descartarTipIOS} aria-label="Cerrar">×</button>
        Para instalar: tocá <strong>Compartir</strong> (el ícono del cuadrado con la flecha) y
        después <strong>"Agregar a inicio"</strong>.
      </div>
    );
  }

  return null;
}

const estilos = {
  boton: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 999,
    background: 'linear-gradient(180deg, #2f63b3, #163f85 60%, #123765)',
    color: '#e6c878',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
  },
  tipIOS: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 999,
    maxWidth: '280px',
    background: '#fbfaf5',
    color: '#1c2b36',
    borderRadius: '10px',
    padding: '14px 34px 14px 14px',
    fontSize: '13px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
  },
  cerrar: {
    position: 'absolute',
    top: '6px',
    right: '8px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#4d5c66',
  },
};
