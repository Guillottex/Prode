import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Grid, Typography
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { gradienteBA } from '../../theme.js';

function Metrica({ icono, etiqueta, valor, color }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center',
          background: color ?? gradienteBA, color: '#fff'
        }}>
          {icono}
        </Box>
        <Box>
          <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 28, lineHeight: 1 }}>
            {valor ?? '…'}
          </Typography>
          <Typography variant="body2" color="text.secondary">{etiqueta}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [m, setM] = useState({});

  useEffect(() => {
    async function cargar() {
      const [usuarios, pronosticos, jugados, pendientes] = await Promise.all([
        getCountFromServer(collection(db, 'usuarios')),
        getCountFromServer(collection(db, 'pronosticos')),
        getCountFromServer(query(collection(db, 'partidos'), where('estado', '==', 'finalizado'))),
        getCountFromServer(query(collection(db, 'partidos'), where('estado', '!=', 'finalizado')))
      ]);
      setM({
        usuarios: usuarios.data().count,
        pronosticos: pronosticos.data().count,
        jugados: jugados.data().count,
        pendientes: pendientes.data().count
      });
    }
    cargar();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Administración · Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Estado general del Prode Mundial 2026 de DGFIS.
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Metrica icono={<GroupsRoundedIcon />} etiqueta="Usuarios registrados" valor={m.usuarios} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Metrica icono={<EditNoteRoundedIcon />} etiqueta="Pronósticos cargados" valor={m.pronosticos}
            color="linear-gradient(135deg,#0085CA,#00AEEF)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Metrica icono={<SportsScoreRoundedIcon />} etiqueta="Partidos jugados" valor={m.jugados}
            color="linear-gradient(135deg,#2E9E5B,#6CCB8B)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Metrica icono={<PendingActionsRoundedIcon />} etiqueta="Partidos pendientes" valor={m.pendientes}
            color="linear-gradient(135deg,#B58900,#FFD100)" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Gestión de Usuarios</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Crear o quitar administradores y desactivar participantes.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin/usuarios">Abrir</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Gestión de Partidos</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bloqueo de pronósticos, carga de resultados oficiales y configuración del bloqueo automático.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin/partidos">Abrir</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
