// ==================== SISTEMA DE VALIDACIÓN DE FORMULARIOS ====================
// Autor: Sistema Zephia
// Descripción: Funciones de validación para formularios de usuarios, escuelas y docentes

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Muestra un mensaje de error en un campo de formulario
 */
function mostrarError(inputElement, mensaje) {
    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;
    
    // Remover clases y mensajes anteriores
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    // Eliminar mensaje de error anterior si existe
    const errorAnterior = formGroup.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
    
    // Crear y agregar nuevo mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
    
    // Insertar después del input o select
    const targetElement = inputElement.tagName === 'SELECT' ? inputElement : 
                         inputElement.nextElementSibling?.classList.contains('password-strength') ? 
                         inputElement.nextElementSibling : inputElement;
    targetElement.parentNode.insertBefore(errorDiv, targetElement.nextSibling);
}

/**
 * Muestra que el campo es válido
 */
function mostrarExito(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    // Eliminar mensaje de error si existe
    const errorAnterior = formGroup.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
}

/**
 * Limpia los mensajes de error de un campo
 */
function limpiarError(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error', 'success');
    const errorAnterior = formGroup.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
}

/**
 * Limpia todos los errores de un formulario
 */
function limpiarErroresFormulario(formularioId) {
    const formulario = document.getElementById(formularioId);
    if (!formulario) return;
    
    const formGroups = formulario.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
}

// ==================== VALIDACIONES BÁSICAS ====================

/**
 * Valida que un campo no esté vacío
 */
function validarRequerido(valor, nombreCampo = 'Este campo') {
    if (!valor || valor.trim() === '') {
        return { valido: false, mensaje: `${nombreCampo} es requerido` };
    }
    return { valido: true };
}

/**
 * Valida longitud mínima
 */
function validarLongitudMinima(valor, minimo, nombreCampo) {
    if (valor.length < minimo) {
        return { valido: false, mensaje: `${nombreCampo} debe tener al menos ${minimo} caracteres` };
    }
    return { valido: true };
}

/**
 * Valida longitud máxima
 */
function validarLongitudMaxima(valor, maximo, nombreCampo) {
    if (valor.length > maximo) {
        return { valido: false, mensaje: `${nombreCampo} no puede exceder ${maximo} caracteres` };
    }
    return { valido: true };
}

/**
 * Valida formato de email
 */
function validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
        return { valido: false, mensaje: 'El formato del email no es válido' };
    }
    return { valido: true };
}

/**
 * Valida formato de teléfono argentino
 */
function validarTelefono(telefono) {
    // Acepta formatos: +54 11 1234-5678, +54 11 12345678, 11 1234-5678, etc.
    const regex = /^(\+54[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}$/;
    if (!regex.test(telefono.trim())) {
        return { valido: false, mensaje: 'El formato del teléfono no es válido' };
    }
    return { valido: true };
}

/**
 * Valida que solo contenga letras y espacios (sin caracteres especiales)
 */
function validarSoloLetras(valor, nombreCampo) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regex.test(valor)) {
        return { valido: false, mensaje: `${nombreCampo} solo puede contener letras (sin caracteres especiales)` };
    }
    return { valido: true };
}

/**
 * Valida que no contenga caracteres especiales peligrosos
 */
function validarSinCaracteresEspeciales(valor, nombreCampo) {
    // Permite letras, números, espacios, puntos, comas, guiones, paréntesis, comillas simples, y acentos
    // Excluye solo caracteres realmente peligrosos para SQL/XSS: < > ; & = | ` \
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-_@#°ºª()'"\/+:]+$/;
    if (!regex.test(valor)) {
        return { valido: false, mensaje: `${nombreCampo} contiene caracteres no permitidos (< > ; & = | \` \\)` };
    }
    return { valido: true };
}

/**
 * Valida que sea alfanumérico (letras, números y guiones bajos)
 */
function validarAlfanumerico(valor, nombreCampo) {
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(valor)) {
        return { valido: false, mensaje: `${nombreCampo} solo puede contener letras, números y guiones bajos` };
    }
    return { valido: true };
}

/**
 * Valida DNI argentino (7-8 dígitos)
 */
function validarDNI(dni) {
    const regex = /^\d{7,10}$/;
    if (!regex.test(dni)) {
        return { valido: false, mensaje: 'El DNI debe tener entre 7 y 10 dígitos' };
    }
    return { valido: true };
}

/**
 * Valida CUE (Código Único de Establecimiento - numérico)
 */
function validarCUE(cue) {
    if (!cue || cue.trim() === '') {
        return { valido: true }; // CUE es opcional
    }
    const regex = /^\d{9}$/;
    if (!regex.test(cue)) {
        return { valido: false, mensaje: 'El CUE debe tener 9 dígitos' };
    }
    return { valido: true };
}

/**
 * Valida fortaleza de contraseña
 */
function validarContraseña(contraseña) {
    if (contraseña.length < 6) {
        return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valido: true };
}

/**
 * Calcula la fortaleza de una contraseña
 */
function calcularFortalezaContraseña(contraseña) {
    let fortaleza = 0;
    
    if (contraseña.length >= 6) fortaleza += 1;
    if (contraseña.length >= 10) fortaleza += 1;
    if (/[a-z]/.test(contraseña)) fortaleza += 1;
    if (/[A-Z]/.test(contraseña)) fortaleza += 1;
    if (/[0-9]/.test(contraseña)) fortaleza += 1;
    if (/[^a-zA-Z0-9]/.test(contraseña)) fortaleza += 1;
    
    if (fortaleza <= 2) return { nivel: 'débil', color: '#dc3545', porcentaje: 33 };
    if (fortaleza <= 4) return { nivel: 'media', color: '#ffc107', porcentaje: 66 };
    return { nivel: 'fuerte', color: '#28a745', porcentaje: 100 };
}

// ==================== VALIDACIÓN DE USUARIOS ====================

/**
 * Valida el campo de usuario
 */
function validarUsuario(inputElement) {
    const valor = inputElement.value.trim();
    
    // Verificar requerido
    let resultado = validarRequerido(valor, 'El usuario');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    // Verificar longitud mínima
    resultado = validarLongitudMinima(valor, 3, 'El usuario');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    // Verificar longitud máxima
    resultado = validarLongitudMaxima(valor, 50, 'El usuario');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    // Verificar que sea alfanumérico
    resultado = validarAlfanumerico(valor, 'El usuario');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el campo de nombre completo
 */
function validarNombreCompleto(inputElement) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, 'El nombre completo');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMinima(valor, 3, 'El nombre completo');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 100, 'El nombre completo');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarSoloLetras(valor, 'El nombre completo');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el campo de email
 */
function validarCampoEmail(inputElement) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, 'El email');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 100, 'El email');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarEmail(valor);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el campo de contraseña
 */
function validarCampoContraseña(inputElement, esRequerido = true) {
    const valor = inputElement.value;
    
    // Si no es requerido y está vacío, es válido (para edición)
    if (!esRequerido && valor === '') {
        limpiarError(inputElement);
        return true;
    }
    
    let resultado = validarContraseña(valor);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 50, 'La contraseña');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    // Actualizar indicador de fortaleza si existe
    const fortaleza = calcularFortalezaContraseña(valor);
    const barraFortaleza = inputElement.parentElement.querySelector('.password-strength-bar');
    if (barraFortaleza) {
        barraFortaleza.style.width = fortaleza.porcentaje + '%';
        barraFortaleza.style.backgroundColor = fortaleza.color;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el formulario completo de usuario
 */
function validarFormularioUsuario() {
    let esValido = true;
    
    // Usuario
    const usuario = document.getElementById('username');
    if (usuario && !validarUsuario(usuario)) esValido = false;
    
    // Nombre completo
    const nombreCompleto = document.getElementById('user-fullname');
    if (nombreCompleto && !validarNombreCompleto(nombreCompleto)) esValido = false;
    
    // Email
    const email = document.getElementById('user-email');
    if (email && !validarCampoEmail(email)) esValido = false;
    
    // Tipo de usuario
    const tipo = document.getElementById('user-type');
    if (tipo && !tipo.value) {
        mostrarError(tipo, 'Debe seleccionar un tipo de usuario');
        esValido = false;
    } else if (tipo) {
        mostrarExito(tipo);
    }
    
    // Contraseña (solo requerida si es un nuevo usuario)
    const contraseña = document.getElementById('user-password');
    const esNuevoUsuario = !window.editingUserId;
    if (contraseña && !validarCampoContraseña(contraseña, esNuevoUsuario)) esValido = false;
    
    return esValido;
}

// ==================== VALIDACIÓN DE ESCUELAS ====================

/**
 * Valida el campo de nombre de institución
 */
function validarNombreInstitucion(inputElement) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, 'El nombre de la institución');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMinima(valor, 3, 'El nombre de la institución');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 200, 'El nombre de la institución');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarSinCaracteresEspeciales(valor, 'El nombre de la institución');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida campos de dirección
 */
function validarCampoDireccion(inputElement, nombreCampo) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, nombreCampo);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 150, nombreCampo);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarSinCaracteresEspeciales(valor, nombreCampo);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el campo de teléfono
 */
function validarCampoTelefono(inputElement) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, 'El teléfono');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 30, 'El teléfono');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarTelefono(valor);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida campo CUE
 */
function validarCampoCUE(inputElement) {
    const valor = inputElement.value.trim();
    
    const resultado = validarCUE(valor);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    if (valor) {
        mostrarExito(inputElement);
    } else {
        limpiarError(inputElement);
    }
    return true;
}

/**
 * Valida select múltiple (nivel educativo, turnos)
 */
function validarSelectMultiple(selectElement, nombreCampo) {
    const opciones = Array.from(selectElement.selectedOptions);
    
    if (opciones.length === 0) {
        mostrarError(selectElement, `Debe seleccionar al menos un ${nombreCampo}`);
        return false;
    }
    
    mostrarExito(selectElement);
    return true;
}

/**
 * Valida select simple
 */
function validarSelect(selectElement, nombreCampo) {
    const valor = selectElement.value;
    
    if (!valor || valor === '') {
        mostrarError(selectElement, `Debe seleccionar ${nombreCampo}`);
        return false;
    }
    
    mostrarExito(selectElement);
    return true;
}

/**
 * Valida el formulario completo de escuela
 */
function validarFormularioEscuela() {
    let esValido = true;
    
    // Nombre de institución
    const nombre = document.getElementById('school-nombre');
    if (nombre && !validarNombreInstitucion(nombre)) esValido = false;
    
    // Dirección - Calle
    const calle = document.getElementById('school-calle');
    if (calle && !validarCampoDireccion(calle, 'La calle')) esValido = false;
    
    // Dirección - Ciudad
    const ciudad = document.getElementById('school-ciudad');
    if (ciudad && !validarCampoDireccion(ciudad, 'La ciudad')) esValido = false;
    
    // Dirección - Provincia
    const provincia = document.getElementById('school-provincia');
    if (provincia && !validarCampoDireccion(provincia, 'La provincia')) esValido = false;
    
    // Teléfono
    const telefono = document.getElementById('school-telefono');
    if (telefono && !validarCampoTelefono(telefono)) esValido = false;
    
    // Correo
    const correo = document.getElementById('school-correo');
    if (correo && !validarCampoEmail(correo)) esValido = false;
    
    // CUE (opcional)
    const cue = document.getElementById('school-cue');
    if (cue && !validarCampoCUE(cue)) esValido = false;
    
    // Nivel educativo
    const nivel = document.getElementById('school-nivel');
    if (nivel && !validarSelectMultiple(nivel, 'nivel educativo')) esValido = false;
    
    // Turnos
    const turnos = document.getElementById('school-turnos');
    if (turnos && !validarSelectMultiple(turnos, 'turno')) esValido = false;
    
    // Administrador responsable (si existe el campo)
    const admin = document.getElementById('school-admin');
    if (admin && !validarSelect(admin, 'un administrador responsable')) esValido = false;
    
    return esValido;
}

// ==================== VALIDACIÓN DE DOCENTES ====================

/**
 * Valida el campo de nombre o apellido
 */
function validarNombreApellido(inputElement, tipoCampo) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, `El ${tipoCampo}`);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMinima(valor, 2, `El ${tipoCampo}`);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarLongitudMaxima(valor, 50, `El ${tipoCampo}`);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarSoloLetras(valor, `El ${tipoCampo}`);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida campo DNI
 */
function validarCampoDNI(inputElement) {
    const valor = inputElement.value.trim();
    
    let resultado = validarRequerido(valor, 'El DNI');
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    resultado = validarDNI(valor);
    if (!resultado.valido) {
        mostrarError(inputElement, resultado.mensaje);
        return false;
    }
    
    mostrarExito(inputElement);
    return true;
}

/**
 * Valida el formulario completo de docente
 */
function validarFormularioDocente() {
    let esValido = true;
    
    // Usuario
    const usuario = document.getElementById('teacher-usuario');
    if (usuario && !validarUsuario(usuario)) esValido = false;
    
    // Nombre
    const nombre = document.getElementById('teacher-nombre');
    if (nombre && !validarNombreApellido(nombre, 'nombre')) esValido = false;
    
    // Apellido
    const apellido = document.getElementById('teacher-apellido');
    if (apellido && !validarNombreApellido(apellido, 'apellido')) esValido = false;
    
    // Email
    const email = document.getElementById('teacher-correo');
    if (email && !validarCampoEmail(email)) esValido = false;
    
    // Contraseña
    const contraseña = document.getElementById('teacher-contraseña');
    const esNuevoDocente = !window.editingTeacherId;
    if (contraseña && !validarCampoContraseña(contraseña, esNuevoDocente)) esValido = false;
    
    // DNI
    const dni = document.getElementById('teacher-dni');
    if (dni && !validarCampoDNI(dni)) esValido = false;
    
    // Rol
    const rol = document.getElementById('teacher-rol');
    if (rol && !validarSelect(rol, 'un rol')) esValido = false;
    
    // Teléfono
    const telefono = document.getElementById('teacher-telefono');
    if (telefono && !validarCampoTelefono(telefono)) esValido = false;
    
    return esValido;
}

// ==================== CONFIGURACIÓN DE VALIDACIONES EN TIEMPO REAL ====================

/**
 * Inicializa las validaciones en tiempo real para el formulario de usuarios
 */
function inicializarValidacionUsuarios() {
    const usuario = document.getElementById('username');
    if (usuario) {
        usuario.addEventListener('blur', () => validarUsuario(usuario));
        usuario.addEventListener('input', () => {
            if (usuario.value.trim()) limpiarError(usuario);
        });
    }
    
    const nombreCompleto = document.getElementById('user-fullname');
    if (nombreCompleto) {
        nombreCompleto.addEventListener('blur', () => validarNombreCompleto(nombreCompleto));
        nombreCompleto.addEventListener('input', () => {
            if (nombreCompleto.value.trim()) limpiarError(nombreCompleto);
        });
    }
    
    const email = document.getElementById('user-email');
    if (email) {
        email.addEventListener('blur', () => validarCampoEmail(email));
        email.addEventListener('input', () => {
            if (email.value.trim()) limpiarError(email);
        });
    }
    
    const contraseña = document.getElementById('user-password');
    if (contraseña) {
        contraseña.addEventListener('input', () => {
            const esNuevoUsuario = !window.editingUserId;
            if (contraseña.value || esNuevoUsuario) {
                validarCampoContraseña(contraseña, esNuevoUsuario);
            } else {
                limpiarError(contraseña);
            }
        });
    }
    
    const tipo = document.getElementById('user-type');
    if (tipo) {
        tipo.addEventListener('change', () => validarSelect(tipo, 'un tipo de usuario'));
    }
}

/**
 * Inicializa las validaciones en tiempo real para el formulario de escuelas
 */
function inicializarValidacionEscuelas() {
    const nombre = document.getElementById('school-nombre');
    if (nombre) {
        nombre.addEventListener('blur', () => validarNombreInstitucion(nombre));
        nombre.addEventListener('input', () => {
            if (nombre.value.trim()) limpiarError(nombre);
        });
    }
    
    const calle = document.getElementById('school-calle');
    if (calle) {
        calle.addEventListener('blur', () => validarCampoDireccion(calle, 'La calle'));
    }
    
    const ciudad = document.getElementById('school-ciudad');
    if (ciudad) {
        ciudad.addEventListener('blur', () => validarCampoDireccion(ciudad, 'La ciudad'));
    }
    
    const provincia = document.getElementById('school-provincia');
    if (provincia) {
        provincia.addEventListener('blur', () => validarCampoDireccion(provincia, 'La provincia'));
    }
    
    const telefono = document.getElementById('school-telefono');
    if (telefono) {
        telefono.addEventListener('blur', () => validarCampoTelefono(telefono));
    }
    
    const correo = document.getElementById('school-correo');
    if (correo) {
        correo.addEventListener('blur', () => validarCampoEmail(correo));
    }
    
    const cue = document.getElementById('school-cue');
    if (cue) {
        cue.addEventListener('blur', () => validarCampoCUE(cue));
    }
    
    const nivel = document.getElementById('school-nivel');
    if (nivel) {
        nivel.addEventListener('change', () => validarSelectMultiple(nivel, 'nivel educativo'));
    }
    
    const turnos = document.getElementById('school-turnos');
    if (turnos) {
        turnos.addEventListener('change', () => validarSelectMultiple(turnos, 'turno'));
    }
    
    const admin = document.getElementById('school-admin');
    if (admin) {
        admin.addEventListener('change', () => validarSelect(admin, 'un administrador responsable'));
    }
}

/**
 * Inicializa las validaciones en tiempo real para el formulario de docentes
 */
function inicializarValidacionDocentes() {
    const usuario = document.getElementById('teacher-usuario');
    if (usuario) {
        usuario.addEventListener('blur', () => validarUsuario(usuario));
        usuario.addEventListener('input', () => {
            if (usuario.value.trim()) limpiarError(usuario);
        });
    }
    
    const nombre = document.getElementById('teacher-nombre');
    if (nombre) {
        nombre.addEventListener('blur', () => validarNombreApellido(nombre, 'nombre'));
    }
    
    const apellido = document.getElementById('teacher-apellido');
    if (apellido) {
        apellido.addEventListener('blur', () => validarNombreApellido(apellido, 'apellido'));
    }
    
    const email = document.getElementById('teacher-correo');
    if (email) {
        email.addEventListener('blur', () => validarCampoEmail(email));
    }
    
    const contraseña = document.getElementById('teacher-contraseña');
    if (contraseña) {
        contraseña.addEventListener('input', () => {
            const esNuevoDocente = !window.editingTeacherId;
            if (contraseña.value || esNuevoDocente) {
                validarCampoContraseña(contraseña, esNuevoDocente);
            } else {
                limpiarError(contraseña);
            }
        });
    }
    
    const dni = document.getElementById('teacher-dni');
    if (dni) {
        dni.addEventListener('blur', () => validarCampoDNI(dni));
    }
    
    const rol = document.getElementById('teacher-rol');
    if (rol) {
        rol.addEventListener('change', () => validarSelect(rol, 'un rol'));
    }
    
    const telefono = document.getElementById('teacher-telefono');
    if (telefono) {
        telefono.addEventListener('blur', () => validarCampoTelefono(telefono));
    }
}

// ==================== EXPORTAR FUNCIONES ====================

// Si está en un entorno que soporta módulos, exportar las funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Funciones auxiliares
        mostrarError,
        mostrarExito,
        limpiarError,
        limpiarErroresFormulario,
        
        // Validaciones básicas
        validarRequerido,
        validarEmail,
        validarTelefono,
        validarDNI,
        validarCUE,
        validarContraseña,
        
        // Validaciones de formularios
        validarFormularioUsuario,
        validarFormularioEscuela,
        validarFormularioDocente,
        
        // Inicialización
        inicializarValidacionUsuarios,
        inicializarValidacionEscuelas,
        inicializarValidacionDocentes
    };
}

console.log('✅ Sistema de validación de formularios cargado correctamente');
