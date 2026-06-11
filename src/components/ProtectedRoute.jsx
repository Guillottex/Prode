import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege rutas por sesión y, opcionalmente, por rol.
 *   <ProtectedRoute>...</ProtectedRoute>            -> requiere sesión
 *   <ProtectedRoute soloAdmin>...</ProtectedRoute>  -> requiere rol admin
 */
export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { user, perfil, esAdmin, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  if (perfil && perfil.activo === false) return <Navigate to="/login?inactivo=1" replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;

  return children;
}
