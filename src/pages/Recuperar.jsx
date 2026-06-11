import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { gradienteAzul } from '../theme.js';
import LogoBA from '../components/LogoBA.jsx';

export default function Recuperar() {
  const { recuperar } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  async function enviar() {
    setError('');
    try {
      await recuperar(email.trim());
      setEnviado(true);
    } catch {
      setError('No se pudo enviar el correo. Verificá la dirección.');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: gradienteAzul, display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', mb: 2 }}>
            <LogoBA size={48} conTexto={false} />
          </Box>
          <Typography variant="h5" align="center" sx={{ color: 'primary.dark', mb: 2 }}>
            Recuperar contraseña
          </Typography>

          {enviado ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Te enviamos un correo con las instrucciones para restablecer tu contraseña.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField label="Correo electrónico" type="email" fullWidth value={email}
                onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3 }} />
              <Button variant="contained" fullWidth size="large" onClick={enviar}>
                Enviar instrucciones
              </Button>
            </>
          )}

          <Typography align="center" variant="body2" sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login">Volver al ingreso</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
