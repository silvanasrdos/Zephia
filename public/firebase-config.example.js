// Configuración de Firebase - ARCHIVO DE EJEMPLO
// Copia este archivo a firebase-config.js y completa con tus credenciales

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.firebasestorage.app",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
    measurementId: "TU_MEASUREMENT_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Hacer disponible globalmente para compatibilidad con código legacy
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.auth = auth;
    window.db = db;
    window.firebaseApp = app;
}

// Exportar por defecto la app
export default app;

