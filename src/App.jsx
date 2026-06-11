import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Recuperar from './pages/Recuperar.jsx';
import Inicio from './pages/Inicio.jsx';
import Pronosticos from './pages/Pronosticos.jsx';
import Fixture from './pages/Fixture.jsx';
import Ranking from './pages/Ranking.jsx';
import Perfil from './pages/Perfil.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsuarios from './pages/admin/Usuarios.jsx';
import AdminPartidos from './pages/admin/Partidos.jsx';

function Privada({ children, soloAdmin }) {
  return (
    <ProtectedRoute soloAdmin={soloAdmin}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<Recuperar />} />

      {/* Usuario */}
      <Route path="/" element={<Privada><Inicio /></Privada>} />
      <Route path="/pronosticos" element={<Privada><Pronosticos /></Privada>} />
      <Route path="/fixture" element={<Privada><Fixture /></Privada>} />
      <Route path="/ranking" element={<Privada><Ranking /></Privada>} />
      <Route path="/perfil" element={<Privada><Perfil /></Privada>} />

      {/* Administración */}
      <Route path="/admin" element={<Privada soloAdmin><AdminDashboard /></Privada>} />
      <Route path="/admin/usuarios" element={<Privada soloAdmin><AdminUsuarios /></Privada>} />
      <Route path="/admin/partidos" element={<Privada soloAdmin><AdminPartidos /></Privada>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
