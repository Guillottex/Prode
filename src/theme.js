import { createTheme } from '@mui/material/styles';

// Identidad visual: Buenos Aires Ciudad + Seleccion Argentina
export const BA = {
  amarillo: '#FFD100',
  celesteBA: '#00AEEF',
  azul: '#0085CA',
  celesteArg: '#6EC1E4',
  gris: '#4A4A4A',
  blanco: '#FFFFFF',
  fondo: '#F2F7FB'
};

// Gradiente del logo BA (amarillo -> celeste), firma visual de la app
export const gradienteBA = `linear-gradient(135deg, ${BA.amarillo} 0%, #9BD45A 45%, ${BA.celesteBA} 100%)`;
export const gradienteAzul = `linear-gradient(135deg, ${BA.azul} 0%, ${BA.celesteBA} 100%)`;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: BA.azul, light: BA.celesteBA, dark: '#00629B', contrastText: '#fff' },
    secondary: { main: BA.amarillo, contrastText: BA.gris },
    info: { main: BA.celesteArg },
    text: { primary: '#22313C', secondary: BA.gris },
    background: { default: BA.fondo, paper: '#FFFFFF' }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontFamily: '"Archivo", sans-serif', fontWeight: 900 },
    h2: { fontFamily: '"Archivo", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Archivo", sans-serif', fontWeight: 800 },
    h4: { fontFamily: '"Archivo", sans-serif', fontWeight: 800 },
    h5: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Archivo", sans-serif', fontWeight: 700 },
    button: { fontFamily: '"Archivo", sans-serif', fontWeight: 700, textTransform: 'none', letterSpacing: 0.2 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 70, 110, .08)',
          transition: 'transform .18s ease, box-shadow .18s ease',
          '&:hover': { boxShadow: '0 6px 22px rgba(0, 70, 110, .14)' }
        }
      }
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } }
    }
  }
});

export default theme;
