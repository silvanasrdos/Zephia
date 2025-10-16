# 🚀 Sistema de Mensajería Zephia - Inicio Rápido

## 📦 ¿Qué se ha creado?

Se ha implementado un **sistema completo de mensajería en tiempo real** para la aplicación Zephia con las siguientes características:

### ✨ Características Principales

- ✅ **Mensajería en tiempo real** con Firebase Firestore
- ✅ **Lista de conversaciones** con últimos mensajes
- ✅ **Contador de mensajes no leídos**
- ✅ **Búsqueda de conversaciones** en tiempo real
- ✅ **Crear nuevas conversaciones** con cualquier usuario
- ✅ **Enviar mensajes con prioridades** (Normal, Baja, Media, Alta)
- ✅ **Marcar mensajes como leídos** automáticamente
- ✅ **Indicador de usuarios en línea**
- ✅ **Formateo de fechas** relativas (Hoy, Ayer, etc.)
- ✅ **Scroll automático** a últimos mensajes
- ✅ **Interfaz responsive** para móviles

---

## 📁 Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `messaging-service.js` | Servicio backend de mensajería (Firestore) |
| `messaging-ui.js` | Interfaz de usuario y gestión de eventos |
| `styles-messaging.css` | Estilos adicionales para la mensajería |
| `firebase-config.js` | Configuración actualizada de Firebase |
| `GUIA-MENSAJERIA.md` | Guía completa del sistema (¡léela!) |
| `messaging-integration-example.html` | Ejemplo de integración |
| `init-test-data.html` | Script para crear usuarios de prueba |
| `docente-con-mensajeria.html` | Ejemplo funcional completo |

---

## ⚡ Inicio Rápido (5 pasos)

### 1️⃣ Crear Usuarios de Prueba

**Opción A - Automática (Recomendada)**:
```
1. Abre: public/init-test-data.html en tu navegador
2. Haz clic en "Crear Usuarios de Prueba"
3. ¡Listo! 4 usuarios creados automáticamente
```

**Opción B - Manual**:
- Ve a Firebase Console → Firestore
- Crea la colección `users`
- Agrega documentos según la guía

### 2️⃣ Configurar Reglas de Firestore

Copia el contenido de las reglas de seguridad desde `GUIA-MENSAJERIA.md` a tu archivo `firestore.rules` y despliega:

```bash
firebase deploy --only firestore:rules
```

### 3️⃣ Probar el Sistema

Abre `public/docente-con-mensajeria.html` en tu navegador para ver el sistema en acción.

### 4️⃣ Integrar en tus Páginas

Copia el código de integración desde `messaging-integration-example.html` a tus archivos HTML existentes (docente.html, secretaria.html, etc.)

### 5️⃣ Personalizar

Ajusta el objeto `currentUser` con los datos reales de tu sistema de autenticación.

---

## 📖 Documentación

- **Guía Completa**: Lee `GUIA-MENSAJERIA.md` para toda la documentación
- **Ejemplo de Código**: Revisa `messaging-integration-example.html`
- **Ejemplo Funcional**: Abre `docente-con-mensajeria.html`

---

## 🔧 Integración Básica

Agrega esto a tu HTML:

```html
<!-- En el <head> -->
<link rel="stylesheet" href="styles-messaging.css">

<!-- Antes de </body> -->
<script type="module">
    import './firebase-config.js';
    import messagingUI from './messaging-ui.js';

    const currentUser = {
        id: 'user_docente_001',
        name: 'Juan Pérez',
        email: 'juan.perez@escuela.com',
        role: 'docente',
        type: 'docente'
    };

    document.addEventListener('DOMContentLoaded', async () => {
        await messagingUI.initialize(currentUser);
    });

    window.openNewMessageModal = () => messagingUI.openNewMessageModal();
    window.updatePriorityColor = (el) => messagingUI.updatePriorityColor(el);
</script>
```

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ Crear usuarios de prueba (usa `init-test-data.html`)
2. ✅ Configurar reglas de Firestore
3. ✅ Probar con `docente-con-mensajeria.html`
4. 🔲 Integrar en docente.html
5. 🔲 Integrar en secretaria.html
6. 🔲 Integrar en responsable.html
7. 🔲 Integrar en principal.html
8. 🔲 Conectar con sistema de autenticación real
9. 🔲 Personalizar estilos

---

## 🐛 Solución de Problemas

### "No veo conversaciones"
- Verifica que los usuarios existan en Firestore (colección `users`)
- Asegúrate de que el `currentUser.id` coincida con un usuario en Firestore
- Revisa la consola del navegador (F12)

### "Error al enviar mensajes"
- Verifica las reglas de seguridad de Firestore
- Asegúrate de tener una conversación seleccionada
- Revisa la consola para errores

### "Module not found"
- Verifica que todos los archivos estén en la carpeta `public`
- Usa `type="module"` en el tag script
- Asegúrate de que las rutas sean correctas

---

## 📚 Recursos Adicionales

- [Documentación de Firestore](https://firebase.google.com/docs/firestore)
- [Guía de consultas en tiempo real](https://firebase.google.com/docs/firestore/query-data/listen)
- [Reglas de seguridad](https://firebase.google.com/docs/firestore/security/get-started)

---

## 💡 Tips

1. **Siempre revisa la consola del navegador** (F12) para ver errores
2. **Lee GUIA-MENSAJERIA.md** para documentación completa
3. **Usa init-test-data.html** para crear usuarios rápidamente
4. **Revisa docente-con-mensajeria.html** como ejemplo funcional

---

## 📞 ¿Necesitas Ayuda?

1. Revisa `GUIA-MENSAJERIA.md` - Guía completa
2. Abre `messaging-integration-example.html` - Ejemplo de código
3. Prueba `docente-con-mensajeria.html` - Ejemplo funcional
4. Revisa la consola del navegador para errores

---

## 🎉 ¡Listo para Empezar!

Tu sistema de mensajería está completo y listo para usar. 

**Primer paso**: Abre `init-test-data.html` para crear usuarios de prueba.

**Segundo paso**: Abre `docente-con-mensajeria.html` para ver el sistema en acción.

**Tercer paso**: Lee `GUIA-MENSAJERIA.md` para más detalles.

¡Buena suerte con tu proyecto Zephia! 🚀

