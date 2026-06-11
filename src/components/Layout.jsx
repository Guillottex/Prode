import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, BottomNavigation, BottomNavigationAction, Box, Button, Chip,
  Container, Divider, IconButton, Menu, MenuItem, Paper, Toolbar, Typography, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useAuth } from '../context/AuthContext.jsx';
import { gradienteBA } from '../theme.js';
import LogoBA from './LogoBA.jsx';

const ITEMS = [
  { ruta: '/', etiqueta: 'Inicio', icono: <HomeRoundedIcon /> },
  { ruta: '/pronosticos', etiqueta: 'Pronósticos', icono: <EditNoteRoundedIcon /> },
  { ruta: '/fixture', etiqueta: 'Fixture', icono: <CalendarMonthRoundedIcon /> },
  { ruta: '/ranking', etiqueta: 'Ranking', icono: <EmojiEventsRoundedIcon /> }
];

export default function Layout({ children }) {
  const { perfil, esAdmin, salir } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const esCelular = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const iniciales = `${perfil?.nombre?.[0] ?? ''}${perfil?.apellido?.[0] ?? ''}`.toUpperCase() || 'U';

  async function cerrarSesion() {
    setAnchorEl(null);
    await salir();
    navigate('/login');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pb: esCelular ? 9 : 0 }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', color: 'text.primary', borderBottom: '1px solid #E3EDF4' }}>
        {/* Hilo de gradiente BA: firma visual institucional */}
        <Box sx={{ height: 4, background: gradienteBA }} />
        <Toolbar sx={{ gap: 2 }}>
          <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogoBA size={38} conTexto={!esCelular} />
            {esCelular && (
              <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 900, color: 'primary.main' }}>
                PRODE 2026
              </Typography>
            )}
          </Box>

          {!esCelular && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 3, flexGrow: 1 }}>
              {ITEMS.map((it) => (
                <Button
                  key={it.ruta}
                  component={RouterLink}
                  to={it.ruta}
                  startIcon={it.icono}
                  sx={{
                    color: location.pathname === it.ruta ? 'primary.main' : 'text.secondary',
                    bgcolor: location.pathname === it.ruta ? 'rgba(0,133,202,.08)' : 'transparent'
                  }}
                >
                  {it.etiqueta}
                </Button>
              ))}
              {esAdmin && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminPanelSettingsRoundedIcon />}
                  sx={{
                    color: location.pathname.startsWith('/admin') ? '#8a6d00' : 'text.secondary',
                    bgcolor: location.pathname.startsWith('/admin') ? 'rgba(255,209,0,.18)' : 'transparent'
                  }}
                >
                  Administración
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ flexGrow: esCelular ? 1 : 0 }} />

          <Chip
            icon={<SportsSoccerIcon />}
            label={`${perfil?.puntaje ?? 0} pts`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700 }}
          />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
              {iniciales}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{perfil?.nombre} {perfil?.apellido}</Typography>
              <Typography variant="body2" color="text.secondary">{perfil?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil'); }}>Mi Perfil</MenuItem>
            {esAdmin && esCelular && (
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }}>Administración</MenuItem>
            )}
            <MenuItem onClick={cerrarSesion}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, flexGrow: 1 }}>
        {children}
      </Container>

      {esCelular && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, borderTop: '1px solid #E3EDF4' }} elevation={8}>
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_, ruta) => navigate(ruta)}
          >
            {ITEMS.map((it) => (
              <BottomNavigationAction key={it.ruta} label={it.etiqueta} value={it.ruta} icon={it.icono} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
