import { useMemo, useState } from 'react';
import { Alert, Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useConfig, useMisPronosticos, usePartidos } from '../utils/hooks.js';
import { estadoEfectivo, FASES } from '../utils/partidos.js';
import MatchCard from '../components/MatchCard.jsx';

export default function Fixture() {
  const config = useConfig();
  const { partidos, cargando } = usePartidos();
  const { porPartido } = useMisPronosticos();
  const [fase, setFase] = useState('grupos');

  const visibles = useMemo(() => {
    const lista = partidos.filter((p) => p.fase === fase);
    if (fase !== 'grupos') return lista;
    // Fase de grupos agrupada por grupo
    return [...lista].sort((a, b) => (a.grupo ?? '').localeCompare(b.grupo ?? '') || a.orden - b.orden);
  }, [partidos, fase]);

  let grupoActual = null;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Fixture · Mundial 2026</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Fechas y horarios de Argentina. Estados Unidos, Canadá y México · 104 partidos.
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
          const encabezado = fase === 'grupos' && p.grupo !== grupoActual;
          grupoActual = p.grupo;
          return (
            <Box key={p.id} sx={{ display: 'grid', gap: 2 }}>
              {encabezado && (
                <Typography variant="h6" sx={{ mt: 1, color: 'primary.dark' }}>
                  Grupo {p.grupo}
                </Typography>
              )}
              <MatchCard
                partido={p}
                estado={estadoEfectivo(p, config.bloqueoAutomaticoMinutos)}
                pronostico={porPartido[p.id] ?? null}
                puntos={p.estado === 'finalizado' ? porPartido[p.id]?.puntos ?? null : null}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
