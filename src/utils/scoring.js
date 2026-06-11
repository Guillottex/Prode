/**
 * Sistema de puntajes del Prode DGFIS - Mundial 2026
 *
 *  Resultado exacto .................... 10 puntos
 *  Ganador + diferencia de gol .........  5 puntos
 *  Ganador (sin diferencia) ............  3 puntos
 *  Empate acertado (no exacto) .........  3 puntos
 *  Error ...............................  0 puntos
 */
export const PUNTOS = {
  EXACTO: 10,
  GANADOR_Y_DIFERENCIA: 5,
  GANADOR: 3,
  EMPATE: 3,
  ERROR: 0
};

export function calcularPuntos(pronostico, resultado) {
  if (
    pronostico == null ||
    resultado == null ||
    resultado.local == null ||
    resultado.visitante == null
  ) {
    return 0;
  }

  const pl = Number(pronostico.golesLocal);
  const pv = Number(pronostico.golesVisitante);
  const rl = Number(resultado.local);
  const rv = Number(resultado.visitante);

  // Resultado exacto
  if (pl === rl && pv === rv) return PUNTOS.EXACTO;

  const signoPron = Math.sign(pl - pv);
  const signoReal = Math.sign(rl - rv);

  // No acerto el ganador / empate
  if (signoPron !== signoReal) return PUNTOS.ERROR;

  // Acerto empate (no exacto)
  if (signoReal === 0) return PUNTOS.EMPATE;

  // Acerto ganador y diferencia de gol
  if (pl - pv === rl - rv) return PUNTOS.GANADOR_Y_DIFERENCIA;

  // Acerto solo el ganador
  return PUNTOS.GANADOR;
}

export function esAciertoExacto(pronostico, resultado) {
  return calcularPuntos(pronostico, resultado) === PUNTOS.EXACTO;
}
