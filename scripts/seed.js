/**
 * Script de carga inicial (seed) del fixture del Mundial FIFA 2026 en Firestore.
 *
 * Requisitos:
 *   1. Descargar la clave de servicio desde la consola de Firebase:
 *      Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada
 *   2. Guardarla como  scripts/serviceAccountKey.json
 *   3. Ejecutar:  npm run seed
 *
 * El script crea:
 *   - 104 documentos en la colección  /partidos  (72 de grupos + 32 de eliminatorias)
 *   - El documento  /configuracion/general  con el bloqueo automático por defecto (30 min)
 *
 * Es idempotente: si se vuelve a ejecutar, sobrescribe los partidos con los datos
 * del fixture pero CONSERVA los resultados y estados ya cargados (merge selectivo).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Inicialización de Firebase Admin
// ---------------------------------------------------------------------------
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
  );
} catch {
  console.error(
    '\n❌ No se encontró scripts/serviceAccountKey.json\n' +
      '   Descargá la clave desde: Consola Firebase > Configuración del proyecto >\n' +
      '   Cuentas de servicio > Generar nueva clave privada\n'
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Lectura del fixture
// ---------------------------------------------------------------------------
const fixture = JSON.parse(
  readFileSync(join(__dirname, 'fixture.json'), 'utf8')
);

/** Construye un Timestamp de Firestore a partir de fecha + hora Argentina (UTC-3). */
function timestampArgentina(fecha, hora) {
  if (!fecha || !hora) return null;
  return admin.firestore.Timestamp.fromDate(new Date(`${fecha}T${hora}:00-03:00`));
}

/** Separa el campo "cruce" ("X vs. Y") en local / visitante. */
function parsearCruce(cruce) {
  const [local, visitante] = cruce.split(' vs. ').map((s) => s.trim());
  return { local, visitante };
}

const partidos = [];
let orden = 0;

// --- Fase de grupos (partidos 1 a 72, en orden de grupo A -> L) -------------
for (const [claveGrupo, datosGrupo] of Object.entries(fixture.fase_grupos)) {
  const grupo = claveGrupo.replace('grupo_', ''); // "grupo_A" -> "A"
  for (const p of datosGrupo.partidos) {
    orden += 1;
    partidos.push({
      id: orden,
      orden,
      fase: 'grupos',
      grupo,
      local: p.local,
      visitante: p.visitante,
      fecha: p.fecha,
      hora: p.hora_argentina,
      estadio: p.estadio,
      ciudad: p.ciudad,
      timestamp: timestampArgentina(p.fecha, p.hora_argentina)
    });
  }
}

// --- Eliminatorias (partidos 73 a 104) ---------------------------------------
const fasesEliminatorias = [
  { lista: fixture.dieciseisavos_de_final, fase: 'dieciseisavos' },
  { lista: fixture.octavos_de_final, fase: 'octavos' },
  { lista: fixture.cuartos_de_final, fase: 'cuartos' },
  { lista: fixture.semifinales, fase: 'semifinal' },
  { lista: [fixture.tercer_puesto], fase: 'tercer_puesto' },
  { lista: [fixture.final], fase: 'final' }
];

for (const { lista, fase } of fasesEliminatorias) {
  for (const p of lista) {
    const { local, visitante } = parsearCruce(p.cruce);
    partidos.push({
      id: p.partido,
      orden: p.partido,
      fase,
      grupo: null,
      local,
      visitante,
      fecha: p.fecha,
      hora: null, // sin horario confirmado: el admin lo edita desde el panel
      estadio: p.estadio ?? null,
      ciudad: p.ciudad ?? p.sede ?? null,
      timestamp: null
    });
  }
}

// ---------------------------------------------------------------------------
// Escritura en Firestore (batches de hasta 500 operaciones)
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n⚽ Importando ${partidos.length} partidos a Firestore...\n`);

  const batch = db.batch();

  for (const partido of partidos) {
    const ref = db.collection('partidos').doc(String(partido.id));
    const existente = await ref.get();

    if (existente.exists) {
      // Conserva estado y resultados ya cargados; actualiza datos del fixture.
      batch.set(ref, partido, { merge: true });
    } else {
      batch.set(ref, {
        ...partido,
        estado: 'abierto',
        resultado_local: null,
        resultado_visitante: null
      });
    }
  }

  // Configuración general (bloqueo automático por defecto: 30 minutos antes)
  const configRef = db.doc('configuracion/general');
  const config = await configRef.get();
  if (!config.exists) {
    batch.set(configRef, { bloqueoAutomaticoMinutos: 30 });
  }

  await batch.commit();

  console.log('✅ Seed completado:');
  console.log(`   - ${partidos.filter((p) => p.fase === 'grupos').length} partidos de fase de grupos`);
  console.log(`   - ${partidos.filter((p) => p.fase !== 'grupos').length} partidos de eliminatorias`);
  console.log('   - Documento /configuracion/general\n');
  console.log('👉 Próximo paso: registrá tu usuario en la app y promovelo a admin');
  console.log('   editando el campo  rol: "admin"  en /usuarios/{uid} (consola Firestore).\n');
}

main().catch((err) => {
  console.error('❌ Error durante el seed:', err);
  process.exit(1);
});
