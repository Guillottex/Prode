import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Provee:
 *  - user:    usuario de Firebase Auth
 *  - perfil:  documento /usuarios/{uid} (nombre, legajo, rol, puntaje...)
 *  - esAdmin: perfil.rol === 'admin'
 *  - registrar / ingresar / recuperar / salir
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setPerfil(null);
        setCargando(false);
      }
    });
    return off;
  }, []);

  // Suscripción en tiempo real al perfil (puntaje, rol, estado)
  useEffect(() => {
    if (!user) return undefined;
    const off = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      setPerfil(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setCargando(false);
    });
    return off;
  }, [user]);

  async function registrar({ nombre, apellido, legajo, area, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${nombre} ${apellido}` });
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      uid: cred.user.uid,
      nombre,
      apellido,
      legajo,
      area,
      email,
      rol: 'usuario',
      puntaje: 0,
      aciertosExactos: 0,
      activo: true,
      creado: serverTimestamp()
    });
    return cred.user;
  }

  function ingresar(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function recuperar(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function salir() {
    return signOut(auth);
  }

  const value = {
    user,
    perfil,
    esAdmin: perfil?.rol === 'admin',
    cargando,
    registrar,
    ingresar,
    recuperar,
    salir
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
