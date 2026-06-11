import { Box, Typography } from '@mui/material';

/**
 * Logo institucional BA (Buenos Aires Ciudad).
 * Usa la imagen oficial ubicada en /public/logo-ba.jpeg.
 */
export default function LogoBA({ size = 40, conTexto = true, claro = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        component="img"
        src="/logo-ba.jpeg"
        alt="Buenos Aires Ciudad"
        sx={{
          height: size,
          width: 'auto',
          borderRadius: 1.5,
          backgroundColor: '#fff',
          p: 0.4,
          flexShrink: 0
        }}
      />
      {conTexto && (
        <Box sx={{ lineHeight: 1.05 }}>
          <Typography
            sx={{
              fontFamily: '"Archivo", sans-serif',
              fontWeight: 800,
              fontSize: size * 0.3,
              color: claro ? '#fff' : 'text.primary'
            }}
          >
            DGFIS
          </Typography>
          <Typography
            sx={{
              fontSize: size * 0.24,
              color: claro ? 'rgba(255,255,255,.85)' : 'text.secondary',
              fontWeight: 600
            }}
          >
            Dirección General de Fiscalización
          </Typography>
        </Box>
      )}
    </Box>
  );
}
