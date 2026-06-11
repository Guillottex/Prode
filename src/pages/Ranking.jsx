import {
  Avatar, Box, Card, Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useAuth } from '../context/AuthContext.jsx';
import { useRanking } from '../utils/hooks.js';
import { gradienteBA, BA } from '../theme.js';

export default function Ranking() {
  const { perfil } = useAuth();
  const { usuarios, cargando } = useRanking();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsRoundedIcon sx={{ color: BA.amarillo }} /> Ranking general
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Se actualiza en tiempo real cada vez que se carga un resultado oficial.
      </Typography>

      {cargando ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, color: 'primary.dark' } }}>
                  <TableCell width={70}>Pos.</TableCell>
                  <TableCell>Participante</TableCell>
                  <TableCell align="right">Puntaje</TableCell>
                  <TableCell align="right">Aciertos exactos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u, i) => (
                  <TableRow
                    key={u.id}
                    sx={{ bgcolor: u.id === perfil?.uid ? 'rgba(0,174,239,.08)' : 'inherit' }}
                  >
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 30, height: 30, fontSize: 13, fontWeight: 800,
                          background: i < 3 ? gradienteBA : '#DCE8F0',
                          color: i < 3 ? '#fff' : 'text.secondary'
                        }}
                      >
                        {i + 1}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {u.nombre} {u.apellido} {u.id === perfil?.uid && '(vos)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{u.area}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontFamily: '"Archivo", sans-serif', fontWeight: 800, color: 'primary.dark' }}>
                        {u.puntaje}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{u.aciertosExactos ?? 0}</TableCell>
                  </TableRow>
                ))}
                {usuarios.length === 0 && (
                  <TableRow><TableCell colSpan={4}>Todavía no hay participantes.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
