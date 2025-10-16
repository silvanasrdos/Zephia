// ========================================
// CONTROL DE ACCESO BASADO EN ROLES
// ========================================
// Este módulo define qué puede hacer cada rol en el sistema

/**
 * Definición de permisos por rol
 */
const ROLE_PERMISSIONS = {
    admin: {
        canAccessSchools: true,
        canAccessTeachers: true,
        canAccessUsers: true,
        canAccessDashboard: true,
        canAccessReports: true,
        canAccessSupport: true,
        canAccessMessaging: true,
        canCreateSchools: true,
        canEditSchools: true,
        canDeleteSchools: true,
        canCreateTeachers: true,
        canEditTeachers: true,
        canDeleteTeachers: true,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        allowedPages: ['principal.html', 'docente.html', 'secretaria.html', 'responsable.html']
    },
    
    responsable: {
        canAccessSchools: true,        // Solo SUS escuelas
        canAccessTeachers: true,       // Solo docentes de SUS escuelas
        canAccessUsers: false,
        canAccessDashboard: true,
        canAccessReports: true,
        canAccessSupport: false,
        canAccessMessaging: true,
        canCreateSchools: true,        // Puede agregar escuelas a su cargo
        canEditSchools: true,          // Solo las que tiene asignadas
        canDeleteSchools: false,       // No puede eliminar
        canCreateTeachers: true,       // Para sus escuelas
        canEditTeachers: true,         // Para sus escuelas
        canDeleteTeachers: false,      // No puede eliminar
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        allowedPages: ['responsable.html']
    },
    
    secretaria: {
        canAccessSchools: false,
        canAccessTeachers: false,
        canAccessUsers: false,
        canAccessDashboard: false,
        canAccessReports: true,
        canAccessSupport: false,
        canAccessMessaging: true,
        canCreateSchools: false,
        canEditSchools: false,
        canDeleteSchools: false,
        canCreateTeachers: false,
        canEditTeachers: false,
        canDeleteTeachers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        allowedPages: ['secretaria.html']
    },
    
    docente: {
        canAccessSchools: false,
        canAccessTeachers: false,
        canAccessUsers: false,
        canAccessDashboard: false,
        canAccessReports: false,
        canAccessSupport: false,
        canAccessMessaging: true,
        canCreateSchools: false,
        canEditSchools: false,
        canDeleteSchools: false,
        canCreateTeachers: false,
        canEditTeachers: false,
        canDeleteTeachers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
        allowedPages: ['docente.html']
    }
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {string} userRole - Rol del usuario (admin, responsable, secretaria, docente)
 * @param {string} permission - Permiso a verificar
 * @returns {boolean} - true si tiene el permiso, false si no
 */
export function hasPermission(userRole, permission) {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        console.warn(`Rol no válido: ${userRole}`);
        return false;
    }
    
    return ROLE_PERMISSIONS[userRole][permission] || false;
}

/**
 * Verificar si un usuario puede acceder a una página específica
 * @param {string} userRole - Rol del usuario
 * @param {string} pageName - Nombre de la página (ej: 'docente.html')
 * @returns {boolean} - true si puede acceder, false si no
 */
export function canAccessPage(userRole, pageName) {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        return false;
    }
    
    // Admin puede acceder a todo
    if (userRole === 'admin') {
        return true;
    }
    
    return ROLE_PERMISSIONS[userRole].allowedPages.includes(pageName);
}

/**
 * Obtener la página por defecto según el rol del usuario
 * @param {string} userRole - Rol del usuario
 * @returns {string} - Nombre de la página por defecto
 */
export function getDefaultPageForRole(userRole) {
    const defaultPages = {
        admin: 'principal.html',
        responsable: 'responsable.html',
        secretaria: 'secretaria.html',
        docente: 'docente.html'
    };
    
    return defaultPages[userRole] || 'login.html';
}

/**
 * Verificar acceso a la página actual y redirigir si no tiene permisos
 * @param {Object} user - Objeto del usuario con rol
 */
export function checkPageAccess(user) {
    if (!user || !user.role) {
        console.warn('Usuario sin rol, redirigiendo al login');
        window.location.href = 'login.html';
        return false;
    }
    
    // Obtener nombre de la página actual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Verificar si puede acceder
    if (!canAccessPage(user.role, currentPage)) {
        console.warn(`Usuario con rol ${user.role} no tiene acceso a ${currentPage}`);
        
        // Redirigir a su página por defecto
        const defaultPage = getDefaultPageForRole(user.role);
        
        // Evitar bucle infinito
        if (currentPage !== defaultPage) {
            window.location.href = defaultPage;
        }
        
        return false;
    }
    
    return true;
}

/**
 * Ocultar/mostrar elementos del DOM según permisos
 * @param {Object} user - Objeto del usuario con rol
 */
export function applyAccessControl(user) {
    if (!user || !user.role) {
        console.warn('⚠️ applyAccessControl: Usuario sin rol');
        return;
    }
    
    const role = user.role;
    console.log(`🔐 Aplicando control de acceso para rol: ${role}`);
    
    // Definir qué secciones debe ver cada rol
    const sidebarItems = {
        'schools': hasPermission(role, 'canAccessSchools'),
        'teachers': hasPermission(role, 'canAccessTeachers'),
        'users': hasPermission(role, 'canAccessUsers'),
        'dashboard': hasPermission(role, 'canAccessDashboard'),
        'reports': hasPermission(role, 'canAccessReports'),
        'support': hasPermission(role, 'canAccessSupport'),
        'messaging': hasPermission(role, 'canAccessMessaging')
    };
    
    // Log de permisos
    console.log('📋 Permisos del usuario:', sidebarItems);
    
    // Aplicar visibilidad a los elementos del menú
    let hiddenCount = 0;
    let visibleCount = 0;
    
    Object.keys(sidebarItems).forEach(section => {
        // Buscar elementos con onclick que contengan showSection
        const elements = document.querySelectorAll(`[onclick*="showSection('${section}')"]`);
        
        if (elements.length > 0) {
            console.log(`  → Sección "${section}": ${elements.length} elemento(s) encontrado(s)`);
        }
        
        elements.forEach(el => {
            const shouldShow = sidebarItems[section];
            
            if (shouldShow) {
                el.style.display = '';
                el.style.removeProperty('display');
                visibleCount++;
            } else {
                el.style.display = 'none';
                hiddenCount++;
            }
        });
    });
    
    console.log(`✅ Control aplicado: ${visibleCount} visible(s), ${hiddenCount} oculto(s)`);
    
    // Ocultar botones de acciones según permisos
    applyButtonPermissions(user);
    
    // Si el usuario no debería estar en esta página, redirigir
    const currentPage = window.location.pathname.split('/').pop();
    if (!canAccessPage(role, currentPage)) {
        console.warn(`⚠️ Usuario ${role} no debería estar en ${currentPage}`);
    }
}

/**
 * Aplicar permisos a botones de acción
 * @param {Object} user - Objeto del usuario con rol
 */
function applyButtonPermissions(user) {
    const role = user.role;
    
    // Botones de agregar
    if (!hasPermission(role, 'canCreateSchools')) {
        hideButtons('[onclick*="school-modal"]', '[onclick*="addSchool"]');
    }
    
    if (!hasPermission(role, 'canCreateTeachers')) {
        hideButtons('[onclick*="teacher-modal"]', '[onclick*="addTeacher"]');
    }
    
    if (!hasPermission(role, 'canCreateUsers')) {
        hideButtons('[onclick*="user-modal"]', '[onclick*="addUser"]');
    }
    
    // Botones de editar (se verificarán en tiempo real)
    if (!hasPermission(role, 'canEditSchools')) {
        hideButtons('.btn-edit-school', '[title*="Editar"][onclick*="school"]');
    }
    
    if (!hasPermission(role, 'canEditTeachers')) {
        hideButtons('.btn-edit-teacher', '[title*="Editar"][onclick*="teacher"]');
    }
    
    // Botones de eliminar
    if (!hasPermission(role, 'canDeleteSchools')) {
        hideButtons('.btn-delete-school', '[title*="Eliminar"][onclick*="school"]');
    }
    
    if (!hasPermission(role, 'canDeleteTeachers')) {
        hideButtons('.btn-delete-teacher', '[title*="Eliminar"][onclick*="teacher"]');
    }
}

/**
 * Ocultar botones con selectores específicos
 * @param {...string} selectors - Selectores CSS
 */
function hideButtons(...selectors) {
    selectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
            btn.style.display = 'none';
        });
    });
}

/**
 * Mostrar mensaje de acceso denegado
 * @param {string} action - Acción que se intentó realizar
 */
export function showAccessDenied(action = 'realizar esta acción') {
    alert(`❌ Acceso denegado: No tienes permisos para ${action}`);
}

/**
 * Verificar permiso antes de ejecutar una acción
 * @param {Object} user - Objeto del usuario
 * @param {string} permission - Permiso a verificar
 * @param {Function} callback - Función a ejecutar si tiene permiso
 * @param {string} actionName - Nombre de la acción (para mensaje de error)
 */
export function withPermission(user, permission, callback, actionName) {
    if (hasPermission(user.role, permission)) {
        return callback();
    } else {
        showAccessDenied(actionName);
        return false;
    }
}

/**
 * Obtener permisos completos de un rol
 * @param {string} role - Rol del usuario
 * @returns {Object} - Objeto con todos los permisos
 */
export function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || {};
}

// Hacer disponibles las funciones globalmente para uso en scripts inline
if (typeof window !== 'undefined') {
    window.accessControl = {
        hasPermission,
        canAccessPage,
        getDefaultPageForRole,
        checkPageAccess,
        applyAccessControl,
        showAccessDenied,
        withPermission,
        getRolePermissions
    };
}

export default {
    hasPermission,
    canAccessPage,
    getDefaultPageForRole,
    checkPageAccess,
    applyAccessControl,
    showAccessDenied,
    withPermission,
    getRolePermissions,
    ROLE_PERMISSIONS
};

