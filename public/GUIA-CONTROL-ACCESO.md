# 🔐 Guía del Sistema de Control de Acceso - Zephia

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Permisos por Rol](#permisos-por-rol)
3. [Implementación Frontend](#implementación-frontend)
4. [Implementación Backend](#implementación-backend)
5. [Cómo Funciona](#cómo-funciona)
6. [Desplegar las Reglas](#desplegar-las-reglas)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Introducción

El sistema de control de acceso de Zephia implementa **seguridad en dos capas**:

1. **Frontend** (access-control.js): Oculta opciones del menú y valida acceso a páginas
2. **Backend** (firestore.rules): Protege los datos en Firestore según el rol

Este enfoque garantiza:
- ✅ Mejor experiencia de usuario (no ve opciones que no puede usar)
- ✅ Seguridad real (los datos están protegidos incluso si alguien intenta acceder directamente)

---

## 👥 Permisos por Rol

### 🔴 **Admin** - Acceso Total

| Permiso | ¿Puede? |
|---------|---------|
| Ver todas las escuelas | ✅ Sí |
| Crear/Editar/Eliminar escuelas | ✅ Sí |
| Ver todos los docentes | ✅ Sí |
| Crear/Editar/Eliminar docentes | ✅ Sí |
| Ver/Gestionar usuarios | ✅ Sí |
| Acceder a Dashboard | ✅ Sí |
| Ver Reportes | ✅ Sí |
| Soporte | ✅ Sí |
| Mensajería | ✅ Sí |
| Acceder a cualquier página | ✅ Sí |

---

### 🟡 **Responsable a Cargo** - Acceso Intermedio

| Permiso | ¿Puede? |
|---------|---------|
| Ver **sus** escuelas asignadas | ✅ Sí |
| Crear/Editar sus escuelas | ✅ Sí |
| Eliminar escuelas | ❌ No |
| Ver docentes de **sus** escuelas | ✅ Sí |
| Crear/Editar docentes de sus escuelas | ✅ Sí |
| Eliminar docentes | ❌ No |
| Ver/Gestionar usuarios | ❌ No |
| Acceder a Dashboard | ✅ Sí |
| Ver Reportes | ✅ Sí |
| Soporte | ❌ No |
| Mensajería | ✅ Sí |
| Páginas permitidas | Solo `responsable.html` |

---

### 🟢 **Secretaria** - Acceso Limitado

| Permiso | ¿Puede? |
|---------|---------|
| Ver escuelas | ❌ No |
| Ver docentes | ❌ No |
| Ver/Gestionar usuarios | ❌ No |
| Acceder a Dashboard | ❌ No |
| Ver Reportes | ✅ Sí |
| Soporte | ❌ No |
| Mensajería | ✅ Sí |
| Páginas permitidas | Solo `secretaria.html` |

---

### 🔵 **Docente** - Acceso Mínimo

| Permiso | ¿Puede? |
|---------|---------|
| Ver escuelas | ❌ No |
| Ver docentes | ❌ No |
| Ver/Gestionar usuarios | ❌ No |
| Acceder a Dashboard | ❌ No |
| Ver Reportes | ❌ No |
| Soporte | ❌ No |
| Mensajería | ✅ Sí |
| Páginas permitidas | Solo `docente.html` |

---

## 💻 Implementación Frontend

### Archivo: `access-control.js`

Este módulo maneja el control de acceso en el cliente:

#### Funciones Principales:

```javascript
// Verificar si tiene un permiso específico
hasPermission(userRole, 'canAccessSchools') // → true/false

// Verificar si puede acceder a una página
canAccessPage('docente', 'responsable.html') // → false

// Aplicar control de acceso a la UI
applyAccessControl(user) // Oculta/muestra elementos según rol

// Verificar acceso y redirigir si no tiene permisos
checkPageAccess(user) // Redirige automáticamente si no puede acceder
```

#### Integración Automática:

El control de acceso se aplica **automáticamente** cuando el usuario inicia sesión gracias a `setupAuthListener()` en `auth-messaging-integration.js`.

---

## 🔒 Implementación Backend

### Archivo: `firestore.rules`

Las reglas de Firestore protegen los datos a nivel de base de datos.

#### Estructura de las Reglas:

```
1. Funciones auxiliares (isAdmin, isResponsable, etc.)
   ↓
2. Reglas por colección:
   - users: Todos pueden leer, solo propietario y admin pueden editar
   - schools: Solo admin y responsable pueden acceder
   - teachers: Solo admin y responsable pueden acceder
   - conversations: Solo participantes pueden acceder
   - messages: Todos los autenticados pueden leer/escribir
   - reports: Admin, responsable y secretaria pueden leer
   ↓
3. Regla por defecto: Denegar todo lo demás
```

#### Ejemplos de Reglas:

```javascript
// Solo admin y responsable pueden leer escuelas
match /schools/{schoolId} {
  allow read: if isAdminOrResponsable();
  allow create: if isAdminOrResponsable();
  allow update: if isAdminOrResponsable();
  allow delete: if isAdmin(); // Solo admin puede eliminar
}

// Solo participantes pueden leer conversaciones
match /conversations/{conversationId} {
  allow read: if isAuthenticated() && 
                 request.auth.uid in resource.data.participants;
}
```

---

## ⚙️ Cómo Funciona

### Flujo Completo:

```
1. Usuario hace login (login.html)
   ↓
2. loginWithMessaging() autentica con Firebase
   ↓
3. Se obtiene el perfil del usuario (incluye el rol)
   ↓
4. Se redirige a la página según su rol:
   - admin → principal.html
   - responsable → responsable.html
   - secretaria → secretaria.html
   - docente → docente.html
   ↓
5. setupAuthListener() detecta el usuario
   ↓
6. checkPageAccess() verifica si puede acceder
   ↓
7. applyAccessControl() oculta elementos según permisos
   ↓
8. Usuario ve solo lo que tiene permitido
   ↓
9. Al intentar acceso no permitido:
   - Frontend: Redirige a su página por defecto
   - Backend: Firestore rechaza la operación
```

### Diagrama de Verificación:

```
¿Usuario intenta hacer algo?
    ↓
Frontend verifica permiso
    ├── ✅ Tiene permiso → Permite acción
    └── ❌ No tiene → Muestra "Acceso denegado"
    
Backend (Firestore) verifica permiso
    ├── ✅ Tiene permiso → Ejecuta operación
    └── ❌ No tiene → Rechaza con error
```

---

## 🚀 Desplegar las Reglas

### Opción 1: Firebase Console (Manual)

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **zephia-51ad4**
3. Menú izquierdo: **Firestore Database**
4. Pestaña: **Reglas** (Rules)
5. **Copia** el contenido de `firestore.rules`
6. **Pégalo** en el editor
7. Haz clic en **"Publicar"** (Publish)

### Opción 2: Firebase CLI (Recomendado)

```bash
# Navegar a tu proyecto
cd C:\Users\ssrdo\Pictures\probando

# Desplegar las reglas
firebase deploy --only firestore:rules
```

### Verificar que las Reglas Están Activas:

1. Ve a Firebase Console → Firestore Database → Reglas
2. Deberías ver las reglas con funciones como `isAdmin()`, `isResponsable()`, etc.
3. En la parte superior verás: "Última vez publicado: hace X minutos"

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Verificar Permiso Antes de una Acción

```javascript
import accessControl from './access-control.js';

function deleteSchool(schoolId) {
    const user = getCurrentUser(); // Tu función para obtener usuario actual
    
    if (accessControl.hasPermission(user.role, 'canDeleteSchools')) {
        // Usuario tiene permiso, proceder
        // ... código para eliminar escuela
    } else {
        accessControl.showAccessDenied('eliminar escuelas');
    }
}
```

### Ejemplo 2: Usar withPermission Helper

```javascript
import { withPermission } from './access-control.js';

function editTeacher(teacherId) {
    const user = getCurrentUser();
    
    withPermission(
        user,
        'canEditTeachers',
        () => {
            // Esta función solo se ejecuta si tiene permiso
            openEditModal(teacherId);
        },
        'editar docentes'
    );
}
```

### Ejemplo 3: Ocultar Botón Según Permisos

```javascript
import { hasPermission } from './access-control.js';

function renderActionButtons(user) {
    const deleteBtn = document.getElementById('delete-btn');
    
    if (!hasPermission(user.role, 'canDeleteSchools')) {
        deleteBtn.style.display = 'none';
    }
}
```

### Ejemplo 4: Verificar Acceso en Tiempo Real

```javascript
// Esto ya se hace automáticamente al cargar la página
// Pero puedes verificar manualmente si quieres:

import { canAccessPage } from './access-control.js';

const user = getCurrentUser();
const currentPage = 'responsable.html';

if (!canAccessPage(user.role, currentPage)) {
    alert('No tienes acceso a esta página');
    window.location.href = 'login.html';
}
```

---

## 🛡️ Seguridad Adicional

### Mejores Prácticas:

1. **Nunca confíes solo en el frontend**
   - Siempre valida en el backend (Firestore Rules)
   - El frontend es solo para UX, no para seguridad

2. **Valida permisos en cada operación**
   - Antes de crear/editar/eliminar, verifica permisos
   - No asumas que el usuario tiene permiso

3. **Registra intentos de acceso no autorizado**
   ```javascript
   if (!hasPermission(user.role, 'canDeleteSchools')) {
       console.warn(`Usuario ${user.id} intentó eliminar escuela sin permiso`);
       // Opcional: Enviar a un sistema de logs
   }
   ```

4. **Mantén las reglas de Firestore actualizadas**
   - Despliega las reglas cada vez que cambies permisos
   - Prueba las reglas en el simulador de Firebase Console

---

## 🧪 Probar el Sistema

### Test 1: Probar como Docente

```
1. Login con: juan.perez@escuela.com / 123456
2. Deberías ver SOLO la sección de Mensajería
3. Intenta acceder a: responsable.html directamente
   → Deberías ser redirigido a docente.html
```

### Test 2: Probar como Secretaria

```
1. Login con: ana.lopez@escuela.com / 123456
2. Deberías ver: Mensajería y Reportes
3. NO deberías ver: Escuelas, Docentes, Dashboard
```

### Test 3: Probar como Responsable

```
1. Login con: maria.garcia@escuela.com / 123456
2. Deberías ver: Escuelas, Docentes, Dashboard, Reportes, Mensajería
3. NO deberías ver: Usuarios, Soporte
```

### Test 4: Probar Reglas de Firestore

```
1. Ve a Firebase Console → Firestore Database → Reglas
2. Haz clic en "Simulador de reglas"
3. Prueba operaciones:
   - Leer /schools/school1 como docente → Debería fallar
   - Leer /schools/school1 como responsable → Debería pasar
   - Eliminar /schools/school1 como responsable → Debería fallar
   - Eliminar /schools/school1 como admin → Debería pasar
```

---

## 🔧 Solución de Problemas

### Problema: "Usuario puede ver secciones que no debería"

**Solución:**
1. Verifica que `applyAccessControl()` se esté llamando
2. Abre la consola del navegador y busca: "Control de acceso aplicado para rol: X"
3. Si no aparece, verifica que setupAuthListener() se esté ejecutando

### Problema: "Firebase rechaza operaciones permitidas"

**Solución:**
1. Verifica que las reglas de Firestore estén desplegadas
2. Ve a Firebase Console → Firestore → Reglas
3. Asegúrate de que el rol del usuario esté correctamente guardado en su documento

### Problema: "Usuario es redirigido constantemente"

**Solución:**
1. Verifica que el usuario tenga el campo `role` en su documento de Firestore
2. Verifica que el rol sea uno válido: 'admin', 'responsable', 'secretaria', 'docente'
3. Revisa la consola para ver mensajes de error

---

## 📊 Resumen de Archivos

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `access-control.js` | Control de acceso frontend | `public/` |
| `firestore.rules` | Reglas de seguridad backend | Raíz del proyecto |
| `auth-messaging-integration.js` | Integración automática | `public/` |
| `GUIA-CONTROL-ACCESO.md` | Esta guía | `public/` |

---

## ✅ Checklist de Implementación

```
□ Archivo access-control.js creado
□ Archivo firestore.rules creado
□ auth-messaging-integration.js actualizado
□ Reglas desplegadas en Firebase
□ Usuarios de prueba tienen campo 'role' en Firestore
□ Probado con cada tipo de rol
□ Verificadas reglas en el simulador de Firebase
□ Documentación revisada
```

---

## 🎉 ¡Sistema de Control de Acceso Completo!

Con esta implementación tienes:
- ✅ Control de acceso en frontend (UX)
- ✅ Control de acceso en backend (Seguridad)
- ✅ Permisos granulares por rol
- ✅ Redirección automática
- ✅ Protección de datos en Firestore
- ✅ Sistema fácil de extender

---

**Fecha de creación**: Octubre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción Ready

¡Disfruta tu sistema seguro! 🔐🚀

