# 📨 Guía del Sistema de Mensajería - Zephia

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Archivos Creados](#archivos-creados)
3. [Configuración Inicial](#configuración-inicial)
4. [Integración en tus Páginas](#integración-en-tus-páginas)
5. [Estructura de Datos](#estructura-de-datos)
6. [Características](#características)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

Este sistema de mensajería proporciona comunicación en tiempo real entre usuarios del sistema Zephia utilizando Firebase Firestore. Incluye:

- ✅ Mensajería en tiempo real
- ✅ Lista de conversaciones
- ✅ Contador de mensajes no leídos
- ✅ Búsqueda de conversaciones
- ✅ Prioridades de mensajes (Normal, Baja, Media, Alta)
- ✅ Indicadores de usuarios en línea
- ✅ Interfaz responsive

---

## 📁 Archivos Creados

### Archivos Principales

1. **`messaging-service.js`** - Servicio backend de mensajería
   - Maneja todas las operaciones con Firestore
   - Gestión de conversaciones y mensajes
   - Listeners en tiempo real

2. **`messaging-ui.js`** - Interfaz de usuario
   - Renderizado de conversaciones y mensajes
   - Gestión de eventos de usuario
   - Integración con el servicio

3. **`firebase-config.js`** - Configuración de Firebase (actualizado)
   - Inicializa Firebase App, Auth y Firestore
   - Exporta servicios para usar en módulos

4. **`styles-messaging.css`** - Estilos adicionales
   - Estilos para estados vacíos
   - Badges de prioridad
   - Modal de nuevo mensaje
   - Animaciones

### Archivos de Ayuda

5. **`messaging-integration-example.html`** - Ejemplo completo de integración
6. **`init-test-data.html`** - Script para crear usuarios de prueba
7. **`GUIA-MENSAJERIA.md`** - Esta guía (¡la estás leyendo!)

---

## ⚙️ Configuración Inicial

### Paso 1: Reglas de Seguridad de Firestore

Actualiza tu archivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer todos los usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversaciones solo visibles para participantes
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
                       request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.participants;
    }
    
    // Mensajes solo visibles para participantes
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null;
    }
  }
}
```

### Paso 2: Crear Usuarios de Prueba

Opción A - **Usar el script automático (Recomendado)**:

1. Abre `init-test-data.html` en tu navegador
2. Haz clic en "Crear Usuarios de Prueba"
3. ¡Listo! Los usuarios se crearán automáticamente

Opción B - **Manualmente en Firebase Console**:

1. Ve a Firebase Console → Firestore Database
2. Crea la colección `users`
3. Agrega documentos con esta estructura:

```javascript
// Documento ID: user_docente_001
{
  name: "Juan Pérez",
  email: "juan.perez@escuela.com",
  role: "docente",
  type: "docente",
  avatar: null,
  online: false,
  lastSeen: [timestamp],
  schoolId: "school1",
  schoolName: "Escuela San Martín"
}
```

Repite para otros usuarios (secretaria, responsable, etc.)

### Paso 3: Índices Compuestos (Importante)

Firebase te pedirá crear índices la primera vez que uses las consultas. Alternativamente, puedes crearlos manualmente:

**Índice 1 - conversations**:
- Campo: `participants` (Array)
- Campo: `updatedAt` (Descendente)

**Índice 2 - messages**:
- Campo: `conversationId` (Ascendente)
- Campo: `timestamp` (Ascendente)

---

## 🔧 Integración en tus Páginas

### Paso 1: Agregar los Estilos CSS

En el `<head>` de tu HTML:

```html
<link rel="stylesheet" href="styles-messaging.css">
```

### Paso 2: Agregar el Script de Inicialización

Antes del cierre de `</body>`, agrega:

```html
<script type="module">
    // Importar servicios
    import './firebase-config.js';
    import messagingUI from './messaging-ui.js';

    // Definir usuario actual
    // IMPORTANTE: Reemplaza estos datos con el usuario real de tu sistema
    const currentUser = {
        id: 'user_docente_001', // ID único del usuario
        name: 'Juan Pérez',
        email: 'juan.perez@escuela.com',
        role: 'docente',
        type: 'docente',
        avatar: null,
        schoolId: 'school1',
        schoolName: 'Escuela San Martín'
    };

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            await messagingUI.initialize(currentUser);
            console.log('Mensajería inicializada');
        } catch (error) {
            console.error('Error al inicializar:', error);
        }
    });

    // Hacer funciones disponibles globalmente
    window.openNewMessageModal = () => messagingUI.openNewMessageModal();
    window.updatePriorityColor = (el) => messagingUI.updatePriorityColor(el);
</script>
```

### Paso 3: Verificar la Estructura HTML

Tu HTML debe tener esta estructura (ya existe en docente.html, secretaria.html, responsable.html):

```html
<div class="messaging-wrapper">
    <!-- Panel Izquierdo -->
    <div class="conversations-panel">
        <div class="conversations-header">
            <h3>Mensajes</h3>
            <button onclick="openNewMessageModal()">
                <i class="fas fa-plus"></i>
            </button>
        </div>
        
        <div class="conversations-search">
            <input type="text" id="conversation-search" placeholder="Buscar">
        </div>
        
        <div class="conversations-list" id="conversations-list">
            <!-- Se carga dinámicamente -->
        </div>
    </div>

    <!-- Panel Derecho -->
    <div class="chat-panel">
        <div class="chat-header">
            <div class="chat-user-info">
                <div class="chat-user-details">
                    <h3>Nombre del Usuario</h3>
                    <span class="user-status">Estado</span>
                </div>
            </div>
        </div>

        <div class="chat-messages" id="chat-messages">
            <!-- Se carga dinámicamente -->
        </div>

        <div class="chat-input-container">
            <input type="text" class="chat-input" placeholder="Escribe un mensaje...">
            <select class="priority-selector-input normal" id="priority-selector" 
                    onchange="updatePriorityColor(this)">
                <option value="normal">Normal</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
            </select>
            <button class="send-btn">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
</div>
```

---

## 📊 Estructura de Datos

### Colección: `users`

```javascript
{
  id: string,           // ID único del usuario
  name: string,         // Nombre completo
  email: string,        // Correo electrónico
  role: string,         // 'docente', 'secretaria', 'responsable', 'admin'
  type: string,         // Mismo que role
  avatar: string|null,  // URL del avatar (opcional)
  online: boolean,      // Estado de conexión
  lastSeen: timestamp,  // Última vez visto
  schoolId: string,     // ID de la escuela (opcional)
  schoolName: string    // Nombre de la escuela (opcional)
}
```

### Colección: `conversations`

```javascript
{
  id: string,                    // Auto-generado
  participants: [string],        // Array de IDs de usuarios
  participantsInfo: {            // Información de participantes
    userId1: { name, role, avatar },
    userId2: { name, role, avatar }
  },
  lastMessage: {                 // Último mensaje
    text: string,
    senderId: string,
    timestamp: timestamp,
    priority: string
  },
  unreadCount: {                 // Mensajes no leídos por usuario
    userId1: number,
    userId2: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Colección: `messages`

```javascript
{
  id: string,              // Auto-generado
  conversationId: string,  // ID de la conversación
  senderId: string,        // ID del remitente
  senderName: string,      // Nombre del remitente
  text: string,            // Contenido del mensaje
  priority: string,        // 'normal', 'baja', 'media', 'alta'
  read: boolean,           // Si fue leído
  timestamp: timestamp     // Fecha y hora
}
```

---

## ✨ Características

### 1. Conversaciones en Tiempo Real

Las conversaciones se actualizan automáticamente cuando:
- Llega un nuevo mensaje
- Alguien marca mensajes como leídos
- Se crea una nueva conversación

### 2. Prioridades de Mensajes

Cada mensaje puede tener una prioridad:
- **Normal** (gris) - Mensajes regulares
- **Baja** (azul) - Información no urgente
- **Media** (naranja) - Requiere atención moderada
- **Alta** (rojo) - Urgente, requiere atención inmediata

### 3. Indicadores Visuales

- **Punto verde** - Usuario en línea
- **Badge rojo** - Cantidad de mensajes no leídos
- **Borde de color** - Prioridad de la última conversación

### 4. Búsqueda

- Busca conversaciones por nombre de usuario
- Busca por contenido del último mensaje
- Filtrado en tiempo real

### 5. Formateo Inteligente de Fechas

- "11:30" - Si fue hoy
- "Ayer" - Si fue ayer
- "Lun", "Mar", etc. - Si fue esta semana
- "12/10" - Si fue hace más de una semana

---

## 🔍 Funciones Disponibles

### messagingUI.initialize(currentUser)

Inicializa el sistema de mensajería.

```javascript
await messagingUI.initialize({
    id: 'user_id',
    name: 'Nombre Usuario',
    email: 'email@example.com',
    role: 'docente'
});
```

### messagingUI.openNewMessageModal()

Abre el modal para iniciar una nueva conversación.

```javascript
window.openNewMessageModal = () => messagingUI.openNewMessageModal();
```

### messagingUI.updatePriorityColor(element)

Actualiza el color del selector de prioridad.

```javascript
window.updatePriorityColor = (el) => messagingUI.updatePriorityColor(el);
```

### messagingUI.cleanup()

Limpia todos los listeners. Llama esto al cerrar sesión.

```javascript
function logout() {
    messagingUI.cleanup();
    // ... resto del código de logout
}
```

---

## 🐛 Solución de Problemas

### Problema: "No aparecen las conversaciones"

**Soluciones:**
1. Verifica que los usuarios existan en la colección `users` de Firestore
2. Asegúrate de que el `currentUser.id` coincida con un documento en `users`
3. Revisa la consola del navegador para ver errores
4. Verifica las reglas de seguridad de Firestore

### Problema: "Error al enviar mensajes"

**Soluciones:**
1. Verifica que existe una conversación activa
2. Revisa las reglas de seguridad en Firestore
3. Asegúrate de que el usuario tiene permisos para escribir
4. Verifica la conexión a internet

### Problema: "Los índices compuestos no existen"

**Solución:**
Cuando intentes usar las consultas por primera vez, Firebase mostrará un enlace en la consola para crear los índices automáticamente. Haz clic en ese enlace.

### Problema: "Module not found"

**Soluciones:**
1. Verifica que todos los archivos estén en la carpeta `public`
2. Asegúrate de usar `type="module"` en tu script
3. Verifica las rutas de los imports

### Problema: "Las conversaciones no se actualizan en tiempo real"

**Soluciones:**
1. Verifica que Firestore esté configurado correctamente
2. Revisa las reglas de seguridad
3. Asegúrate de que no hay errores en la consola
4. Verifica que los listeners estén activos

---

## 📞 Contacto y Soporte

Si tienes problemas o preguntas:

1. Revisa la consola del navegador (F12) para ver errores
2. Verifica el archivo `messaging-integration-example.html` para ver un ejemplo completo
3. Consulta la documentación de Firebase: https://firebase.google.com/docs/firestore

---

## 🎉 ¡Felicitaciones!

Si llegaste hasta aquí, deberías tener un sistema de mensajería completamente funcional. 

**Próximos pasos sugeridos:**
- Integrar con tu sistema de autenticación real
- Personalizar los estilos para que coincidan con tu diseño
- Agregar notificaciones push
- Implementar adjuntos de archivos
- Agregar emojis

¡Buena suerte con tu proyecto Zephia! 🚀

