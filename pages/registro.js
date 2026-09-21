import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Registro() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error: errorRegistro } = await supabase.auth.signUp({
      email,
      password,
    });

    setCargando(false);

    if (errorRegistro) {
      setError(errorRegistro.message);
      return;
    }

    // Según cómo esté configurada la confirmación de mail en Supabase (ver
    // README), acá el usuario puede quedar logueado directo, o necesitar
    // confirmar el mail antes de poder entrar.
    setExito(true);
  }

  if (exito) {
    return (
      <div className="contenedor">
        <div className="tarjeta">
          <p className="mensaje-ok">
            ¡Listo! Te enviamos un mail a <strong>{email}</strong> para confirmar tu cuenta.
            Una vez confirmada, iniciá sesión para suscribirte.
          </p>
          <a href="/login" className="boton">Ir a iniciar sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <h1 className="titulo-principal">Crear mi cuenta</h1>
      <div className="tarjeta">
        {error && <div className="mensaje-error">{error}</div>}
        <form onSubmit={manejarEnvio}>
          <div className="campo">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="boton" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          ¿Ya tenés cuenta? <a href="/login">Iniciar sesión</a>
        </p>
      </div>
    </div>
  );
}
