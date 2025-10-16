// Servicio de Mensajería para Zephia
// Este archivo maneja todas las operaciones de mensajería con Firebase Firestore

import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit,
    getDocs, 
    addDoc, 
    updateDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    getDoc,
    setDoc,
    or,
    and
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { db } from './firebase-config.js';

// ===== ESTRUCTURA DE DATOS =====
/*
Colecciones en Firestore:

1. conversations (conversaciones)
{
    id: string (auto-generado),
    participants: [userId1, userId2], // Array de IDs de participantes
    participantsInfo: {
        userId1: { name, role, avatar },
        userId2: { name, role, avatar }
    },
    lastMessage: {
        text: string,
        senderId: string,
        timestamp: timestamp,
        priority: string
    },
    unreadCount: {
        userId1: number,
        userId2: number
    },
    createdAt: timestamp,
    updatedAt: timestamp
}

2. messages (mensajes)
{
    id: string (auto-generado),
    conversationId: string,
    senderId: string,
    senderName: string,
    text: string,
    priority: string, // 'normal', 'baja', 'media', 'alta'
    read: boolean,
    timestamp: timestamp
}

3. users (usuarios) - usado para buscar destinatarios
{
    id: string (uid de auth),
    name: string,
    email: string,
    role: string, // 'docente', 'secretaria', 'responsable', 'admin'
    avatar: string (opcional),
    schoolId: string (opcional),
    online: boolean,
    lastSeen: timestamp
}
*/

class MessagingService {
    constructor() {
        this.currentUser = null;
        this.conversationsListener = null;
        this.messagesListener = null;
    }

    // Inicializar el servicio con el usuario actual
    initialize(user) {
        this.currentUser = user;
        console.log('Servicio de mensajería inicializado para:', user);
    }

    // ===== GESTIÓN DE CONVERSACIONES =====

    /**
     * Obtener todas las conversaciones del usuario actual
     * @returns {Promise<Array>} Array de conversaciones
     */
    async getConversations() {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', this.currentUser.id),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const conversations = [];

            snapshot.forEach(doc => {
                conversations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return conversations;
        } catch (error) {
            console.error('Error al obtener conversaciones:', error);
            throw error;
        }
    }

    /**
     * Escuchar cambios en las conversaciones en tiempo real
     * @param {Function} callback Función que se ejecuta cuando hay cambios
     * @returns {Function} Función para detener el listener
     */
    listenToConversations(callback) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', this.currentUser.id),
                orderBy('updatedAt', 'desc')
            );

            this.conversationsListener = onSnapshot(q, (snapshot) => {
                const conversations = [];
                snapshot.forEach(doc => {
                    conversations.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(conversations);
            }, (error) => {
                console.error('Error en listener de conversaciones:', error);
            });

            return () => {
                if (this.conversationsListener) {
                    this.conversationsListener();
                }
            };
        } catch (error) {
            console.error('Error al configurar listener de conversaciones:', error);
            throw error;
        }
    }

    /**
     * Crear una nueva conversación o retornar una existente
     * @param {string} recipientId ID del destinatario
     * @param {Object} recipientInfo Información del destinatario
     * @returns {Promise<string>} ID de la conversación
     */
    async createOrGetConversation(recipientId, recipientInfo) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            // Buscar conversación existente
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('participants', 'array-contains', this.currentUser.id)
            );

            const snapshot = await getDocs(q);
            let existingConversation = null;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.participants.includes(recipientId)) {
                    existingConversation = { id: doc.id, ...data };
                }
            });

            if (existingConversation) {
                return existingConversation.id;
            }

            // Crear nueva conversación
            const newConversation = {
                participants: [this.currentUser.id, recipientId],
                participantsInfo: {
                    [this.currentUser.id]: {
                        name: this.currentUser.name,
                        role: this.currentUser.role,
                        avatar: this.currentUser.avatar || null
                    },
                    [recipientId]: {
                        name: recipientInfo.name,
                        role: recipientInfo.role,
                        avatar: recipientInfo.avatar || null
                    }
                },
                lastMessage: null,
                unreadCount: {
                    [this.currentUser.id]: 0,
                    [recipientId]: 0
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(conversationsRef, newConversation);
            return docRef.id;
        } catch (error) {
            console.error('Error al crear conversación:', error);
            throw error;
        }
    }

    // ===== GESTIÓN DE MENSAJES =====

    /**
     * Enviar un mensaje
     * @param {string} conversationId ID de la conversación
     * @param {string} text Texto del mensaje
     * @param {string} priority Prioridad del mensaje
     * @returns {Promise<string>} ID del mensaje enviado
     */
    async sendMessage(conversationId, text, priority = 'normal') {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        if (!text || !text.trim()) {
            throw new Error('El mensaje no puede estar vacío');
        }

        try {
            // Crear el mensaje
            const messagesRef = collection(db, 'messages');
            const message = {
                conversationId,
                senderId: this.currentUser.id,
                senderName: this.currentUser.name,
                text: text.trim(),
                priority,
                read: false,
                timestamp: serverTimestamp()
            };

            const messageDoc = await addDoc(messagesRef, message);

            // Actualizar la conversación con el último mensaje
            const conversationRef = doc(db, 'conversations', conversationId);
            const conversationSnap = await getDoc(conversationRef);

            if (conversationSnap.exists()) {
                const conversationData = conversationSnap.data();
                const otherUserId = conversationData.participants.find(
                    id => id !== this.currentUser.id
                );

                await updateDoc(conversationRef, {
                    lastMessage: {
                        text: text.trim(),
                        senderId: this.currentUser.id,
                        timestamp: serverTimestamp(),
                        priority
                    },
                    [`unreadCount.${otherUserId}`]: (conversationData.unreadCount?.[otherUserId] || 0) + 1,
                    updatedAt: serverTimestamp()
                });
            }

            return messageDoc.id;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            throw error;
        }
    }

    /**
     * Obtener mensajes de una conversación
     * @param {string} conversationId ID de la conversación
     * @param {number} limitCount Límite de mensajes a obtener
     * @returns {Promise<Array>} Array de mensajes
     */
    async getMessages(conversationId, limitCount = 50) {
        try {
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const messages = [];

            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return messages;
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            throw error;
        }
    }

    /**
     * Escuchar mensajes de una conversación en tiempo real
     * @param {string} conversationId ID de la conversación
     * @param {Function} callback Función que se ejecuta cuando hay nuevos mensajes
     * @returns {Function} Función para detener el listener
     */
    listenToMessages(conversationId, callback) {
        try {
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId),
                orderBy('timestamp', 'asc')
            );

            this.messagesListener = onSnapshot(q, (snapshot) => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(messages);
            }, (error) => {
                console.error('Error en listener de mensajes:', error);
            });

            return () => {
                if (this.messagesListener) {
                    this.messagesListener();
                }
            };
        } catch (error) {
            console.error('Error al configurar listener de mensajes:', error);
            throw error;
        }
    }

    /**
     * Marcar mensajes como leídos
     * @param {string} conversationId ID de la conversación
     */
    async markMessagesAsRead(conversationId) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            // Actualizar contador de no leídos en la conversación
            const conversationRef = doc(db, 'conversations', conversationId);
            await updateDoc(conversationRef, {
                [`unreadCount.${this.currentUser.id}`]: 0
            });

            // Marcar mensajes como leídos
            const messagesRef = collection(db, 'messages');
            const q = query(
                messagesRef,
                where('conversationId', '==', conversationId),
                where('read', '==', false),
                where('senderId', '!=', this.currentUser.id)
            );

            const snapshot = await getDocs(q);
            const updatePromises = [];

            snapshot.forEach(docSnap => {
                updatePromises.push(
                    updateDoc(doc(db, 'messages', docSnap.id), { read: true })
                );
            });

            await Promise.all(updatePromises);
        } catch (error) {
            console.error('Error al marcar mensajes como leídos:', error);
            throw error;
        }
    }

    // ===== BÚSQUEDA DE USUARIOS =====

    /**
     * Buscar usuarios para iniciar conversación
     * @param {string} searchTerm Término de búsqueda
     * @returns {Promise<Array>} Array de usuarios
     */
    async searchUsers(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return [];
        }

        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users = [];

            const search = searchTerm.toLowerCase().trim();

            snapshot.forEach(doc => {
                const userData = doc.data();
                // No incluir al usuario actual en los resultados
                if (doc.id !== this.currentUser.id) {
                    const name = (userData.name || '').toLowerCase();
                    const email = (userData.email || '').toLowerCase();
                    const role = (userData.role || '').toLowerCase();

                    if (name.includes(search) || email.includes(search) || role.includes(search)) {
                        users.push({
                            id: doc.id,
                            ...userData
                        });
                    }
                }
            });

            return users;
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los usuarios disponibles para mensajear
     * @returns {Promise<Array>} Array de usuarios
     */
    async getAllUsers() {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users = [];

            snapshot.forEach(doc => {
                // No incluir al usuario actual
                if (doc.id !== this.currentUser.id) {
                    users.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });

            return users;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de usuario (online/offline)
     * @param {boolean} online Estado del usuario
     */
    async updateUserStatus(online) {
        if (!this.currentUser) return;

        try {
            const userRef = doc(db, 'users', this.currentUser.id);
            await updateDoc(userRef, {
                online,
                lastSeen: serverTimestamp()
            });
        } catch (error) {
            console.error('Error al actualizar estado de usuario:', error);
        }
    }

    // ===== UTILIDADES =====

    /**
     * Formatear timestamp a hora legible
     * @param {Object} timestamp Timestamp de Firebase
     * @returns {string} Hora formateada
     */
    formatTime(timestamp) {
        if (!timestamp) return '';

        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return '';
        }

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Si es hoy
        if (diffDays === 0) {
            return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        }
        // Si es ayer
        else if (diffDays === 1) {
            return 'Ayer';
        }
        // Si es esta semana
        else if (diffDays < 7) {
            return date.toLocaleDateString('es-AR', { weekday: 'short' });
        }
        // Si es más antiguo
        else {
            return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        }
    }

    /**
     * Obtener información del otro participante en una conversación
     * @param {Object} conversation Objeto de conversación
     * @returns {Object} Información del otro participante
     */
    getOtherParticipant(conversation) {
        if (!this.currentUser || !conversation) return null;

        const otherUserId = conversation.participants.find(
            id => id !== this.currentUser.id
        );

        return conversation.participantsInfo?.[otherUserId] || null;
    }

    /**
     * Obtener contador de mensajes no leídos totales
     * @param {Array} conversations Array de conversaciones
     * @returns {number} Total de mensajes no leídos
     */
    getTotalUnreadCount(conversations) {
        if (!this.currentUser || !conversations) return 0;

        return conversations.reduce((total, conv) => {
            return total + (conv.unreadCount?.[this.currentUser.id] || 0);
        }, 0);
    }

    /**
     * Limpiar listeners al cerrar sesión
     */
    cleanup() {
        if (this.conversationsListener) {
            this.conversationsListener();
            this.conversationsListener = null;
        }
        if (this.messagesListener) {
            this.messagesListener();
            this.messagesListener = null;
        }
        this.currentUser = null;
    }
}

// Crear instancia única del servicio
const messagingService = new MessagingService();

// Exportar el servicio
export default messagingService;

