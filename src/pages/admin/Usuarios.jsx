import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, Snackbar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Usuarios() {
  const { perfil } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('apellido', 'asc'));
    return onSnapshot(q, (snap) => {
      setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const visibles = usuarios.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.email} ${u.legajo}`.toLowerCase().includes(filtro.toLowerCase())
  );

  async function cambiarRol(u) {
    const nuevo = u.rol === 'admin' ? 'usuario' : 'admin';
    if (u.id === perfil.uid && nuevo === 'usuario') {
      setAviso('No podés quitarte tu propio rol de administrador.');
      return;
    }
    await updateDoc(doc(db, 'usuarios', u.id), { rol: nuevo });
    setAviso(nuevo === 'admin' ? `${u.nombre} ahora es administrador.` : `${u.nombre} ya no es administrador.`);
  }

  async function cambiarActivo(u) {
    if (u.id === perfil.uid) {
      setAviso('No podés desactivar tu propia cuenta.');
      return;
    }
    await updateDoc(doc(db, 'usuarios', u.id), { activo: !(u.activo !== false) });
  }

  async function eliminar(u) {
    if (u.id === perfil.uid) return;
    if (!window.confirm(`¿Eliminar el perfil de ${u.nombre} ${u.apellido}? Sus pronósticos dejarán de contar en el ranking.`)) return;
    await deleteDoc(doc(db, 'usuarios', u.id));
    setAviso('Perfil eliminado. Recordá borrar también la cuenta en Firebase Authentication.');
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Gestión de Usuarios</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Promové administradores, desactivá participantes o eliminá perfiles.
      </Typography>

      <TextField
        placeholder="Buscar por nombre, legajo o correo…"
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 420 }}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 800, color: 'primary.dark' } }}>
                <TableCell>Participante</TableCell>
                <TableCell>Legajo</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Puntaje</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</Typography>
                    <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                  </TableCell>
                  <TableCell>{u.legajo}</TableCell>
                  <TableCell>{u.area}</TableCell>
                  <TableCell>
                    <Chip size="small" label={u.rol}
                      color={u.rol === 'admin' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={u.activo === false ? 'Inactivo' : 'Activo'}
                      color={u.activo === false ? 'error' : 'success'} variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{u.puntaje ?? 0}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" onClick={() => cambiarRol(u)}>
                      {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    </Button>
                    <Button size="small" color="warning" onClick={() => cambiarActivo(u)}>
                      {u.activo === false ? 'Activar' : 'Desactivar'}
                    </Button>
                    <Button size="small" color="error" onClick={() => eliminar(u)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar open={!!aviso} autoHideDuration={4000} onClose={() => setAviso('')}>
        <Alert severity="info" onClose={() => setAviso('')}>{aviso}</Alert>
      </Snackbar>
    </Box>
  );
}
