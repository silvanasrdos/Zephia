# Sistema de Validación de Formularios - Zephia

## Descripción General

Se ha implementado un sistema completo de validación de campos para los CRUDs (Crear, Leer, Actualizar, Eliminar) de **Usuarios**, **Escuelas** y **Docentes** en el sistema Zephia.

## Archivos Implementados

### 1. `validaciones.js`
Archivo principal que contiene todas las funciones de validación reutilizables.

### 2. Estilos CSS
Se agregaron estilos de validación en los siguientes archivos:
- `styles-principal.css`
- `styles-r.css`

## Validaciones Implementadas

### CRUD de Usuarios

#### Campos Validados:
1. **Usuario**
   - ✅ Requerido
   - ✅ Mínimo 3 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Solo alfanumérico (letras, números y guiones bajos)
   - ✅ **Sin caracteres especiales**
   - ✅ Validación en tiempo real

2. **Nombre Completo**
   - ✅ Requerido
   - ✅ Mínimo 3 caracteres
   - ✅ **Máximo 100 caracteres**
   - ✅ Solo letras y espacios
   - ✅ **Sin caracteres especiales**
   - ✅ Validación en tiempo real

3. **Email**
   - ✅ Requerido
   - ✅ **Máximo 100 caracteres**
   - ✅ Formato de email válido (usuario@dominio.com)
   - ✅ Validación en tiempo real

4. **Tipo de Usuario**
   - ✅ Requerido
   - ✅ Debe seleccionar una opción válida

5. **Contraseña**
   - ✅ Requerida para nuevos usuarios
   - ✅ Opcional para edición
   - ✅ Mínimo 6 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Indicador visual de fortaleza
   - ✅ Validación en tiempo real

### CRUD de Escuelas

#### Campos Validados:
1. **Nombre de la Institución**
   - ✅ Requerido
   - ✅ Mínimo 3 caracteres
   - ✅ **Máximo 200 caracteres**
   - ✅ **Sin caracteres especiales peligrosos**
   - ✅ Validación en tiempo real

2. **Dirección**
   - ✅ **Calle y Número**: Requerido, **máximo 150 caracteres**
   - ✅ **Ciudad**: Requerido, **máximo 150 caracteres**
   - ✅ **Provincia**: Requerido, **máximo 150 caracteres**
   - ✅ **Sin caracteres especiales peligrosos**
   - ✅ Validación en tiempo real para cada campo

3. **Teléfono de Contacto**
   - ✅ Requerido
   - ✅ **Máximo 30 caracteres**
   - ✅ Formato argentino válido (+54 11 1234-5678)
   - ✅ Acepta múltiples formatos
   - ✅ Validación en tiempo real

4. **Correo Institucional**
   - ✅ Requerido
   - ✅ **Máximo 100 caracteres**
   - ✅ Formato de email válido
   - ✅ Validación en tiempo real

5. **CUE (Código Único de Establecimiento)**
   - ✅ Opcional
   - ✅ Si se ingresa, debe ser numérico de 9 dígitos
   - ✅ **Máximo 9 caracteres**
   - ✅ Validación en tiempo real

6. **Nivel Educativo**
   - ✅ Requerido
   - ✅ Debe seleccionar al menos un nivel
   - ✅ Validación al cambiar selección

7. **Turnos**
   - ✅ Requerido
   - ✅ Debe seleccionar al menos un turno
   - ✅ Validación al cambiar selección

8. **Administrador Responsable**
   - ✅ Requerido (si el campo existe)
   - ✅ Validación al cambiar selección

### CRUD de Docentes

#### Campos Validados:
1. **Usuario/ID Docente**
   - ✅ Requerido
   - ✅ Mínimo 3 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Solo alfanumérico (letras, números y guiones bajos)
   - ✅ **Sin caracteres especiales**
   - ✅ Validación en tiempo real

2. **Nombre**
   - ✅ Requerido
   - ✅ Mínimo 2 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Solo letras y espacios
   - ✅ **Sin caracteres especiales**
   - ✅ Validación en tiempo real

3. **Apellido**
   - ✅ Requerido
   - ✅ Mínimo 2 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Solo letras y espacios
   - ✅ **Sin caracteres especiales**
   - ✅ Validación en tiempo real

4. **Correo Electrónico**
   - ✅ Requerido
   - ✅ **Máximo 100 caracteres**
   - ✅ Formato de email válido
   - ✅ Validación en tiempo real

5. **Contraseña**
   - ✅ Requerida para nuevos docentes
   - ✅ Opcional para edición
   - ✅ Mínimo 6 caracteres
   - ✅ **Máximo 50 caracteres**
   - ✅ Validación en tiempo real

6. **DNI**
   - ✅ Requerido
   - ✅ Entre 7 y 10 dígitos numéricos
   - ✅ **Máximo 10 caracteres**
   - ✅ Validación en tiempo real

7. **Rol**
   - ✅ Requerido
   - ✅ Debe seleccionar una opción válida
   - ✅ Validación al cambiar selección

8. **Teléfono de Contacto**
   - ✅ Requerido
   - ✅ **Máximo 30 caracteres**
   - ✅ Formato argentino válido
   - ✅ Validación en tiempo real

## Límites de Caracteres y Restricciones

### Tabla de Límites por Tipo de Campo

| Tipo de Campo | Mínimo | Máximo | Caracteres Permitidos |
|---------------|--------|--------|----------------------|
| Usuario | 3 | 50 | Alfanumérico (a-z, A-Z, 0-9, _) |
| Nombre/Apellido | 2 | 50 | Solo letras (con acentos) |
| Nombre Completo | 3 | 100 | Solo letras (con acentos) |
| Nombre Institución | 3 | 200 | Alfanumérico + @ . , - _ |
| Email | - | 100 | Formato email estándar |
| Contraseña | 6 | 50 | Cualquier carácter |
| DNI | 7 | 10 | Solo números |
| CUE | 9 | 9 | Solo números |
| Teléfono | - | 30 | Números, espacios, guiones, + |
| Dirección (calle/ciudad/provincia) | - | 150 | Alfanumérico + @ . , - _ |

### Caracteres Especiales Bloqueados

Para proteger el sistema contra inyección de código y otros ataques, los siguientes caracteres especiales están **bloqueados** en la mayoría de los campos de texto:

 **Caracteres no permitidos:**
- `<` `>` (menor que, mayor que)
- `{` `}` (llaves)
- `[` `]` (corchetes)
- `|` (barra vertical)
- `\` (barra invertida)
- `^` (circunflejo)
- `` ` `` (acento grave)
- `~` (virgulilla)
- `;` (punto y coma)
- `'` `"` (comillas simples y dobles)
- `=` (igual)
- `&` `%` `$` `#` `!` (símbolos especiales)

✅ **Caracteres permitidos en campos de texto generales:**
- Letras con acentos (á, é, í, ó, ú, ñ)
- Números (0-9)
- Espacios
- Punto (.)
- Coma (,)
- Guion (-)
- Guion bajo (_)
- Arroba (@) - solo en campos específicos

✅ **Campos con validación especial:**
- **Email**: Permite formato estándar de email
- **Contraseña**: Permite cualquier carácter (para mayor seguridad)
- **Teléfono**: Números, espacios, guiones, paréntesis y signo +
- **DNI/CUE**: Solo números

## Características del Sistema de Validación

### Validación en Tiempo Real
- Los campos se validan mientras el usuario escribe
- Feedback visual inmediato (verde = válido, rojo = error)
- Mensajes de error descriptivos
- **Bloqueo automático** de caracteres especiales no permitidos

### Feedback Visual
- **Borde verde**: Campo válido
- **Borde rojo**: Campo con error
- **Fondo rosa claro**: Campo con error
- **Mensajes animados**: Aparecen suavemente al detectar errores

### Mensajes de Error Claros
Todos los mensajes están en español e indican exactamente qué debe corregir el usuario:
- "El usuario es requerido"
- "El email no tiene un formato válido"
- "El DNI debe tener entre 7 y 10 dígitos"
- "Debe seleccionar al menos un nivel educativo"

### Validación al Enviar
Antes de enviar cualquier formulario:
1. Se validan todos los campos
2. Si hay errores, se muestra una alerta
3. Los campos con errores quedan marcados visualmente
4. El formulario NO se envía hasta que todos los errores sean corregidos

### Limpieza Automática
- Al cerrar un modal, se limpian todos los errores
- Al resetear un formulario, se eliminan las marcas de validación
- Al empezar a escribir en un campo con error, se limpia el error

## Archivos Modificados

### HTML
- ✅ `public/principal.html` - Panel de administrador
- ✅ `public/responsable.html` - Panel de responsable a cargo

### CSS
- ✅ `public/styles-principal.css`
- ✅ `public/styles-r.css`

### JavaScript
- ✅ `public/validaciones.js` (nuevo archivo)

## Cómo Usar

### Para Desarrolladores

#### 1. Inicializar validaciones en tiempo real:
```javascript
// En el evento DOMContentLoaded
inicializarValidacionUsuarios();
inicializarValidacionEscuelas();
inicializarValidacionDocentes();
```

#### 2. Validar antes de enviar un formulario:
```javascript
// En el evento submit
if (!validarFormularioUsuario()) {
    alert('Por favor, corrija los errores en el formulario');
    return;
}
// Continuar con el envío...
```

#### 3. Limpiar errores al resetear:
```javascript
function resetForm() {
    document.getElementById('mi-form').reset();
    limpiarErroresFormulario('mi-form');
}
```

## Funciones Disponibles

### Validaciones Generales
- `validarRequerido(valor, nombreCampo)`
- `validarEmail(email)`
- `validarTelefono(telefono)`
- `validarDNI(dni)`
- `validarCUE(cue)`
- `validarContraseña(contraseña)`
- `validarAlfanumerico(valor, nombreCampo)`
- `validarSoloLetras(valor, nombreCampo)`

### Validaciones de Formularios Completos
- `validarFormularioUsuario()`
- `validarFormularioEscuela()`
- `validarFormularioDocente()`

### Utilidades
- `mostrarError(inputElement, mensaje)`
- `mostrarExito(inputElement)`
- `limpiarError(inputElement)`
- `limpiarErroresFormulario(formularioId)`

## Compatibilidad

✅ Funciona en todos los navegadores modernos:
- Chrome
- Firefox
- Safari
- Edge

## Beneficios

1. **Mejor Experiencia de Usuario**
   - Feedback instantáneo
   - Mensajes claros y en español
   - Previene errores antes de enviar

2. **Menos Errores en la Base de Datos**
   - Validación estricta de formatos
   - Datos consistentes y limpios

3. **Código Reutilizable**
   - Un solo archivo de validaciones
   - Funciones compartidas entre formularios

4. **Mantenible**
   - Fácil de agregar nuevas validaciones
   - Código bien documentado

## Ejemplos de Uso

### Validar un Campo Individual
```javascript
const emailInput = document.getElementById('user-email');
if (validarCampoEmail(emailInput)) {
    console.log('Email válido');
} else {
    console.log('Email inválido');
}
```

### Agregar una Nueva Validación
```javascript
function validarCodigoPostal(inputElement) {
    const valor = inputElement.value.trim();
    
    if (!/^\d{4}$/.test(valor)) {
        mostrarError(inputElement, 'El código postal debe tener 4 dígitos');
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}
```

## Notas Importantes

- Las validaciones son del lado del cliente. Es importante tener validaciones también en el servidor/Firebase.
- Los mensajes de error son en español, asegúrate de mantener esta convención.
- Al agregar nuevos campos, recuerda inicializar sus validaciones en tiempo real.

## Soporte

Para cualquier duda o problema con las validaciones, revisar el código en `public/validaciones.js` que está completamente documentado.

## Historial de Actualizaciones

### Versión 2.0 - Límites de Caracteres y Restricción de Caracteres Especiales
**Fecha**: Octubre 2025

**Cambios Implementados:**
1. ✅ **Límites de caracteres** agregados a TODOS los campos
2. ✅ **Bloqueo de caracteres especiales** peligrosos
3. ✅ Atributo `maxlength` en todos los inputs HTML
4. ✅ Atributo `pattern` para validación de formato
5. ✅ Mensajes de ayuda (`<small>`) actualizados con información de límites
6. ✅ Función `validarSinCaracteresEspeciales()` agregada
7. ✅ Validación de longitud máxima en todas las funciones

**Archivos Modificados:**
- ✅ `public/validaciones.js` - Funciones de validación actualizadas
- ✅ `public/principal.html` - Atributos maxlength y pattern agregados
- ✅ `public/responsable.html` - Atributos maxlength y pattern agregados
- ✅ `public/VALIDACIONES.md` - Documentación actualizada

### Versión 1.0 - Sistema de Validación Inicial
**Fecha**: Octubre 2025

**Características Iniciales:**
- Sistema completo de validación de formularios
- Validación en tiempo real
- Feedback visual con colores
- Mensajes de error descriptivos
- Validaciones para usuarios, escuelas y docentes

---

**Última actualización**: Octubre 2025
**Versión**: 2.0
**Autor**: Sistema Zephia

## Estado del Sistema

🟢 **Sistema completamente funcional**
- Sin errores de linting
- Validaciones implementadas en todos los CRUDs
- Límites de caracteres configurados
- Caracteres especiales bloqueados
- Documentación completa y actualizada

---

💡 **A implementar:**
1. Las validaciones del lado del cliente son la primera línea de defensa
2. **IMPORTANTE**: Implementar también validaciones del lado del servidor/Firebase
3. Considerar sanitización adicional antes de guardar en la base de datos
4. Revisar logs regularmente para detectar intentos de inyección
5. Mantener las expresiones regulares actualizadas según necesidades del negocio
