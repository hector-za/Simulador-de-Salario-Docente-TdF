// FASE 1 del proyecto: el simulador es de acceso libre y gratuito, sin login
// ni suscripción. La página /panel (con todo el paywall ya armado) queda
// lista y sin usar para la FASE 2, cuando se sume la normativa — ver README.
export default function Inicio() {
  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '20px' }}>
      <iframe
        src="/simulador-salario-docente.html"
        title="Simulador de Salario Docente"
        style={{ width: '100%', height: '95vh', border: 'none', borderRadius: '14px' }}
      />
    </div>
  );
}
