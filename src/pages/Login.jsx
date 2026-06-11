import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Link, TextField, Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { gradienteAzul } from '../theme.js';
import LogoBA from '../components/LogoBA.jsx';

export default function Login() {
  const { ingresar } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    setError('');
    setCargando(true);
    try {
      await ingresar(email.trim(), password);
      navigate('/');
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: gradienteAzul, display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', mb: 2 }}>
            <LogoBA size={52} conTexto={false} />
          </Box>
          <Typography variant="h5" align="center" sx={{ color: 'primary.dark' }}>
            PRODE MUNDIAL FIFA 2026
          </Typography>
          <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Dirección General de Fiscalización · Buenos Aires Ciudad
          </Typography>

          {params.get('inactivo') && (
            <Alert severity="warning" sx={{ mb: 2 }}>Tu cuenta fue desactivada. Consultá con un administrador.</Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField label="Correo electrónico" type="email" fullWidth value={email}
            onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Contraseña" type="password" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }}
            onKeyDown={(e) => e.key === 'Enter' && enviar()} />

          <Button variant="contained" fullWidth size="large" onClick={enviar} disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Link component={RouterLink} to="/recuperar" variant="body2">Olvidé mi contraseña</Link>
            <Link component={RouterLink} to="/registro" variant="body2">Crear cuenta</Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
