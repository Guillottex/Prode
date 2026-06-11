import { BA } from '../theme.js';

export const FASES = [
  { id: 'grupos', nombre: 'Fase de Grupos' },
  { id: 'dieciseisavos', nombre: 'Dieciseisavos de Final' },
  { id: 'octavos', nombre: 'Octavos de Final' },
  { id: 'cuartos', nombre: 'Cuartos de Final' },
  { id: 'semifinal', nombre: 'Semifinales' },
  { id: 'tercer_puesto', nombre: 'Tercer Puesto' },
  { id: 'final', nombre: 'Final' }
];

export function nombreFase(id) {
  return FASES.find((f) => f.id === id)?.nombre ?? id;
}

/** Fecha/hora de inicio del partido como Date (o null si esta por confirmar). */
export function inicioPartido(partido) {
  if (partido?.timestamp?.toDate) return partido.timestamp.toDate();
  if (partido?.timestamp instanceof Date) return partido.timestamp;
  return null;
}

/**
 * Estado efectivo de un partido para el usuario:
 *  - 'finalizado'  -> tiene resultado oficial
 *  - 'bloqueado'   -> bloqueo manual del admin o bloqueo automatico por horario
 *  - 'abierto'     -> se pueden cargar/editar pronosticos
 *
 * @param {object} partido  doc de /partidos
 * @param {number} minutosBloqueo  minutos antes del inicio (config global)
 */
export function estadoEfectivo(partido, minutosBloqueo = 30) {
  if (!partido) return 'bloqueado';
  if (partido.estado === 'finalizado') return 'finalizado';
  if (partido.estado === 'bloqueado') return 'bloqueado';

  // Bloqueo automatico por horario
  const inicio = inicioPartido(partido);
  if (inicio) {
    const cierre = inicio.getTime() - minutosBloqueo * 60_000;
    if (Date.now() >= cierre) return 'bloqueado';
  }
  return 'abierto';
}

export function colorEstado(estado) {
  if (estado === 'abierto') return 'success';
  if (estado === 'finalizado') return 'default';
  return 'warning';
}

export function etiquetaEstado(estado) {
  if (estado === 'abierto') return 'Disponible';
  if (estado === 'finalizado') return 'Finalizado';
  return 'Bloqueado';
}

const FMT_FECHA = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Argentina/Buenos_Aires'
});

const FMT_HORA = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires'
});

export function fechaArgentina(partido) {
  const d = inicioPartido(partido);
  if (!d) return partido?.fecha ?? 'A confirmar';
  return FMT_FECHA.format(d);
}

export function horaArgentina(partido) {
  const d = inicioPartido(partido);
  if (!d) return partido?.hora ?? '--:--';
  return `${FMT_HORA.format(d)} hs`;
}

/** Banderas por nombre de equipo (emoji). */
const BANDERAS = {
  'Mexico': '\u{1F1F2}\u{1F1FD}', 'Sudafrica': '\u{1F1FF}\u{1F1E6}', 'Corea del Sur': '\u{1F1F0}\u{1F1F7}',
  'Republica Checa': '\u{1F1E8}\u{1F1FF}', 'Canada': '\u{1F1E8}\u{1F1E6}', 'Bosnia y Herzegovina': '\u{1F1E7}\u{1F1E6}',
  'Catar': '\u{1F1F6}\u{1F1E6}', 'Suiza': '\u{1F1E8}\u{1F1ED}', 'Brasil': '\u{1F1E7}\u{1F1F7}',
  'Marruecos': '\u{1F1F2}\u{1F1E6}', 'Haiti': '\u{1F1ED}\u{1F1F9}', 'Escocia': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
  'Estados Unidos': '\u{1F1FA}\u{1F1F8}', 'Paraguay': '\u{1F1F5}\u{1F1FE}', 'Australia': '\u{1F1E6}\u{1F1FA}',
  'Turquia': '\u{1F1F9}\u{1F1F7}', 'Alemania': '\u{1F1E9}\u{1F1EA}', 'Curazao': '\u{1F1E8}\u{1F1FC}',
  'Costa de Marfil': '\u{1F1E8}\u{1F1EE}', 'Ecuador': '\u{1F1EA}\u{1F1E8}', 'Paises Bajos': '\u{1F1F3}\u{1F1F1}',
  'Japon': '\u{1F1EF}\u{1F1F5}', 'Suecia': '\u{1F1F8}\u{1F1EA}', 'Tunez': '\u{1F1F9}\u{1F1F3}',
  'Belgica': '\u{1F1E7}\u{1F1EA}', 'Egipto': '\u{1F1EA}\u{1F1EC}', 'Iran': '\u{1F1EE}\u{1F1F7}',
  'Nueva Zelanda': '\u{1F1F3}\u{1F1FF}', 'Espana': '\u{1F1EA}\u{1F1F8}', 'Cabo Verde': '\u{1F1E8}\u{1F1FB}',
  'Arabia Saudita': '\u{1F1F8}\u{1F1E6}', 'Uruguay': '\u{1F1FA}\u{1F1FE}', 'Francia': '\u{1F1EB}\u{1F1F7}',
  'Senegal': '\u{1F1F8}\u{1F1F3}', 'Irak': '\u{1F1EE}\u{1F1F6}', 'Noruega': '\u{1F1F3}\u{1F1F4}',
  'Argentina': '\u{1F1E6}\u{1F1F7}', 'Argelia': '\u{1F1E9}\u{1F1FF}', 'Austria': '\u{1F1E6}\u{1F1F9}',
  'Jordania': '\u{1F1EF}\u{1F1F4}', 'Portugal': '\u{1F1F5}\u{1F1F9}', 'RD Congo': '\u{1F1E8}\u{1F1E9}',
  'Uzbekistan': '\u{1F1FA}\u{1F1FF}', 'Colombia': '\u{1F1E8}\u{1F1F4}', 'Inglaterra': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  'Croacia': '\u{1F1ED}\u{1F1F7}', 'Ghana': '\u{1F1EC}\u{1F1ED}', 'Panama': '\u{1F1F5}\u{1F1E6}'
};

export function bandera(equipo) {
  return BANDERAS[equipo] ?? '\u26BD';
}

export const colores = BA;
