// ========================================
// INTEGRACIÓN: Authentication + Mensajería
// ========================================
// Este archivo muestra cómo conectar el login de Firebase Auth
// con el sistema de mensajería que usa Firestore

import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import messagingUI from './messaging-ui.js';
import accessControl from './access-control.js';

/**
 * Función para hacer login y configurar la mensajería
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Usuario autenticado
 */
export async function loginWithMessaging(email, password) {
    try {
        console.log('🔐 Iniciando sesión...');
        
        // 1. Autenticar con Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        console.log('✅ Usuario autenticado:', firebaseUser.uid);
        
        // 2. Obtener o crear el perfil del usuario en Firestore
        const userProfile = await getOrCreateUserProfile(firebaseUser);
        
        console.log('✅ Perfil de usuario obtenido:', userProfile);
        
        // 3. Inicializar el sistema de mensajería
        await messagingUI.initialize(userProfile);
        
        console.log('✅ Sistema de mensajería inicializado');
        
        return userProfile;
        
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        throw error;
    }
}

/**
 * Obtener o crear el perfil del usuario en Firestore
 * @param {Object} firebaseUser - Usuario de Firebase Auth
 * @returns {Promise<Object>} Perfil del usuario
 */
async function getOrCreateUserProfile(firebaseUser) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
        // El usuario ya existe en Firestore
        console.log('👤 Usuario encontrado en Firestore');
        
        // Actualizar estado online
        await setDoc(userRef, {
            online: true,
            lastSeen: serverTimestamp()
        }, { merge: true });
        
        return {
            id: firebaseUser.uid,
            ...userSnap.data()
        };
    } else {
        // El usuario no existe, crearlo
        console.log('🆕 Creando nuevo usuario en Firestore');
        
        // Determinar el rol basado en el email o asignar rol por defecto
        // IMPORTANTE: Solo usuarios que ya existen en Firestore deberían poder loguearse
        // Este código es un fallback para usuarios creados directamente en Authentication
        let userRole = 'docente'; // Rol por defecto más restrictivo
        
        // Opcional: Detectar rol basado en el dominio del email
        const email = firebaseUser.email.toLowerCase();
        if (email.includes('admin')) {
            userRole = 'admin';
        } else if (email.includes('responsable')) {
            userRole = 'responsable';
        } else if (email.includes('secretaria')) {
            userRole = 'secretaria';
        }
        
        // Datos por defecto del usuario
        const userData = {
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: userRole,
            avatar: firebaseUser.photoURL || null,
            online: true,
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp()
        };
        
        await setDoc(userRef, userData);
        
        console.warn(`⚠️ Usuario creado automáticamente con rol: ${userRole}`);
        console.warn('💡 Recomendación: Los usuarios deberían ser creados primero en Firestore con su rol correcto');
        
        return {
            id: firebaseUser.uid,
            ...userData
        };
    }
}

/**
 * Configurar listener de autenticación
 * Esta función se llama automáticamente cuando cambia el estado de autenticación
 */
export function setupAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Usuario está autenticado
            console.log('👤 Usuario autenticado detectado:', firebaseUser.uid);
            
            try {
                // Obtener perfil y configurar mensajería
                const userProfile = await getOrCreateUserProfile(firebaseUser);
                
                // Verificar acceso a la página actual
                const hasAccess = accessControl.checkPageAccess(userProfile);
                
                if (!hasAccess) {
                    // El usuario será redirigido automáticamente por checkPageAccess
                    console.warn('⛔ Usuario redirigido por falta de permisos');
                    return;
                }
                
                // Esperar a que el DOM esté completamente cargado antes de aplicar control de acceso
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        accessControl.applyAccessControl(userProfile);
                    });
                } else {
                    // DOM ya está cargado, aplicar inmediatamente
                    accessControl.applyAccessControl(userProfile);
                }
                
                // Inicializar mensajería
                await messagingUI.initialize(userProfile);
                
                console.log('✅ Mensajería lista para usar');
                console.log('🔐 Control de acceso aplicado para rol:', userProfile.role);
            } catch (error) {
                console.error('❌ Error al configurar mensajería:', error);
            }
        } else {
            // Usuario no está autenticado
            console.log('🚪 Usuario no autenticado');
            
            // Limpiar mensajería
            messagingUI.cleanup();
            
            // Redirigir al login si no está en la página de login
            const currentPage = window.location.pathname;
            if (!currentPage.includes('login.html')) {
                console.log('Redirigiendo al login...');
                window.location.href = 'login.html';
            }
        }
    });
}

/**
 * Función para cerrar sesión
 */
export async function logoutWithMessaging() {
    try {
        // Limpiar mensajería
        messagingUI.cleanup();
        
        // Actualizar estado offline en Firestore
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, {
                online: false,
                lastSeen: serverTimestamp()
            }, { merge: true });
        }
        
        // Cerrar sesión en Firebase Auth
        await signOut(auth);
        
        console.log('👋 Sesión cerrada correctamente');
        
        // Redirigir al login
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
    }
}

/**
 * Obtener el usuario actual autenticado
 * @returns {Promise<Object|null>} Usuario actual o null
 */
export async function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            unsubscribe();
            
            if (firebaseUser) {
                const userProfile = await getOrCreateUserProfile(firebaseUser);
                resolve(userProfile);
            } else {
                resolve(null);
            }
        });
    });
}

// Exportar funciones principales
export default {
    loginWithMessaging,
    logoutWithMessaging,
    setupAuthListener,
    getCurrentUser
};

