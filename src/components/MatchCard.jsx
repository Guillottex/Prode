import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, IconButton, TextField, Typography
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import {
  bandera, colorEstado, etiquetaEstado, fechaArgentina, horaArgentina, nombreFase
} from '../utils/partidos.js';

function Equipo({ nombre, alineacion = 'left' }) {
  return (
    <Box sx={{ flex: 1, textAlign: alineacion, minWidth: 0 }}>
      <Typography sx={{ fontSize: 28, lineHeight: 1 }}>{bandera(nombre)}</Typography>
      <Typography
        sx={{
          fontFamily: '"Archivo", sans-serif',
          fontWeight: 700,
          fontSize: { xs: 13, sm: 15 },
          mt: 0.5,
          overflowWrap: 'break-word'
        }}
      >
        {nombre}
      </Typography>
    </Box>
  );
}

/**
 * Tarjeta de partido.
 *
 * Props:
 *  - partido:    doc de /partidos
 *  - estado:     estado efectivo ('abierto' | 'bloqueado' | 'finalizado')
 *  - pronostico: doc de /pronosticos del usuario para este partido (o null)
 *  - editable:   muestra inputs de goles (pantalla Mis Pronósticos)
 *  - onGuardar:  async ({golesLocal, golesVisitante}) => void
 *  - puntos:     puntos obtenidos (partidos finalizados)
 */
export default function MatchCard({ partido, estado, pronostico, editable = false, onGuardar, puntos }) {
  const [gl, setGl] = useState(pronostico?.golesLocal ?? '');
  const [gv, setGv] = useState(pronostico?.golesVisitante ?? '');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setGl(pronostico?.golesLocal ?? '');
    setGv(pronostico?.golesVisitante ?? '');
  }, [pronostico?.golesLocal, pronostico?.golesVisitante]);

  const abierto = estado === 'abierto';
  const finalizado = estado === 'finalizado';
  const cambio =
    gl !== '' && gv !== '' &&
    (Number(gl) !== pronostico?.golesLocal || Number(gv) !== pronostico?.golesVisitante);

  async function guardar() {
    if (!onGuardar || gl === '' || gv === '') return;
    setGuardando(true);
    try {
      await onGuardar({ golesLocal: Number(gl), golesVisitante: Number(gv) });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.8, sm: 2.4 } }}>
        {/* Encabezado: fase + estado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {nombreFase(partido.fase)}{partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
          </Typography>
          <Chip
            size="small"
            color={colorEstado(estado)}
            icon={estado === 'bloqueado' ? <LockRoundedIcon /> : undefined}
            label={etiquetaEstado(estado)}
          />
        </Box>

        {/* Equipos + marcador / inputs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Equipo nombre={partido.local} alineacion="center" />

          <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 } }}>
            {finalizado ? (
              <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 30, color: 'primary.dark' }}>
                {partido.resultado_local} - {partido.resultado_visitante}
              </Typography>
            ) : editable && abierto ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <TextField
                  value={gl}
                  onChange={(e) => /^\d{0,2}$/.test(e.target.value) && setGl(e.target.value)}
                  inputProps={{ inputMode: 'numeric', style: { textAlign: 'center', fontWeight: 800, fontSize: 20 } }}
                  sx={{ width: 56 }}
                  size="small"
                />
                <Typography sx={{ fontWeight: 800, color: 'text.secondary' }}>-</Typography>
                <TextField
                  value={gv}
                  onChange={(e) => /^\d{0,2}$/.test(e.target.value) && setGv(e.target.value)}
                  inputProps={{ inputMode: 'numeric', style: { textAlign: 'center', fontWeight: 800, fontSize: 20 } }}
                  sx={{ width: 56 }}
                  size="small"
                />
              </Box>
            ) : pronostico ? (
              <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26, color: 'text.secondary' }}>
                {pronostico.golesLocal} - {pronostico.golesVisitante}
              </Typography>
            ) : (
              <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 26, color: '#C2D4E0' }}>
                VS
              </Typography>
            )}
          </Box>

          <Equipo nombre={partido.visitante} alineacion="center" />
        </Box>

        {/* Pie: fecha, estadio, acciones */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
            {fechaArgentina(partido)} · {horaArgentina(partido)}
          </Typography>
          {partido.estadio && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PlaceRoundedIcon sx={{ fontSize: 16 }} /> {partido.estadio}{partido.ciudad ? `, ${partido.ciudad}` : ''}
            </Typography>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {finalizado && puntos != null && (
            <Chip
              size="small"
              label={`+${puntos} pts`}
              sx={{
                fontWeight: 800,
                bgcolor: puntos >= 10 ? 'secondary.main' : puntos > 0 ? 'rgba(0,174,239,.15)' : '#F0F0F0',
                color: puntos >= 10 ? '#5c4a00' : puntos > 0 ? 'primary.dark' : 'text.secondary'
              }}
            />
          )}

          {finalizado && pronostico && (
            <Typography variant="caption" color="text.secondary">
              Tu pronóstico: {pronostico.golesLocal}-{pronostico.golesVisitante}
            </Typography>
          )}

          {editable && abierto && (
            <Button
              variant="contained"
              size="small"
              disabled={!cambio || guardando}
              onClick={guardar}
              startIcon={guardado ? <CheckCircleRoundedIcon /> : undefined}
              color={guardado ? 'success' : 'primary'}
            >
              {guardado ? 'Guardado' : guardando ? 'Guardando…' : pronostico ? 'Actualizar' : 'Guardar'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
