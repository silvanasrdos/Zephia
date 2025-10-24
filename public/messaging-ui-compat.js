// UI de Mensajería para Zephia - FIREBASE COMPAT VERSION
// Este archivo maneja todas las operaciones de interfaz de usuario para la mensajería
// Compatible con GitHub Pages (sin módulos ES6)

/**
 * Clase para manejar la UI de mensajería
 */
class MessagingUI {
    constructor() {
        this.currentConversationId = null;
        this.conversations = [];
        this.messages = [];
        this.unsubscribeConversations = null;
        this.unsubscribeMessages = null;
    }

    /**
     * Inicializar la UI de mensajería
     */
    async initialize(currentUser, db) {
        try {
            // Inicializar el servicio
            window.messagingService.initialize(currentUser, db);


            // Configurar event listeners
            this.setupEventListeners();

            // Cargar conversaciones
            await this.loadConversations();

            // Actualizar estado del usuario
            await window.messagingService.updateUserStatus(true);

            // Manejar cierre de ventana
            window.addEventListener('beforeunload', () => {
                window.messagingService.updateUserStatus(false);
            });

            console.log('💬 UI de mensajería inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar UI de mensajería:', error);
            this.showError('Error al inicializar la mensajería');
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botón de enviar mensaje
        const sendBtn = document.querySelector('.send-btn');
        const chatInput = document.querySelector('.chat-input');
        const charCounter = document.getElementById('char-counter');

        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
            
            // Manejar Enter para enviar (Shift+Enter para nueva línea)
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            // Actualizar contador de caracteres y auto-expandir
            chatInput.addEventListener('input', (e) => {
                this.updateCharCounter(e.target.value.length, charCounter);
                this.autoExpandTextarea(e.target);
            });
        }

        // Búsqueda de conversaciones
        const searchInput = document.getElementById('conversation-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Botón de actualizar
        const refreshBtn = document.querySelector('.header-icon-btn[title="Actualizar"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshConversations());
        }

        // Botón de búsqueda en chat
        const chatSearchBtn = document.querySelector('.chat-header-actions .header-icon-btn[title="Buscar"]');
        if (chatSearchBtn) {
            chatSearchBtn.addEventListener('click', () => this.toggleChatSearch());
        }
    }

    /**
     * Auto-expandir textarea según el contenido
     */
    autoExpandTextarea(textarea) {
        if (!textarea) return;
        
        // Resetear altura para calcular correctamente
        textarea.style.height = 'auto';
        
        // Calcular nueva altura
        const newHeight = Math.min(textarea.scrollHeight, 120); // Máximo 120px
        textarea.style.height = newHeight + 'px';
    }

    /**
     * Actualizar contador de caracteres
     */
    updateCharCounter(currentLength, counterElement) {
        if (!counterElement) return;

        const maxLength = 200;
        const remaining = maxLength - currentLength;
        counterElement.textContent = remaining;

        // Cambiar color según caracteres restantes
        counterElement.classList.remove('warning', 'danger');
        if (remaining <= 20 && remaining > 10) {
            counterElement.classList.add('warning');
        } else if (remaining <= 10) {
            counterElement.classList.add('danger');
        }
    }

    /**
     * Cargar conversaciones del usuario
     */
    async loadConversations() {
        try {
            // Desuscribirse de listener anterior si existe
            if (this.unsubscribeConversations) {
                this.unsubscribeConversations();
            }

            // Escuchar cambios en conversaciones
            this.unsubscribeConversations = window.messagingService.listenToConversations((conversations) => {
                this.conversations = conversations;
                this.renderConversations(conversations);

                // Si hay una conversación seleccionada, actualizarla
                if (this.currentConversationId) {
                    const currentConv = conversations.find(c => c.id === this.currentConversationId);
                    if (currentConv) {
                        this.updateChatHeader(currentConv);
                    }
                }
            });
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            this.showError('Error al cargar las conversaciones');
        }
    }

    /**
     * Renderizar lista de conversaciones
     */
    renderConversations(conversations) {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;

        // Si no hay conversaciones
        if (!conversations || conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <p>No hay conversaciones aún</p>
                    <small>Inicia una nueva conversación usando el botón +</small>
                </div>
            `;
            return;
        }

        // Renderizar conversaciones
        conversationsList.innerHTML = '';
        conversations.forEach(conversation => {
            const conversationEl = this.createConversationElement(conversation);
            conversationsList.appendChild(conversationEl);
        });

        // Seleccionar automáticamente la primera conversación si no hay ninguna seleccionada
        if (!this.currentConversationId && conversations.length > 0) {
            this.selectConversation(conversations[0].id);
        }
    }

    /**
     * Crear elemento HTML de conversación
     */
    createConversationElement(conversation) {
        const otherParticipant = window.messagingService.getOtherParticipant(conversation);
        const unreadCount = conversation.unreadCount?.[window.messagingService.currentUser.id] || 0;
        const lastMessage = conversation.lastMessage;
        const priority = lastMessage?.priority || 'normal';
        
        const div = document.createElement('div');
        div.className = `conversation-item priority-${priority}`;
        if (conversation.id === this.currentConversationId) {
            div.classList.add('active');
        }

        div.onclick = () => this.selectConversation(conversation.id);

        const priorityBadge = priority !== 'normal' ? 
            `<span class="priority-badge ${priority}">${priority.toUpperCase()}</span>` : '';

        const timeFormatted = lastMessage?.timestamp ? 
            window.messagingService.formatTime(lastMessage.timestamp) : '';

        div.innerHTML = `
            <div class="conversation-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="conversation-info">
                <div class="conversation-header">
                    <h4>${otherParticipant?.name || 'Usuario'}</h4>
                    ${priorityBadge}
                </div>
                <p class="conversation-preview">${this.escapeHtml(lastMessage?.text || 'Nueva conversación')}</p>
            </div>
            <div class="conversation-meta">
                <span class="conversation-time">${timeFormatted}</span>
                ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
            </div>
        `;
        
        return div;
    }


    /**
     * Seleccionar una conversación
     */
    async selectConversation(conversationId) {
        try {
            // Remover clase active de todas las conversaciones
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });

            // Buscar y activar la conversación seleccionada
            const allConvItems = document.querySelectorAll('.conversation-item');
            allConvItems.forEach(item => {
                if (item.onclick && item.onclick.toString().includes(conversationId)) {
                    item.classList.add('active');
                }
            });

            // Guardar conversación actual
            this.currentConversationId = conversationId;

            // Obtener información de la conversación
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                this.updateChatHeader(conversation);
            }

            // Cargar mensajes
            await this.loadMessages(conversationId);

            // Marcar mensajes como leídos
            await window.messagingService.markMessagesAsRead(conversationId);
        } catch (error) {
            console.error('Error al seleccionar conversación:', error);
            this.showError('Error al cargar la conversación');
        }
    }

    /**
     * Actualizar encabezado del chat
     */
    updateChatHeader(conversation) {
        const otherParticipant = window.messagingService.getOtherParticipant(conversation);
        
        const chatUserName = document.querySelector('.chat-user-details h3');
        const chatUserStatus = document.querySelector('.user-status');

        if (chatUserName) {
            chatUserName.textContent = otherParticipant?.name || 'Usuario';
        }

        if (chatUserStatus) {
            chatUserStatus.textContent = '-';
        }
    }


    /**
     * Cargar mensajes de una conversación
     */
    async loadMessages(conversationId) {
        try {
            // Desuscribirse de listener anterior si existe
            if (this.unsubscribeMessages) {
                this.unsubscribeMessages();
            }

            // Escuchar mensajes en tiempo real
            this.unsubscribeMessages = window.messagingService.listenToMessages(conversationId, (messages) => {
                this.messages = messages;
                this.renderMessages(messages);
            });
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            this.showError('Error al cargar los mensajes');
        }
    }

    /**
     * Renderizar mensajes en el chat
     */
    renderMessages(messages) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        // Si no hay mensajes
        if (!messages || messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="empty-state" style="padding: 40px; text-align: center; color: #999;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <p>No hay mensajes aún</p>
                    <small>Envía un mensaje para comenzar la conversación</small>
                </div>
            `;
            return;
        }

        // Renderizar mensajes
        chatMessages.innerHTML = '';
        messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            chatMessages.appendChild(messageEl);
        });

        // Scroll al último mensaje
        this.scrollToBottom();
    }

    /**
     * Crear elemento HTML de mensaje
     */
    createMessageElement(message) {
        const isSent = message.senderId === window.messagingService.currentUser.id;
        const div = document.createElement('div');
        div.className = `message ${isSent ? 'sent' : 'received'}`;
        
        // Debug: verificar alineación de mensajes
        console.log(`💬 Mensaje ${isSent ? 'ENVIADO' : 'RECIBIDO'}:`, {
            senderId: message.senderId,
            currentUserId: window.messagingService.currentUser.id,
            isSent: isSent
        });

        const timeFormatted = message.timestamp ? 
            window.messagingService.formatTime(message.timestamp) : '';

        const priorityIndicator = message.priority && message.priority !== 'normal' ?
            `<span class="message-priority priority-${message.priority}">${message.priority.toUpperCase()}</span>` : '';

        // HTML para el archivo adjunto si existe
        let attachmentHtml = '';
        if (message.attachment) {
            console.log('📎 Renderizando adjunto:', message.attachment);
            const fileIcon = this.getFileIcon(message.attachment.name);
            const fileSize = this.formatFileSize(message.attachment.size);
            
            // Para Base64, crear un enlace de descarga
            const downloadFunction = `downloadBase64File('${message.attachment.url}', '${message.attachment.name}')`;
            
            attachmentHtml = `
                <div class="message-attachment" onclick="${downloadFunction}">
                    <div class="message-attachment-icon">
                        <i class="fas ${fileIcon}"></i>
                    </div>
                    <div class="message-attachment-info">
                        <p class="message-attachment-name">${this.escapeHtml(message.attachment.name)}</p>
                        <p class="message-attachment-size">${fileSize}</p>
                    </div>
                    <i class="fas fa-download message-attachment-download"></i>
                </div>
            `;
        } else {
            console.log('❌ No hay adjunto en el mensaje:', message);
        }

        div.innerHTML = `
            <div class="message-bubble">
                ${priorityIndicator}
                <p>${this.escapeHtml(message.text)}</p>
                ${attachmentHtml}
                <span class="message-time">${timeFormatted}</span>
            </div>
        `;

        return div;
    }
    
    /**
     * Obtener icono según tipo de archivo
     */
    getFileIcon(fileName) {
        const ext = fileName.toLowerCase().split('.').pop();
        const icons = {
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'odt': 'fa-file-word',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'ods': 'fa-file-excel',
            'ppt': 'fa-file-powerpoint',
            'pptx': 'fa-file-powerpoint',
            'odp': 'fa-file-powerpoint',
            'pdf': 'fa-file-pdf',
            'zip': 'fa-file-archive'
        };
        return icons[ext] || 'fa-file';
    }
    
    /**
     * Formatear tamaño del archivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Manejar envío de mensaje
     */
    async handleSendMessage() {
        const chatInput = document.querySelector('.chat-input');
        const prioritySelector = document.getElementById('priority-selector');
        const charCounter = document.getElementById('char-counter');

        if (!chatInput || !this.currentConversationId) return;

        const text = chatInput.value.trim();
        const hasAttachment = window.selectedFile !== null;
        
        // Validar que haya texto o archivo
        if (!text && !hasAttachment) return;

        // Validar límite de caracteres
        if (text.length > 200) {
            this.showError('El mensaje no puede superar los 200 caracteres');
            return;
        }

        const priority = prioritySelector ? prioritySelector.value : 'normal';

        try {
            let attachmentData = null;
            
            // Si hay archivo adjunto, subirlo primero
            if (hasAttachment) {
                const uploadFunction = window.uploadFile;
                if (uploadFunction && typeof uploadFunction === 'function') {
                    attachmentData = await uploadFunction(window.selectedFile, this.currentConversationId);
                }
            }

            // Enviar mensaje (con o sin adjunto)
            await window.messagingService.sendMessage(
                this.currentConversationId, 
                text || (hasAttachment ? '📎 Archivo adjunto' : ''), 
                priority,
                attachmentData
            );

            // Limpiar input
            chatInput.value = '';

            // Resetear altura del textarea
            chatInput.style.height = 'auto';

            // Resetear contador de caracteres
            if (charCounter) {
                this.updateCharCounter(0, charCounter);
            }

            // Resetear prioridad
            if (prioritySelector) {
                prioritySelector.value = 'normal';
                this.updatePriorityColor(prioritySelector);
            }
            
            // Limpiar archivo adjunto
            if (window.removeAttachment && typeof window.removeAttachment === 'function') {
                window.removeAttachment();
            }

            // Scroll al final
            this.scrollToBottom();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.showError('Error al enviar el mensaje. Por favor intenta de nuevo.');
        }
    }

    /**
     * Abrir modal de nuevo mensaje
     */
    async openNewMessageModal() {
        try {
            // Obtener todos los usuarios
            const users = await window.messagingService.getAllUsers();
            
            // Crear modal
            this.showNewMessageModal(users);
        } catch (error) {
            console.error('Error al abrir modal de nuevo mensaje:', error);
            this.showError('Error al cargar usuarios');
        }
    }

    /**
     * Mostrar modal de nuevo mensaje
     */
    showNewMessageModal(users) {
        // Verificar si el modal ya existe
        let modal = document.getElementById('new-message-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'new-message-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Nuevo Mensaje</h3>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Buscar destinatario</label>
                        <input type="text" id="user-search" class="form-control" placeholder="Buscar por nombre o rol..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px;">
                    </div>
                    <div class="users-list" id="users-list" style="max-height: 300px; overflow-y: auto;">
                        ${users.map(user => `
                            <div class="user-item" onclick="window.messagingUI.startConversation('${user.id}', ${JSON.stringify(user).replace(/"/g, '&quot;')})" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                                <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #667eea; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="user-info">
                                    <h4 style="margin: 0; font-size: 14px;">${user.name}</h4>
                                    <p style="margin: 0; font-size: 12px; color: #666;">${user.role || 'Sin rol'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Configurar búsqueda de usuarios
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsersList(e.target.value, users);
            });
        }

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Filtrar lista de usuarios en el modal
     */
    filterUsersList(searchTerm, users) {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        const search = searchTerm.toLowerCase().trim();
        const filteredUsers = users.filter(user => {
            const name = (user.name || '').toLowerCase();
            const role = (user.role || '').toLowerCase();
            return name.includes(search) || role.includes(search);
        });

        usersList.innerHTML = filteredUsers.map(user => `
            <div class="user-item" onclick="window.messagingUI.startConversation('${user.id}', ${JSON.stringify(user).replace(/"/g, '&quot;')})" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #667eea; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-info">
                    <h4 style="margin: 0; font-size: 14px;">${user.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: #666;">${user.role || 'Sin rol'}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Iniciar conversación con un usuario
     */
    async startConversation(userId, userInfo) {
        try {
            // Cerrar modal
            const modal = document.getElementById('new-message-modal');
            if (modal) {
                modal.style.display = 'none';
            }

            // Crear o obtener conversación
            const conversationId = await window.messagingService.createOrGetConversation(userId, userInfo);

            // Seleccionar conversación
            await this.selectConversation(conversationId);

            // Enfocar el input de mensaje
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        } catch (error) {
            console.error('Error al iniciar conversación:', error);
            this.showError('Error al crear la conversación');
        }
    }

    /**
     * Filtrar conversaciones por término de búsqueda
     */
    filterConversations(searchTerm) {
        const search = searchTerm.toLowerCase().trim();
        
        if (!search) {
            this.renderConversations(this.conversations);
            return;
        }

        const filtered = this.conversations.filter(conversation => {
            const otherParticipant = window.messagingService.getOtherParticipant(conversation);
            const name = (otherParticipant?.name || '').toLowerCase();
            const lastMessage = (conversation.lastMessage?.text || '').toLowerCase();
            
            return name.includes(search) || lastMessage.includes(search);
        });

        this.renderConversations(filtered);
    }

    /**
     * Refrescar conversaciones
     */
    async refreshConversations() {
        try {
            const conversations = await window.messagingService.getConversations();
            this.conversations = conversations;
            this.renderConversations(conversations);
        } catch (error) {
            console.error('Error al refrescar conversaciones:', error);
            this.showError('Error al actualizar las conversaciones');
        }
    }

    /**
     * Alternar búsqueda en chat
     */
    toggleChatSearch() {
        const chatHeader = document.querySelector('.chat-header');
        const existingSearch = document.querySelector('.chat-search-container');
        
        if (existingSearch) {
            // Si ya existe, ocultarlo
            existingSearch.remove();
            return;
        }

        // Crear contenedor de búsqueda
        const searchContainer = document.createElement('div');
        searchContainer.className = 'chat-search-container';
        searchContainer.innerHTML = `
            <div class="chat-search-input-wrapper">
                <input type="text" id="chat-search-input" placeholder="Buscar en esta conversación..." autocomplete="off">
                <button class="chat-search-close" title="Cerrar búsqueda">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chat-search-results" id="chat-search-results"></div>
        `;

        // Insertar después del header
        chatHeader.insertAdjacentElement('afterend', searchContainer);

        // Configurar event listeners
        const searchInput = document.getElementById('chat-search-input');
        const closeBtn = document.querySelector('.chat-search-close');
        const resultsContainer = document.getElementById('chat-search-results');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchInChat(e.target.value, resultsContainer);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeChatSearch();
                }
            });

            // Focus en el input
            searchInput.focus();
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChatSearch());
        }
    }

    /**
     * Cerrar búsqueda en chat
     */
    closeChatSearch() {
        const searchContainer = document.querySelector('.chat-search-container');
        if (searchContainer) {
            searchContainer.remove();
        }
        
        // Limpiar resaltado de mensajes
        this.clearMessageHighlights();
    }

    /**
     * Buscar texto en la conversación actual
     */
    searchInChat(searchText, resultsContainer) {
        if (!searchText.trim()) {
            resultsContainer.innerHTML = '';
            this.clearMessageHighlights();
            return;
        }

        const messages = document.querySelectorAll('.message-bubble');
        const searchLower = searchText.toLowerCase();
        const matches = [];

        messages.forEach((message, index) => {
            const messageText = message.textContent.toLowerCase();
            if (messageText.includes(searchLower)) {
                matches.push({
                    element: message,
                    index: index,
                    text: message.textContent
                });
            }
        });

        // Mostrar resultados
        this.displaySearchResults(matches, searchText, resultsContainer);
        
        // Resaltar coincidencias
        this.highlightMatches(messages, searchText);
    }

    /**
     * Mostrar resultados de búsqueda
     */
    displaySearchResults(matches, searchText, container) {
        if (matches.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron resultados para "${searchText}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="search-results-header">
                <span class="search-results-count">${matches.length} resultado${matches.length !== 1 ? 's' : ''} encontrado${matches.length !== 1 ? 's' : ''}</span>
                <div class="search-navigation">
                    <button class="search-nav-btn" id="search-prev" title="Anterior">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="search-nav-btn" id="search-next" title="Siguiente">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        `;

        // Configurar navegación
        this.setupSearchNavigation(matches);
    }

    /**
     * Configurar navegación de búsqueda
     */
    setupSearchNavigation(matches) {
        let currentMatch = 0;
        
        const prevBtn = document.getElementById('search-prev');
        const nextBtn = document.getElementById('search-next');

        const navigateToMatch = (index) => {
            if (matches.length === 0) return;
            
            // Limpiar resaltado anterior
            matches.forEach(match => {
                match.element.classList.remove('search-current-match');
            });

            // Resaltar coincidencia actual
            const currentMatchElement = matches[index].element;
            currentMatchElement.classList.add('search-current-match');
            
            // Scroll a la coincidencia
            currentMatchElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentMatch = currentMatch > 0 ? currentMatch - 1 : matches.length - 1;
                navigateToMatch(currentMatch);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentMatch = currentMatch < matches.length - 1 ? currentMatch + 1 : 0;
                navigateToMatch(currentMatch);
            });
        }

        // Navegar con teclado
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.chat-search-container')) {
                if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Shift+F3 o Ctrl+Shift+G: anterior
                        currentMatch = currentMatch > 0 ? currentMatch - 1 : matches.length - 1;
                    } else {
                        // F3 o Ctrl+G: siguiente
                        currentMatch = currentMatch < matches.length - 1 ? currentMatch + 1 : 0;
                    }
                    navigateToMatch(currentMatch);
                }
            }
        });

        // Ir a la primera coincidencia
        if (matches.length > 0) {
            navigateToMatch(0);
        }
    }

    /**
     * Resaltar coincidencias en mensajes
     */
    highlightMatches(messages, searchText) {
        messages.forEach(message => {
            const messageText = message.textContent;
            const searchLower = searchText.toLowerCase();
            
            if (messageText.toLowerCase().includes(searchLower)) {
                // Crear HTML con resaltado
                const highlightedText = messageText.replace(
                    new RegExp(`(${searchText})`, 'gi'),
                    '<mark class="search-highlight">$1</mark>'
                );
                
                // Solo actualizar si hay cambios
                if (message.innerHTML !== highlightedText) {
                    message.innerHTML = highlightedText;
                }
            }
        });
    }

    /**
     * Limpiar resaltado de mensajes
     */
    clearMessageHighlights() {
        const messages = document.querySelectorAll('.message-bubble');
        messages.forEach(message => {
            message.classList.remove('search-current-match');
            // Restaurar texto original (sin <mark>)
            const marks = message.querySelectorAll('mark.search-highlight');
            marks.forEach(mark => {
                mark.replaceWith(mark.textContent);
            });
        });
    }

    /**
     * Actualizar color del selector de prioridad
     */
    updatePriorityColor(selectElement) {
        const value = selectElement.value;
        selectElement.classList.remove('normal', 'baja', 'media', 'alta');
        selectElement.classList.add(value);
    }

    /**
     * Scroll al final del chat
     */
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    /**
     * Escapar HTML para prevenir XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Mostrar mensaje de error
     */
    showError(message) {
        // Crear notificación elegante en vez de alert
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Limpiar y destruir la UI
     */
    cleanup() {
        if (this.unsubscribeConversations) {
            this.unsubscribeConversations();
        }
        if (this.unsubscribeMessages) {
            this.unsubscribeMessages();
        }
        window.messagingService.cleanup();
    }
}

// Crear instancia única de la UI y hacerla disponible globalmente
window.MessagingUI = MessagingUI;
window.messagingUI = new MessagingUI();

