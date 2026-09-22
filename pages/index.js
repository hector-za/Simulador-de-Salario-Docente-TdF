// FASE 1 del proyecto: el simulador es de acceso libre y gratuito, sin login
// ni suscripción. La página /panel (con todo el paywall ya armado) queda
// lista y sin usar para la FASE 2, cuando se sume la normativa — ver README.
//
// El iframe ocupa toda la pantalla a propósito (sin recuadro ni márgenes
// alrededor): el simulador ya trae su propio ancho máximo y su propio
// diseño responsive, así que envolverlo en otro contenedor angosto solo
// le restaba espacio y provocaba que partes del recibo quedaran recortadas.
import EncuestaSimulador from '../components/EncuestaSimulador';

export default function Inicio() {
  return (
    <>
      <iframe
        src="/simulador-salario-docente.html"
        title="Simulador de Salario Docente"
        style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      />
      <EncuestaSimulador />
    </>
  );
}
