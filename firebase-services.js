// Servicios de Firebase para Zephia
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.auth = auth;
    window.db = db;
}

// Exportar configuración y servicios
export { firebaseConfig };
export default app;
