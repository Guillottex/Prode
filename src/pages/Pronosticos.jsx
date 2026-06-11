import { useMemo, useState } from 'react';
import { Alert, Box, Skeleton, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useConfig, useMisPronosticos, usePartidos } from '../utils/hooks.js';
import { estadoEfectivo, FASES } from '../utils/partidos.js';
import MatchCard from '../components/MatchCard.jsx';

export default function Pronosticos() {
  const { user } = useAuth();
  const config = useConfig();
  const { partidos, cargando } = usePartidos();
  const { porPartido } = useMisPronosticos();
  const [fase, setFase] = useState('grupos');
  const [error, setError] = useState('');

  const visibles = useMemo(
    () => partidos.filter((p) => p.fase === fase),
    [partidos, fase]
  );

  async function guardar(partido, { golesLocal, golesVisitante }) {
    try {
      await setDoc(doc(db, 'pronosticos', `${user.uid}_${partido.id}`), {
        uid: user.uid,
        partidoId: String(partido.id),  // ← Ahora es string
        golesLocal,
        golesVisitante,
        fechaCarga: serverTimestamp()
      }, { merge: true });
    } catch {
      setError('No se pudo guardar. El partido puede haberse bloqueado.');
      throw new Error('bloqueado');
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Mis Pronósticos</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Podés cargar o modificar tus pronósticos hasta {config.bloqueoAutomaticoMinutos} minutos antes
        de cada partido (o hasta que el administrador los bloquee).
      </Typography>

      <Tabs
        value={fase}
        onChange={(_, v) => setFase(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: '1px solid #E3EDF4' }}
      >
        {FASES.map((f) => <Tab key={f.id} value={f.id} label={f.nombre} />)}
      </Tabs>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {cargando && [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={150} />)}
        {!cargando && visibles.length === 0 && (
          <Alert severity="info">Todavía no hay partidos cargados en esta fase.</Alert>
        )}
        {visibles.map((p) => {
          const estado = estadoEfectivo(p, config.bloqueoAutomaticoMinutos);
          return (
            <MatchCard
              key={p.id}
              partido={p}
              estado={estado}
              pronostico={porPartido[p.id] ?? null}
              editable
              onGuardar={(valores) => guardar(p, valores)}
              puntos={estado === 'finalizado' ? porPartido[p.id]?.puntos ?? 0 : null}
            />
          );
        })}
      </Box>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}
