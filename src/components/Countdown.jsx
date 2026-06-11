import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

function partes(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms % 86_400_000) / 3_600_000),
    m: Math.floor((ms % 3_600_000) / 60_000),
    s: Math.floor((ms % 60_000) / 1000)
  };
}

/** Cuenta regresiva hasta `hasta` (Date). */
export default function Countdown({ hasta, etiqueta }) {
  const [restante, setRestante] = useState(() => (hasta ? hasta.getTime() - Date.now() : 0));

  useEffect(() => {
    if (!hasta) return undefined;
    const id = setInterval(() => setRestante(hasta.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasta]);

  if (!hasta) return null;
  const { d, h, m, s } = partes(restante);

  const Celda = ({ valor, unidad }) => (
    <Box sx={{ textAlign: 'center', minWidth: 52, bgcolor: 'rgba(255,255,255,.14)', borderRadius: 2, px: 1, py: 0.6 }}>
      <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, fontSize: 22, color: '#fff', lineHeight: 1.1 }}>
        {String(valor).padStart(2, '0')}
      </Typography>
      <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {unidad}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {etiqueta && (
        <Typography sx={{ color: 'rgba(255,255,255,.9)', fontSize: 13, mb: 0.8, fontWeight: 600 }}>{etiqueta}</Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Celda valor={d} unidad="días" />
        <Celda valor={h} unidad="hs" />
        <Celda valor={m} unidad="min" />
        <Celda valor={s} unidad="seg" />
      </Box>
    </Box>
  );
}
