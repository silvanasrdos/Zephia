# 📝 Guía de Git para el Proyecto Zephia

## 🚀 Configuración Inicial

### 1. Configurar Firebase (IMPORTANTE)

**ANTES de hacer tu primer commit:**

1. **Copia el archivo de ejemplo:**
   ```bash
   cp public/firebase-config.example.js public/firebase-config.js
   ```

2. **Edita `public/firebase-config.js`** con tus credenciales de Firebase Console

3. **Verifica que esté en .gitignore:**
   ```bash
   git check-ignore public/firebase-config.js
   # Debe devolver: public/firebase-config.js
   ```

---

## ✅ Archivos que SÍ van a Git

### **Código Fuente:**
- ✅ `public/*.html` (todas las páginas)
- ✅ `public/*.js` (EXCEPTO `firebase-config.js`)
- ✅ `public/*.css` (todos los estilos)
- ✅ `public/img/*` (imágenes y recursos)

### **Configuración (sin secretos):**
- ✅ `firestore.rules` (reglas de seguridad)
- ✅ `firestore.indexes.json` (índices)
- ✅ `firebase.json` (configuración de proyecto)
- ✅ `manifest.json` (PWA manifest)
- ✅ `package.json` y `package-lock.json`

### **Documentación:**
- ✅ `README.md`
- ✅ `public/GUIA-*.md` (guías de usuario)
- ✅ `public/README-*.md` (documentación de features)
- ✅ `.gitignore`
- ✅ Archivos de ejemplo (`.example.js`)

---

## ❌ Archivos que NO van a Git

### **Información Sensible:**
- ❌ `public/firebase-config.js` (contiene API keys)
- ❌ `firebase-config.js`
- ❌ `.env` y variantes

### **Dependencias:**
- ❌ `node_modules/`
- ❌ `.firebase/`

### **Temporales:**
- ❌ `firebase-debug.log`
- ❌ Archivos de Word (`*.docx`)
- ❌ Archivos de backup (`*-BACKUP`, `*~`)
- ❌ Scripts de limpieza temporales

---

## 📋 Comandos para Commitear

### **Verificar qué va a subir:**
```bash
git status
git diff
```

### **Agregar archivos:**
```bash
# Agregar todos los archivos (respetando .gitignore)
git add .

# O agregar selectivamente
git add public/*.html
git add public/*.css
git add public/*.js
git add firestore.rules
git add package.json
```

### **Commit:**
```bash
git commit -m "Implementación completa del sistema de roles y mensajería"
```

### **Push:**
```bash
git push origin cambios-admin
```

---

## 🔒 Seguridad - IMPORTANTE

### **Si ya committeaste firebase-config.js por error:**

1. **Removerlo del historial:**
   ```bash
   git rm --cached public/firebase-config.js
   git commit -m "Remove sensitive firebase config from repository"
   ```

2. **Rotar las API Keys en Firebase Console:**
   - Ve a Firebase Console → Project Settings → API Keys
   - Regenera las claves
   - Actualiza tu `firebase-config.js` local

3. **Asegúrate de que esté en .gitignore:**
   ```bash
   echo "public/firebase-config.js" >> .gitignore
   git add .gitignore
   git commit -m "Add firebase config to gitignore"
   ```

---

## 📦 Configuración para Otros Desarrolladores

Cuando alguien clone el repositorio:

1. **Clonar:**
   ```bash
   git clone [URL_DEL_REPO]
   cd probando
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Firebase:**
   ```bash
   cp public/firebase-config.example.js public/firebase-config.js
   # Editar firebase-config.js con las credenciales
   ```

4. **Inicializar Firebase CLI (si necesario):**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   ```

---

## 🌿 Ramas Recomendadas

```
main/master  → Producción (código estable)
develop      → Desarrollo (features en progreso)
feature/*    → Features específicas
hotfix/*     → Correcciones urgentes
```

---

## ✅ Checklist antes de Push

```
□ .gitignore está configurado correctamente
□ public/firebase-config.js NO está en el commit
□ No hay archivos temporales o de backup
□ El código funciona localmente
□ Las reglas de Firestore están actualizadas
□ La documentación está actualizada
```

---

## 📞 Comandos Útiles

```bash
# Ver archivos ignorados
git status --ignored

# Ver qué archivos están trackeados
git ls-files

# Verificar si un archivo está ignorado
git check-ignore public/firebase-config.js

# Ver diferencias antes de commit
git diff

# Ver el último commit
git log -1 --stat
```

---

## 🎯 Estructura del Proyecto en Git

```
probando/
├── .gitignore                    ✅ Commitear
├── README.md                     ✅ Commitear
├── README-GIT.md                 ✅ Commitear
├── package.json                  ✅ Commitear
├── firebase.json                 ✅ Commitear
├── firestore.rules              ✅ Commitear
├── firestore.indexes.json       ✅ Commitear
├── manifest.json                ✅ Commitear
├── public/
│   ├── firebase-config.example.js  ✅ Commitear (ejemplo)
│   ├── firebase-config.js          ❌ NO commitear
│   ├── *.html                      ✅ Commitear
│   ├── *.css                       ✅ Commitear
│   ├── *.js (excepto firebase-config.js) ✅ Commitear
│   ├── *.md                        ✅ Commitear (guías)
│   └── img/                        ✅ Commitear
└── node_modules/                ❌ NO commitear
```

---

¡Listo para tu primer commit seguro! 🚀

