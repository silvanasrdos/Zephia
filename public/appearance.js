// Sistema de Personalización de Apariencia para Zephia
// Maneja modo claro/oscuro y personalización de colores de chat

// Variable global para almacenar el ID del usuario actual
let currentUserId = null;

/**
 * Cargar preferencias guardadas al iniciar
 */
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase Auth esté listo
    setTimeout(() => {
        if (window.firebase && window.firebase.auth) {
            const auth = window.firebase.auth();
            auth.onAuthStateChanged((user) => {
                if (user) {
                    currentUserId = user.uid;
                    loadAppearancePreferences();
                }
            });
        }
    }, 500);
});

/**
 * Obtener clave de localStorage para el usuario actual
 */
function getUserKey(key) {
    if (!currentUserId) {
        return `zephia_${key}_default`;
    }
    return `zephia_${key}_${currentUserId}`;
}

/**
 * Cargar preferencias de apariencia del localStorage
 */
function loadAppearancePreferences() {
    try {
        if (!currentUserId) {
            console.warn('No hay usuario autenticado, usando valores por defecto');
            return;
        }

        // Migrar preferencias antiguas si existen (solo la primera vez)
        migrateOldPreferences();

        // Cargar tema
        const savedTheme = localStorage.getItem(getUserKey('theme')) || 'light';
        applyTheme(savedTheme);
        updateThemeButtonState(savedTheme);

        // Cargar color de chat personalizado
        const savedColor1 = localStorage.getItem(getUserKey('chat_color_1'));
        const savedColor2 = localStorage.getItem(getUserKey('chat_color_2'));
        
        if (savedColor1 && savedColor2) {
            applyChatColor(savedColor1, savedColor2);
            updateColorButtonState(savedColor1);
        }

        console.log('✨ Preferencias de apariencia cargadas para el usuario:', currentUserId);
    } catch (error) {
        console.error('Error al cargar preferencias de apariencia:', error);
    }
}

/**
 * Migrar preferencias antiguas del sistema anterior (sin ID de usuario)
 */
function migrateOldPreferences() {
    if (!currentUserId) return;
    
    // Verificar si ya se migró
    const migrated = localStorage.getItem(`zephia_migrated_${currentUserId}`);
    if (migrated) return;
    
    // Migrar preferencias antiguas si existen
    const oldTheme = localStorage.getItem('zephia_theme');
    const oldColor1 = localStorage.getItem('zephia_chat_color_1');
    const oldColor2 = localStorage.getItem('zephia_chat_color_2');
    
    if (oldTheme) {
        localStorage.setItem(getUserKey('theme'), oldTheme);
        console.log('📦 Tema migrado para el usuario');
    }
    
    if (oldColor1 && oldColor2) {
        localStorage.setItem(getUserKey('chat_color_1'), oldColor1);
        localStorage.setItem(getUserKey('chat_color_2'), oldColor2);
        console.log('📦 Colores migrados para el usuario');
    }
    
    // Marcar como migrado
    localStorage.setItem(`zephia_migrated_${currentUserId}`, 'true');
}

/**
 * Abrir modal de apariencia
 */
function openAppearanceModal() {
    const modal = document.getElementById('appearance-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Cerrar modal de apariencia
 */
function closeAppearanceModal() {
    const modal = document.getElementById('appearance-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Cambiar tema (claro/oscuro)
 */
function setTheme(theme) {
    if (!currentUserId) {
        showNotification('Error: No hay usuario autenticado');
        return;
    }
    
    localStorage.setItem(getUserKey('theme'), theme);
    applyTheme(theme);
    updateThemeButtonState(theme);
    
    // Notificación
    showNotification(`Tema ${theme === 'dark' ? 'oscuro' : 'claro'} activado`);
}

/**
 * Aplicar tema
 */
function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
        // Colores modo oscuro
        root.style.setProperty('--background-color', '#1a1a1a');
        root.style.setProperty('--card-background', '#2d2d2d');
        root.style.setProperty('--text-color', '#e0e0e0');
        root.style.setProperty('--text-light', '#a0a0a0');
        root.style.setProperty('--border-color', '#404040');
        document.body.classList.add('dark-mode');
    } else {
        // Colores modo claro (valores por defecto)
        root.style.setProperty('--background-color', '#f5f7fa');
        root.style.setProperty('--card-background', '#ffffff');
        root.style.setProperty('--text-color', '#2c3e50');
        root.style.setProperty('--text-light', '#7f8c8d');
        root.style.setProperty('--border-color', '#e1e8ed');
        document.body.classList.remove('dark-mode');
    }
}

/**
 * Actualizar estado visual del botón de tema
 */
function updateThemeButtonState(theme) {
    const buttons = document.querySelectorAll('.theme-option');
    buttons.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Cambiar color de chat
 */
function setChatColor(color1, color2) {
    if (!currentUserId) {
        showNotification('Error: No hay usuario autenticado');
        return;
    }
    
    localStorage.setItem(getUserKey('chat_color_1'), color1);
    localStorage.setItem(getUserKey('chat_color_2'), color2);
    applyChatColor(color1, color2);
    updateColorButtonState(color1);
    
    // Notificación
    showNotification('Color de chat actualizado');
}

/**
 * Aplicar color personalizado a los chats
 */
function applyChatColor(color1, color2) {
    const root = document.documentElement;
    
    // Actualizar variables CSS para los mensajes enviados
    root.style.setProperty('--primary-color', color1);
    root.style.setProperty('--secondary-color', color2);
    
    // Actualizar estilos específicos de mensajes enviados
    const style = document.getElementById('custom-chat-style') || document.createElement('style');
    style.id = 'custom-chat-style';
    style.textContent = `
        .message.sent .message-bubble {
            background: linear-gradient(135deg, ${color1}, ${color2}) !important;
        }
        
        .sidebar {
            background: linear-gradient(135deg, ${color1}, ${color2}) !important;
        }
        
        .send-btn {
            background: linear-gradient(135deg, ${color1}, ${color2}) !important;
        }
        
        .attachment-btn:hover {
            color: ${color1} !important;
        }
        
        .chat-input:focus {
            border-color: ${color1} !important;
        }
        
        .message.sent .message-bubble.priority-alta {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
        }
        
        .message.sent .message-bubble.priority-media {
            background: linear-gradient(135deg, #f39c12, #e67e22) !important;
        }
        
        .message.sent .message-bubble.priority-baja {
            background: linear-gradient(135deg, #3498db, #2980b9) !important;
        }
    `;
    
    if (!document.getElementById('custom-chat-style')) {
        document.head.appendChild(style);
    }
}

/**
 * Actualizar estado visual del botón de color
 */
function updateColorButtonState(selectedColor) {
    const buttons = document.querySelectorAll('.color-option');
    buttons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (btn.dataset.color === selectedColor) {
            if (!icon) {
                btn.innerHTML = '<i class="fas fa-check"></i>';
            }
            btn.classList.add('active');
        } else {
            if (icon) {
                btn.innerHTML = '';
            }
            btn.classList.remove('active');
        }
    });
}

/**
 * Restaurar valores predeterminados
 */
function resetAppearance() {
    if (!currentUserId) {
        showNotification('Error: No hay usuario autenticado');
        return;
    }
    
    if (confirm('¿Estás seguro de que deseas restaurar la apariencia predeterminada?')) {
        // Limpiar localStorage para este usuario
        localStorage.removeItem(getUserKey('theme'));
        localStorage.removeItem(getUserKey('chat_color_1'));
        localStorage.removeItem(getUserKey('chat_color_2'));
        
        // Aplicar valores por defecto
        applyTheme('light');
        updateThemeButtonState('light');
        
        applyChatColor('#8b4513', '#5a2d0f');
        updateColorButtonState('#8b4513');
        
        // Notificación
        showNotification('Apariencia restaurada a los valores predeterminados');
    }
}

/**
 * Mostrar notificación temporal
 */
function showNotification(message) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'appearance-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Cerrar modal al hacer clic fuera de él
window.addEventListener('click', (e) => {
    const modal = document.getElementById('appearance-modal');
    if (e.target === modal) {
        closeAppearanceModal();
    }
});

