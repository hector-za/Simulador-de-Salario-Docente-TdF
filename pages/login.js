import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (errorLogin) {
      setError('Correo o contraseña incorrectos.');
      return;
    }

    router.push('/panel');
  }

  return (
    <div className="contenedor">
      <h1 className="titulo-principal">Iniciar sesión</h1>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="boton" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          ¿Todavía no tenés cuenta? <a href="/registro">Crear cuenta</a>
        </p>
      </div>
    </div>
  );
}
