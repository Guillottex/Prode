import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Snackbar, Tab, Tabs,
  TextField, Typography
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  collection, doc, getDocs, increment, query, setDoc, Timestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useConfig, usePartidos } from '../../utils/hooks.js';
import { calcularPuntos, PUNTOS } from '../../utils/scoring.js';
import {
  bandera, estadoEfectivo, FASES, fechaArgentina, horaArgentina
} from '../../utils/partidos.js';

const OPCIONES_BLOQUEO = [5, 15, 30, 60];

/**
 * Carga un resultado oficial y recalcula puntajes:
 *  1. Actualiza el partido (resultado + estado finalizado)
 *  2. Recalcula los puntos de todos los pronósticos del partido
 *  3. Aplica los deltas de puntaje y aciertos exactos a cada usuario
 */
async function guardarResultado(partido, golesLocal, golesVisitante) {
  await updateDoc(doc(db, 'partidos', String(partido.id)), {
    resultado_local: golesLocal,
    resultado_visitante: golesVisitante,
    estado: 'finalizado'
  });

  const snap = await getDocs(
    query(collection(db, 'pronosticos'), where('partidoId', '==', partido.id))
  );

  const resultado = { local: golesLocal, visitante: golesVisitante };
  const deltas = {}; // uid -> { puntos, exactos }
  const batch = writeBatch(db);

  snap.forEach((d) => {
    const p = d.data();
    const nuevos = calcularPuntos(p, resultado);
    const previos = p.puntos ?? 0;
    const eraExacto = previos === PUNTOS.EXACTO ? 1 : 0;
    const esExacto = nuevos === PUNTOS.EXACTO ? 1 : 0;

    batch.update(d.ref, { puntos: nuevos });

    if (!deltas[p.uid]) deltas[p.uid] = { puntos: 0, exactos: 0 };
    deltas[p.uid].puntos += nuevos - previos;
    deltas[p.uid].exactos += esExacto - eraExacto;
  });
  await batch.commit();

  const actualizaciones = Object.entries(deltas)
    .filter(([, d]) => d.puntos !== 0 || d.exactos !== 0)
    .map(([uid, d]) =>
      updateDoc(doc(db, 'usuarios', uid), {
        puntaje: increment(d.puntos),
        aciertosExactos: increment(d.exactos)
      })
    );
  await Promise.all(actualizaciones);
}

export default function Partidos() {
  const config = useConfig();
  const { partidos } = usePartidos();
  const [fase, setFase] = useState('grupos');
  const [aviso, setAviso] = useState(null); // {tipo, texto}
  const [resultado, setResultado] = useState(null); // partido en edición de resultado
  const [gl, setGl] = useState('');
  const [gv, setGv] = useState('');
  const [edicion, setEdicion] = useState(null); // partido en edición de datos
  const [ocupado, setOcupado] = useState(false);

  const visibles = useMemo(() => partidos.filter((p) => p.fase === fase), [partidos, fase]);

  async function cambiarBloqueoAutomatico(min) {
    await setDoc(doc(db, 'configuracion', 'general'), { bloqueoAutomaticoMinutos: min }, { merge: true });
    setAviso({ tipo: 'success', texto: `Bloqueo automático: ${min} minutos antes de cada partido.` });
  }

  async function alternarBloqueo(p) {
    const nuevo = p.estado === 'bloqueado' ? 'abierto' : 'bloqueado';
    await updateDoc(doc(db, 'partidos', String(p.id)), { estado: nuevo });
    setAviso({
      tipo: 'info',
      texto: nuevo === 'bloqueado'
        ? `Pronósticos bloqueados: ${p.local} vs ${p.visitante}.`
        : `Pronósticos abiertos: ${p.local} vs ${p.visitante}.`
    });
  }

  function abrirResultado(p) {
    setGl(p.resultado_local ?? '');
    setGv(p.resultado_visitante ?? '');
    setResultado(p);
  }

  async function confirmarResultado() {
    if (gl === '' || gv === '') return;
    setOcupado(true);
    try {
      await guardarResultado(resultado, Number(gl), Number(gv));
      setAviso({ tipo: 'success', texto: 'Resultado guardado. Puntajes y ranking actualizados.' });
      setResultado(null);
    } catch (e) {
      setAviso({ tipo: 'error', texto: 'No se pudo guardar el resultado.' });
    } finally {
      setOcupado(false);
    }
  }

  async function confirmarEdicion() {
    setOcupado(true);
    try {
      const datos = {
        local: edicion.local,
        visitante: edicion.visitante,
        estadio: edicion.estadio ?? '',
        ciudad: edicion.ciudad ?? ''
      };
      if (edicion.fechaHoraLocal) {
        // datetime-local interpretado como hora argentina (UTC-3)
        datos.timestamp = Timestamp.fromDate(new Date(`${edicion.fechaHoraLocal}:00-03:00`));
      }
      await updateDoc(doc(db, 'partidos', String(edicion.id)), datos);
      setAviso({ tipo: 'success', texto: 'Partido actualizado.' });
      setEdicion(null);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Gestión de Partidos</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Bloqueá pronósticos, cargá resultados oficiales y editá los cruces de eliminatorias.
      </Typography>

      {/* Configuración de bloqueo automático */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <LockRoundedIcon color="primary" />
          <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>
            Bloqueo automático de pronósticos
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Minutos antes del partido</InputLabel>
            <Select
              label="Minutos antes del partido"
              value={config.bloqueoAutomaticoMinutos ?? 30}
              onChange={(e) => cambiarBloqueoAutomatico(e.target.value)}
            >
              {OPCIONES_BLOQUEO.map((m) => (
                <MenuItem key={m} value={m}>{m} minutos antes</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Tabs
        value={fase}
        onChange={(_, v) => setFase(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: '1px solid #E3EDF4' }}
      >
        {FASES.map((f) => <Tab key={f.id} value={f.id} label={f.nombre} />)}
      </Tabs>

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {visibles.map((p) => {
          const efectivo = estadoEfectivo(p, config.bloqueoAutomaticoMinutos);
          return (
            <Card key={p.id}>
              <CardContent sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, py: 1.6 }}>
                <Chip size="small" label={`#${p.orden}`} variant="outlined" />
                <Box sx={{ minWidth: 240, flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {bandera(p.local)} {p.local}
                    {p.estado === 'finalizado'
                      ? `  ${p.resultado_local} - ${p.resultado_visitante}  `
                      : ' vs '}
                    {p.visitante} {bandera(p.visitante)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fechaArgentina(p)} · {horaArgentina(p)}{p.grupo ? ` · Grupo ${p.grupo}` : ''}{p.estadio ? ` · ${p.estadio}` : ''}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={efectivo === 'abierto' ? 'Disponible' : efectivo === 'finalizado' ? 'Finalizado' : 'Bloqueado'}
                  color={efectivo === 'abierto' ? 'success' : efectivo === 'finalizado' ? 'default' : 'warning'}
                />

                {p.estado !== 'finalizado' && (
                  <Button
                    size="small"
                    variant={p.estado === 'bloqueado' ? 'outlined' : 'contained'}
                    color={p.estado === 'bloqueado' ? 'success' : 'warning'}
                    startIcon={p.estado === 'bloqueado' ? <LockOpenRoundedIcon /> : <LockRoundedIcon />}
                    onClick={() => alternarBloqueo(p)}
                  >
                    {p.estado === 'bloqueado' ? 'ABRIR PRONÓSTICOS' : 'BLOQUEAR PRONÓSTICOS'}
                  </Button>
                )}

                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SportsScoreRoundedIcon />}
                  onClick={() => abrirResultado(p)}
                >
                  {p.estado === 'finalizado' ? 'Corregir resultado' : 'Cargar resultado'}
                </Button>

                <Button
                  size="small"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => setEdicion({
                    ...p,
                    fechaHoraLocal: ''
                  })}
                >
                  Editar
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {visibles.length === 0 && (
          <Alert severity="info">
            No hay partidos en esta fase. Ejecutá el script de importación (npm run seed) para cargar el fixture.
          </Alert>
        )}
      </Box>

      {/* Dialogo: resultado oficial */}
      <Dialog open={!!resultado} onClose={() => !ocupado && setResultado(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Resultado oficial</DialogTitle>
        <DialogContent>
          {resultado && (
            <>
              <Typography sx={{ mb: 2, fontWeight: 600 }}>
                {resultado.local} vs {resultado.visitante}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label={`Goles ${resultado.local}`}
                  value={gl}
                  onChange={(e) => /^\d{0,2}$/.test(e.target.value) && setGl(e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  fullWidth
                />
                <Typography sx={{ fontWeight: 800 }}>-</Typography>
                <TextField
                  label={`Goles ${resultado.visitante}`}
                  value={gv}
                  onChange={(e) => /^\d{0,2}$/.test(e.target.value) && setGv(e.target.value)}
                  inputProps={{ inputMode: 'numeric' }}
                  fullWidth
                />
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                Al guardar se recalculan automáticamente los puntajes y el ranking.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultado(null)} disabled={ocupado}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarResultado} disabled={ocupado || gl === '' || gv === ''}>
            {ocupado ? 'Guardando…' : 'Guardar resultado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo: editar partido (equipos / fecha de eliminatorias) */}
      <Dialog open={!!edicion} onClose={() => !ocupado && setEdicion(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar partido #{edicion?.orden}</DialogTitle>
        <DialogContent>
          {edicion && (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={6}>
                <TextField label="Local" fullWidth value={edicion.local}
                  onChange={(e) => setEdicion({ ...edicion, local: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Visitante" fullWidth value={edicion.visitante}
                  onChange={(e) => setEdicion({ ...edicion, visitante: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Estadio" fullWidth value={edicion.estadio ?? ''}
                  onChange={(e) => setEdicion({ ...edicion, estadio: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Ciudad" fullWidth value={edicion.ciudad ?? ''}
                  onChange={(e) => setEdicion({ ...edicion, ciudad: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Fecha y hora (Argentina)"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={edicion.fechaHoraLocal}
                  onChange={(e) => setEdicion({ ...edicion, fechaHoraLocal: e.target.value })}
                  helperText="Dejar vacío para no modificar el horario actual"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdicion(null)} disabled={ocupado}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarEdicion} disabled={ocupado}>
            {ocupado ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!aviso} autoHideDuration={4000} onClose={() => setAviso(null)}>
        <Alert severity={aviso?.tipo ?? 'info'} onClose={() => setAviso(null)}>{aviso?.texto}</Alert>
      </Snackbar>
    </Box>
  );
}
