import { useEffect, useMemo, useState } from 'react';
import {
  collection, doc, onSnapshot, orderBy, query, where
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';

/** Configuración global: /configuracion/general { bloqueoAutomaticoMinutos } */
export function useConfig() {
  const [config, setConfig] = useState({ bloqueoAutomaticoMinutos: 30 });
  useEffect(() => {
    const off = onSnapshot(doc(db, 'configuracion', 'general'), (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });
    return off;
  }, []);
  return config;
}

/** Todos los partidos ordenados por número de partido. */
export function usePartidos() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'partidos'), orderBy('orden', 'asc'));
    const off = onSnapshot(q, (snap) => {
      setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCargando(false);
    });
    return off;
  }, []);
  return { partidos, cargando };
}

/** Pronósticos del usuario logueado, como mapa { [partidoId]: pronostico }. */
export function useMisPronosticos() {
  const { user } = useAuth();
  const [lista, setLista] = useState([]);
  useEffect(() => {
    if (!user) return undefined;
    const q = query(collection(db, 'pronosticos'), where('uid', '==', user.uid));
    const off = onSnapshot(q, (snap) => {
      setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return off;
  }, [user]);

  const porPartido = useMemo(() => {
    const m = {};
    for (const p of lista) m[p.partidoId] = p;
    return m;
  }, [lista]);

  return { pronosticos: lista, porPartido };
}

/** Ranking en tiempo real: usuarios activos ordenados por puntaje. */
export function useRanking() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('puntaje', 'desc'));
    const off = onSnapshot(q, (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.activo !== false)
        .sort((a, b) => b.puntaje - a.puntaje || b.aciertosExactos - a.aciertosExactos);
      setUsuarios(lista);
      setCargando(false);
    });
    return off;
  }, []);
  return { usuarios, cargando };
}
