import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Grid, Link, TextField, Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { gradienteAzul } from '../theme.js';
import LogoBA from '../components/LogoBA.jsx';

const CAMPOS_INICIALES = {
  nombre: '', apellido: '', legajo: '', area: '', email: '', password: '', password2: ''
};

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState(CAMPOS_INICIALES);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (campo) => (e) => setF({ ...f, [campo]: e.target.value });

  async function enviar() {
    setError('');
    if (!f.nombre || !f.apellido || !f.legajo || !f.area || !f.email) {
      setError('Completá todos los campos.');
      return;
    }
    if (f.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (f.password !== f.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      await registrar({
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim(),
        legajo: f.legajo.trim(),
        area: f.area.trim(),
        email: f.email.trim(),
        password: f.password
      });
      navigate('/');
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use'
        ? 'Ese correo ya está registrado.'
        : 'No se pudo crear la cuenta. Intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: gradienteAzul, display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', mb: 2 }}>
            <LogoBA size={48} conTexto={false} />
          </Box>
          <Typography variant="h5" align="center" sx={{ color: 'primary.dark', mb: 0.5 }}>
            Crear cuenta
          </Typography>
          <Typography align="center" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Prode Mundial 2026 · DGFIS
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Nombre" fullWidth value={f.nombre} onChange={set('nombre')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Apellido" fullWidth value={f.apellido} onChange={set('apellido')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Legajo" fullWidth value={f.legajo} onChange={set('legajo')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Área" fullWidth value={f.area} onChange={set('area')} /></Grid>
            <Grid item xs={12}><TextField label="Correo electrónico" type="email" fullWidth value={f.email} onChange={set('email')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Contraseña" type="password" fullWidth value={f.password} onChange={set('password')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Repetir contraseña" type="password" fullWidth value={f.password2} onChange={set('password2')} /></Grid>
          </Grid>

          <Button variant="contained" fullWidth size="large" sx={{ mt: 3 }} onClick={enviar} disabled={cargando}>
            {cargando ? 'Creando cuenta…' : 'Registrarme'}
          </Button>

          <Typography align="center" variant="body2" sx={{ mt: 2 }}>
            ¿Ya tenés cuenta? <Link component={RouterLink} to="/login">Ingresar</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
