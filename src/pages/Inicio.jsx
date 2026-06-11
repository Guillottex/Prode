import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Grid, List, ListItem, ListItemAvatar,
  ListItemText, Skeleton, Typography
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useAuth } from '../context/AuthContext.jsx';
import { useConfig, useMisPronosticos, usePartidos, useRanking } from '../utils/hooks.js';
import { estadoEfectivo, inicioPartido } from '../utils/partidos.js';
import { gradienteAzul, gradienteBA, BA } from '../theme.js';
import MatchCard from '../components/MatchCard.jsx';
import Countdown from '../components/Countdown.jsx';

export default function Inicio() {
  const { perfil } = useAuth();
  const config = useConfig();
  const { partidos, cargando } = usePartidos();
  const { porPartido } = useMisPronosticos();
  const { usuarios } = useRanking();

  const proximos = useMemo(() => {
    const ahora = Date.now();
    return partidos
      .filter((p) => {
        const d = inicioPartido(p);
        return p.estado !== 'finalizado' && d && d.getTime() > ahora;
      })
      .sort((a, b) => inicioPartido(a) - inicioPartido(b))
      .slice(0, 4);
  }, [partidos]);

  const miPosicion = useMemo(() => {
    const i = usuarios.findIndex((u) => u.id === perfil?.uid);
    return i >= 0 ? i + 1 : null;
  }, [usuarios, perfil]);

  const top10 = usuarios.slice(0, 10);
  const proximo = proximos[0];

  return (
    <Box>
      {/* ====== Banner principal ====== */}
      <Card sx={{ background: gradienteAzul, color: '#fff', mb: 3, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: gradienteBA, opacity: 0.18, pointerEvents: 'none' }} />
        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative' }}>
          <Typography sx={{ fontWeight: 700, letterSpacing: 2, fontSize: 12, opacity: 0.9, textTransform: 'uppercase' }}>
            Dirección General de Fiscalización · Gobierno de la Ciudad de Buenos Aires
          </Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 44 }, mt: 1 }}>
            PRODE MUNDIAL <Box component="span" sx={{ color: BA.amarillo }}>FIFA 2026</Box>
          </Typography>
          <Typography sx={{ opacity: 0.92, mt: 1, maxWidth: 560 }}>
            Cargá tus pronósticos, sumá puntos en cada partido y competí con todo DGFIS
            por el primer puesto del ranking.
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }} alignItems="flex-end">
            <Grid item xs={12} md="auto">
              {proximo && (
                <Countdown
                  hasta={inicioPartido(proximo)}
                  etiqueta={`Próximo partido: ${proximo.local} vs ${proximo.visitante}`}
                />
              )}
            </Grid>
            <Grid item xs="auto">
              <Box sx={{ bgcolor: 'rgba(255,255,255,.14)', borderRadius: 2, px: 2, py: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.85 }}>
                  Tu posición
                </Typography>
                <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26 }}>
                  {miPosicion ? `#${miPosicion}` : '—'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs="auto">
              <Box sx={{ bgcolor: 'rgba(255,255,255,.14)', borderRadius: 2, px: 2, py: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.85 }}>
                  Puntos
                </Typography>
                <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26 }}>
                  {perfil?.puntaje ?? 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* ====== Próximos partidos ====== */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsSoccerIcon color="primary" /> Próximos partidos
            </Typography>
            <Button component={RouterLink} to="/pronosticos" size="small">Cargar pronósticos</Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {cargando && [1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={150} />)}
            {!cargando && proximos.length === 0 && (
              <Card><CardContent>
                <Typography color="text.secondary">
                  No hay partidos próximos cargados. El fixture aparecerá acá cuando esté disponible.
                </Typography>
              </CardContent></Card>
            )}
            {proximos.map((p) => (
              <MatchCard
                key={p.id}
                partido={p}
                estado={estadoEfectivo(p, config.bloqueoAutomaticoMinutos)}
                pronostico={porPartido[p.id] ?? null}
              />
            ))}
          </Box>
        </Grid>

        {/* ====== Ranking Top 10 ====== */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsRoundedIcon sx={{ color: BA.amarillo }} /> Ranking Top 10
            </Typography>
            <Button component={RouterLink} to="/ranking" size="small">Ver completo</Button>
          </Box>

          <Card>
            <List dense disablePadding>
              {top10.map((u, i) => (
                <ListItem
                  key={u.id}
                  divider={i < top10.length - 1}
                  sx={{
                    bgcolor: u.id === perfil?.uid ? 'rgba(0,174,239,.08)' : 'transparent',
                    py: 1
                  }}
                  secondaryAction={
                    <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 800, color: 'primary.dark' }}>
                      {u.puntaje} pts
                    </Typography>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 32, height: 32, fontSize: 13, fontWeight: 800,
                        background: i < 3 ? gradienteBA : '#DCE8F0',
                        color: i < 3 ? '#fff' : 'text.secondary'
                      }}
                    >
                      {i + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${u.nombre} ${u.apellido}`}
                    secondary={`${u.aciertosExactos ?? 0} exactos`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                  />
                </ListItem>
              ))}
              {top10.length === 0 && (
                <ListItem><ListItemText primary="Todavía no hay participantes con puntos." /></ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
