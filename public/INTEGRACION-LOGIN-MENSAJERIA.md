# 🔗 Guía: Integrar Login con Mensajería

## 📋 Resumen

Esta guía te muestra cómo conectar tu sistema de **login con Firebase Authentication** (email/password) con el **sistema de mensajería** que usa Firestore.

---

## 🎯 Lo que ya está listo:

✅ **`auth-messaging-integration.js`** - El puente entre login y mensajería  
✅ **`crear-usuarios-auth.html`** - Script para crear usuarios con email/password  
✅ Sistema de mensajería completo (`messaging-service.js` + `messaging-ui.js`)

---

## 🚀 Integración en 3 Pasos

### **Paso 1: Crear Usuarios con Email/Password** (2 minutos)

1. **Abre**: `public/crear-usuarios-auth.html` en tu navegador
2. **Haz clic**: "Crear Usuarios con Authentication"
3. **Espera**: 30 segundos mientras se crean los usuarios
4. **Resultado**: 4 usuarios creados que pueden hacer login

**Usuarios creados:**
```
Email: juan.perez@escuela.com | Password: 123456 | Rol: docente
Email: ana.lopez@escuela.com | Password: 123456 | Rol: secretaria
Email: maria.garcia@escuela.com | Password: 123456 | Rol: responsable
Email: carlos.silva@escuela.com | Password: 123456 | Rol: docente
```

---

### **Paso 2: Modificar tu `login.html`** (5 minutos)

Encuentra tu función de login y reemplázala con esto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Tu head existente -->
</head>
<body>
    <!-- Tu HTML existente -->
    
    <form id="login-form">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Contraseña" required>
        <button type="submit">Iniciar Sesión</button>
    </form>

    <!-- NUEVO SCRIPT -->
    <script type="module">
        import { loginWithMessaging } from './auth-messaging-integration.js';

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Esta función hace:
                // 1. Login con Firebase Auth
                // 2. Crear/obtener perfil en Firestore
                // 3. Inicializar mensajería
                const user = await loginWithMessaging(email, password);
                
                console.log('✅ Usuario logueado:', user);
                
                // Redirigir según el rol
                switch(user.role) {
                    case 'docente':
                        window.location.href = 'docente.html';
                        break;
                    case 'secretaria':
                        window.location.href = 'secretaria.html';
                        break;
                    case 'responsable':
                        window.location.href = 'responsable.html';
                        break;
                    default:
                        window.location.href = 'principal.html';
                }
                
            } catch (error) {
                console.error('❌ Error:', error);
                
                // Mensajes de error amigables
                let mensaje = 'Error al iniciar sesión';
                if (error.code === 'auth/invalid-credential') {
                    mensaje = 'Email o contraseña incorrectos';
                } else if (error.code === 'auth/user-not-found') {
                    mensaje = 'Usuario no encontrado';
                } else if (error.code === 'auth/wrong-password') {
                    mensaje = 'Contraseña incorrecta';
                }
                
                alert(mensaje);
            }
        });
    </script>
</body>
</html>
```

---

### **Paso 3: Modificar `docente.html`, `secretaria.html`, `responsable.html`** (3 minutos cada uno)

**Busca donde tienes esto:**
```javascript
const currentUser = {
    id: 'user_docente_001',
    name: 'Juan Pérez',
    // ...
};

await messagingUI.initialize(currentUser);
```

**Reemplázalo con esto:**
```html
<script type="module">
    import { setupAuthListener } from './auth-messaging-integration.js';
    
    // Configurar listener de autenticación
    // Esto automáticamente detecta el usuario logueado
    // y configura la mensajería
    setupAuthListener();
    
    // Función de logout
    window.logout = async function() {
        const { logoutWithMessaging } = await import('./auth-messaging-integration.js');
        
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await logoutWithMessaging();
        }
    };
    
    // Funciones de mensajería
    window.openNewMessageModal = () => {
        if (window.messagingUI) {
            window.messagingUI.openNewMessageModal();
        }
    };
    
    window.updatePriorityColor = (el) => {
        if (window.messagingUI) {
            window.messagingUI.updatePriorityColor(el);
        }
    };
</script>
```

---

## 🔍 ¿Cómo Funciona?

```
┌─────────────────────────────────────────────────────────┐
│                     FLUJO COMPLETO                      │
└─────────────────────────────────────────────────────────┘

1. Usuario ingresa email/password en login.html
   ↓
2. loginWithMessaging() autentica con Firebase Auth
   ↓
3. Se obtiene el UID del usuario autenticado
   ↓
4. Se busca/crea el perfil en Firestore (colección "users")
   usando el UID como document ID
   ↓
5. Se inicializa messagingUI con el perfil del usuario
   ↓
6. Usuario es redirigido a su panel
   ↓
7. setupAuthListener() detecta el usuario logueado
   ↓
8. Sistema de mensajería queda activo y funcional
```

---

## 🎯 Funciones Disponibles

### `loginWithMessaging(email, password)`
Autentica al usuario y configura la mensajería.

```javascript
const user = await loginWithMessaging('juan@example.com', '123456');
// Retorna: { id: 'uid...', name: 'Juan', email: '...', role: 'docente', ... }
```

### `setupAuthListener()`
Configura un listener que detecta cambios en la autenticación.

```javascript
setupAuthListener(); // Se ejecuta una sola vez al cargar la página
```

### `logoutWithMessaging()`
Cierra la sesión y limpia la mensajería.

```javascript
await logoutWithMessaging();
// Usuario desconectado y redirigido al login
```

### `getCurrentUser()`
Obtiene el usuario actualmente autenticado.

```javascript
const user = await getCurrentUser();
if (user) {
    console.log('Usuario:', user.name);
}
```

---

## 📊 Estructura de Datos

### Firebase Authentication
```
Usuario autenticado:
├── UID: "abc123xyz" (generado por Firebase)
├── Email: "juan.perez@escuela.com"
└── Password: (encriptado por Firebase)
```

### Firestore - Colección "users"
```
Document ID: "abc123xyz" (mismo UID de Auth)
├── name: "Juan Pérez"
├── email: "juan.perez@escuela.com"
├── role: "docente"
├── type: "docente"
├── online: true
├── lastSeen: timestamp
├── schoolId: "school1"
└── createdAt: timestamp
```

### Firestore - Colección "conversations"
```
Document ID: "conv_xyz"
├── participants: ["abc123xyz", "def456uvw"]
├── participantsInfo: { ... }
└── ...
```

---

## ✅ Ventajas de Esta Integración

✅ **Seguridad**: Usa Firebase Authentication (encriptación, recuperación de contraseña, etc.)  
✅ **Automático**: El perfil en Firestore se crea automáticamente al primer login  
✅ **Sincronizado**: El estado online/offline se actualiza automáticamente  
✅ **Limpio**: Al cerrar sesión, todo se limpia correctamente  
✅ **Escalable**: Soporta miles de usuarios sin problemas  

---

## 🐛 Solución de Problemas

### "auth/email-already-in-use"
**Problema**: El usuario ya existe en Firebase Authentication.  
**Solución**: Usa ese usuario para hacer login, o elimínalo desde Firebase Console.

### "Missing or insufficient permissions"
**Problema**: Las reglas de Firestore no permiten la operación.  
**Solución**: Revisa que las reglas de Firestore permitan lectura/escritura en la colección "users".

### "Cannot read property 'initialize' of undefined"
**Problema**: messagingUI no está cargado.  
**Solución**: Verifica que hayas importado los scripts correctamente y que no haya errores en la consola.

### Usuario se desconecta automáticamente
**Problema**: Firebase Auth cierra la sesión después de un tiempo.  
**Solución**: Esto es normal. El usuario deberá volver a hacer login.

---

## 📝 Checklist de Integración

```
□ Crear usuarios con email/password (usar crear-usuarios-auth.html)
□ Modificar login.html para usar loginWithMessaging()
□ Modificar docente.html para usar setupAuthListener()
□ Modificar secretaria.html para usar setupAuthListener()
□ Modificar responsable.html para usar setupAuthListener()
□ Modificar principal.html para usar setupAuthListener()
□ Actualizar función logout() en todas las páginas
□ Probar el login completo
□ Probar la mensajería
□ Probar el logout
```

---

## 🎉 ¡Listo!

Con esta integración, tienes un sistema completo donde:
- Los usuarios hacen login con email/password
- Se crea automáticamente su perfil en Firestore
- Pueden usar la mensajería inmediatamente
- Todo está sincronizado y seguro

---

## 📞 Próximos Pasos Opcionales

- [ ] Agregar recuperación de contraseña
- [ ] Agregar cambio de contraseña
- [ ] Agregar actualización de perfil (nombre, avatar)
- [ ] Agregar verificación de email
- [ ] Agregar roles y permisos más complejos

---

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver mensajes de debug.

