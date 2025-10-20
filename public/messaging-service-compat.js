// Servicio de Mensajería para Zephia - FIREBASE COMPAT VERSION
// Este archivo maneja todas las operaciones de mensajería con Firebase Firestore
// Compatible con GitHub Pages (sin módulos ES6)

// ===== ESTRUCTURA DE DATOS =====
/*
Colecciones en Firestore:

1. conversations (conversaciones)
{
    id: string (auto-generado),
    participants: [userId1, userId2],
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
*/

class MessagingService {
    constructor() {
        this.currentUser = null;
        this.conversationsListener = null;
        this.messagesListener = null;
        this.db = null;
    }

    // Inicializar el servicio con el usuario actual y db
    initialize(user, db) {
        this.currentUser = user;
        this.db = db;
        console.log('💬 Servicio de mensajería inicializado para:', user.name);
    }

    // ===== GESTIÓN DE CONVERSACIONES =====

    /**
     * Obtener todas las conversaciones del usuario actual
     */
    async getConversations() {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            const snapshot = await this.db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.id)
                .orderBy('updatedAt', 'desc')
                .get();

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
     */
    listenToConversations(callback) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            this.conversationsListener = this.db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.id)
                .orderBy('updatedAt', 'desc')
                .onSnapshot((snapshot) => {
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
     */
    async createOrGetConversation(recipientId, recipientInfo) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            // Buscar conversación existente
            const snapshot = await this.db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.id)
                .get();

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
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('conversations').add(newConversation);
            return docRef.id;
        } catch (error) {
            console.error('Error al crear conversación:', error);
            throw error;
        }
    }

    // ===== GESTIÓN DE MENSAJES =====

    /**
     * Enviar un mensaje
     */
    async sendMessage(conversationId, text, priority = 'normal', attachment = null) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        // Validar que haya texto o archivo adjunto
        if ((!text || !text.trim()) && !attachment) {
            throw new Error('El mensaje debe contener texto o un archivo adjunto');
        }

        try {
            // Crear el mensaje
            const message = {
                conversationId,
                senderId: this.currentUser.id,
                senderName: this.currentUser.name,
                text: text ? text.trim() : '',
                priority,
                read: false,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Agregar archivo adjunto si existe
            if (attachment) {
                message.attachment = {
                    name: attachment.name,
                    url: attachment.url,
                    size: attachment.size,
                    type: attachment.type || '',
                    path: attachment.path || ''
                };
            }

            const messageDoc = await this.db.collection('messages').add(message);

            // Actualizar la conversación con el último mensaje
            const conversationDoc = await this.db.collection('conversations').doc(conversationId).get();

            if (conversationDoc.exists) {
                const conversationData = conversationDoc.data();
                const otherUserId = conversationData.participants.find(
                    id => id !== this.currentUser.id
                );

                // Texto para preview en la lista de conversaciones
                let previewText = text ? text.trim() : '';
                if (attachment && !previewText) {
                    previewText = `📎 ${attachment.name}`;
                } else if (attachment && previewText) {
                    previewText = `📎 ${previewText}`;
                }

                await this.db.collection('conversations').doc(conversationId).update({
                    lastMessage: {
                        text: previewText,
                        senderId: this.currentUser.id,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        priority,
                        hasAttachment: attachment !== null
                    },
                    [`unreadCount.${otherUserId}`]: (conversationData.unreadCount?.[otherUserId] || 0) + 1,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
     */
    async getMessages(conversationId, limitCount = 50) {
        try {
            const snapshot = await this.db.collection('messages')
                .where('conversationId', '==', conversationId)
                .orderBy('timestamp', 'asc')
                .limit(limitCount)
                .get();

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
     */
    listenToMessages(conversationId, callback) {
        try {
            this.messagesListener = this.db.collection('messages')
                .where('conversationId', '==', conversationId)
                .orderBy('timestamp', 'asc')
                .onSnapshot((snapshot) => {
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
     */
    async markMessagesAsRead(conversationId) {
        if (!this.currentUser) {
            throw new Error('Usuario no inicializado');
        }

        try {
            // Actualizar contador de no leídos en la conversación
            await this.db.collection('conversations').doc(conversationId).update({
                [`unreadCount.${this.currentUser.id}`]: 0
            });

            // Marcar mensajes como leídos
            const snapshot = await this.db.collection('messages')
                .where('conversationId', '==', conversationId)
                .where('read', '==', false)
                .where('senderId', '!=', this.currentUser.id)
                .get();

            const updatePromises = [];
            snapshot.forEach(docSnap => {
                updatePromises.push(
                    this.db.collection('messages').doc(docSnap.id).update({ read: true })
                );
            });

            await Promise.all(updatePromises);
        } catch (error) {
            console.error('Error al marcar mensajes como leídos:', error);
            // No lanzar error, solo loguearlo
        }
    }

    // ===== BÚSQUEDA DE USUARIOS =====

    /**
     * Buscar usuarios para iniciar conversación
     */
    async searchUsers(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return [];
        }

        try {
            const snapshot = await this.db.collection('users').get();
            const users = [];
            const search = searchTerm.toLowerCase().trim();

            snapshot.forEach(doc => {
                const userData = doc.data();
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
     */
    async getAllUsers() {
        try {
            const snapshot = await this.db.collection('users').get();
            const users = [];

            snapshot.forEach(doc => {
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
     */
    async updateUserStatus(online) {
        if (!this.currentUser) return;

        try {
            await this.db.collection('users').doc(this.currentUser.id).update({
                online,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error al actualizar estado de usuario:', error);
        }
    }

    // ===== UTILIDADES =====

    /**
     * Formatear timestamp a hora legible
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

// Crear instancia única del servicio y hacerla disponible globalmente
window.MessagingService = MessagingService;
window.messagingService = new MessagingService();

