import { useMemo } from 'react';
import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { useMisPronosticos, useRanking } from '../utils/hooks.js';
import { gradienteAzul, gradienteBA } from '../theme.js';

function Dato({ etiqueta, valor }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', fontWeight: 700 }}>
        {etiqueta}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{valor || '—'}</Typography>
    </Box>
  );
}

export default function Perfil() {
  const { perfil } = useAuth();
  const { pronosticos } = useMisPronosticos();
  const { usuarios } = useRanking();

  const posicion = useMemo(() => {
    const i = usuarios.findIndex((u) => u.id === perfil?.uid);
    return i >= 0 ? i + 1 : null;
  }, [usuarios, perfil]);

  const conPuntos = pronosticos.filter((p) => (p.puntos ?? 0) > 0).length;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Mi Perfil</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ background: gradienteAzul, color: '#fff' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 1.5, background: gradienteBA, fontSize: 26, fontWeight: 900 }}>
                {`${perfil?.nombre?.[0] ?? ''}${perfil?.apellido?.[0] ?? ''}`.toUpperCase()}
              </Avatar>
              <Typography variant="h6">{perfil?.nombre} {perfil?.apellido}</Typography>
              <Typography sx={{ opacity: 0.85, fontSize: 14 }}>{perfil?.area}</Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26 }}>{perfil?.puntaje ?? 0}</Typography>
                  <Typography sx={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85 }}>Puntos</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26 }}>{perfil?.aciertosExactos ?? 0}</Typography>
                  <Typography sx={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85 }}>Exactos</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26 }}>{posicion ? `#${posicion}` : '—'}</Typography>
                  <Typography sx={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85 }}>Ranking</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Datos personales</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}><Dato etiqueta="Nombre" valor={perfil?.nombre} /></Grid>
                <Grid item xs={12} sm={6}><Dato etiqueta="Apellido" valor={perfil?.apellido} /></Grid>
                <Grid item xs={12} sm={6}><Dato etiqueta="Legajo" valor={perfil?.legajo} /></Grid>
                <Grid item xs={12} sm={6}><Dato etiqueta="Área" valor={perfil?.area} /></Grid>
                <Grid item xs={12}><Dato etiqueta="Correo electrónico" valor={perfil?.email} /></Grid>
                <Grid item xs={12} sm={6}><Dato etiqueta="Pronósticos cargados" valor={pronosticos.length} /></Grid>
                <Grid item xs={12} sm={6}><Dato etiqueta="Pronósticos con puntos" valor={conPuntos} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
