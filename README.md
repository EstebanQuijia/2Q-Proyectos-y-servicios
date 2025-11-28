# 📘 Sistema de Gestión de Inventario y Alquiler de Equipos de Topografía

Sistema web desarrollado para **2Q Proyectos y Servicios** que permite gestionar de manera eficiente el inventario de equipos de topografía, el registro de clientes y los procesos de alquiler. Incluye automatización de documentos de responsabilidad mediante Power Automate.

---

## 🧑‍🎓 Datos del Estudiante
- **Autor:** Esteban Quijia  
- **Carrera:** Ingeniería en Sistemas / Desarrollo de Software  
- **Docente:** Jonathan Quespaz  
- **Período:** 2025  

---

## 📌 Descripción General del Proyecto

Este proyecto nace de una necesidad real de **2Q Proyectos y Servicios**, empresa dedicada al alquiler de equipos de topografía. Actualmente, la gestión del inventario, clientes y documentos de alquiler se realiza de forma manual, lo que genera pérdida de tiempo, duplicidad de información y riesgo de errores.

**El sistema permite:**
- Registrar y controlar tipos de equipos (GPS, Estaciones Totales, Bastones, etc.)
- Gestionar unidades individuales con números de serie
- Registrar clientes con su información completa
- Controlar alquileres con fechas y estados
- Automatizar la generación de documentos de responsabilidad (en desarrollo con Power Automate)

**Alcance:** Sistema web completo con backend API REST, frontend responsivo y base de datos relacional.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una arquitectura **Modelo-Vista-Controlador (MVC)** con separación clara entre frontend y backend:

### Componentes principales:
- **Frontend:** Interfaz web estática servida por Express
- **Backend:** API REST desarrollada en Node.js + Express
- **Base de datos:** SQLite (desarrollo) → PostgreSQL (producción)
- **Automatización:** Microsoft Power Automate (próxima integración)

### Flujo principal:
```
Usuario → Frontend (HTML/CSS/JS) → API REST (Express) → Base de Datos (SQLite)
                                        ↓
                               Power Automate → Generación de documentos PDF
```

---

## 🛠️ Tecnologías y Versiones Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | 22.16.0 | Runtime del backend |
| Express | 4.21.2 | Framework web |
| SQLite3 | 5.1.7 | Base de datos (desarrollo) |
| bcryptjs | 2.4.3 | Encriptación de contraseñas |
| jsonwebtoken | 9.0.2 | Autenticación con tokens |
| multer | 1.4.5-lts.1 | Manejo de archivos/imágenes |
| cors | 2.8.5 | Control de acceso entre dominios |
| HTML5/CSS3/JavaScript | - | Frontend |

---

## 📦 Dependencias

Las dependencias se manejan mediante `package.json` en la carpeta `backend/`.

Para instalar todas las dependencias:
```bash
cd backend
npm install
```

---

## 🚀 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

| Herramienta / Servicio | Versión Recomendada | Descripción |
|------------------------|---------------------|-------------|
| Git | 2.x o superior | Control de versiones |
| Node.js | 20.x o superior | Runtime de JavaScript |
| npm | 10.x o superior | Gestor de paquetes |
| SQLite3 | 3.x | Motor de base de datos |

---

## 🔧 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/quibuild-inventario.git
cd quibuild-inventario
```

### 2. Instalar dependencias
```bash
cd backend
npm install
```

### 3. Inicializar la base de datos
```bash
node src/database/init.js
```

Esto creará:
- La base de datos `inventario.db`
- Tablas: `usuarios`, `tipos_equipos`, `equipos`, `clientes`, `alquileres`
- Usuario administrador de prueba

### 4. Credenciales de acceso inicial
- **Correo:** admin@2q.com
- **Contraseña:** 1234

⚠️ **Importante:** Cambia estas credenciales en producción.

---

## 🗄️ Base de Datos

### 🔹 Estructura de la BD

El sistema utiliza 5 tablas principales:

**1. usuarios**
- Almacena los usuarios del sistema (administradores)
- Contraseñas encriptadas con bcrypt

**2. tipos_equipos**
- Catálogo de tipos de equipos (GPS Trimble R10, Estación Total, etc.)
- Incluye foto, marca, modelo y descripción

**3. equipos**
- Inventario individual (cada equipo físico)
- Relacionado con `tipos_equipos`
- Contiene número de serie, variante (2m, 2.5m), estado

**4. clientes**
- Información de clientes que alquilan equipos
- Cédula única, teléfono, correo, dirección

**5. alquileres**
- Registro de alquileres activos e históricos
- Relación entre cliente y equipo específico
- Fechas de inicio/fin, estado, observaciones

### 🔹 Diagrama de relaciones
```
tipos_equipos (1) ─────< (N) equipos
clientes (1) ─────< (N) alquileres
equipos (1) ─────< (N) alquileres
```

### 🔹 Inicialización de la Base de Datos

La base de datos se inicializa automáticamente al ejecutar:
```bash
node src/database/init.js
```

Si necesitas resetear la base de datos:
```bash
cd backend/src/database
rm inventario.db          # Windows: del inventario.db
cd ../..
node src/database/init.js
```

---

## ▶️ Instrucciones para Ejecutar el Proyecto

### Iniciar el servidor completo (Backend + Frontend)
```bash
cd backend
node server.js
```

El servidor se levantará en: **http://localhost:3000**

### Puertos y servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend + API | 3000 | http://localhost:3000 |
| API REST | 3000 | http://localhost:3000/api |

### Acceso al sistema

1. Abre tu navegador en: **http://localhost:3000**
2. Inicia sesión con las credenciales de prueba
3. Navega a "Gestionar Equipos" o "Ver Inventario"

---

## 📁 Estructura del Proyecto
```
quibuild-inventario/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── inventarioController.js
│   │   │   └── equiposController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── inventarioRoutes.js
│   │   │   └── equiposRoutes.js
│   │   ├── models/
│   │   └── database/
│   │       ├── db.js
│   │       ├── init.js
│   │       └── inventario.db
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── login.js
│   │   ├── inicio.js
│   │   ├── inventario.js
│   │   └── gestion-equipos.js
│   ├── media/
│   │   └── equipos/
│   ├── index.html
│   ├── login.html
│   ├── inicio.html
│   ├── inventario.html
│   └── gestion-equipos.html
│
├── .gitignore
└── README.md
```

---

## 📊 Datos, Archivos o Recursos Necesarios

### Imágenes de equipos

Las fotos de los equipos deben ubicarse en:
```
frontend/media/equipos/
```

Formatos soportados: `.jpg`, `.jpeg`, `.png`

### Base de datos

La base de datos SQLite se crea automáticamente en:
```
backend/src/database/inventario.db
```

⚠️ Este archivo **NO** debe subirse al repositorio (incluido en `.gitignore`)

---

## 🛡️ Notas de Seguridad

- ✅ Las contraseñas se almacenan encriptadas con **bcrypt**
- ✅ Autenticación mediante **JWT** (JSON Web Tokens)
- ✅ Validación de datos en el backend
- ⚠️ **NO** subir el archivo `inventario.db` al repositorio
- ⚠️ Cambiar credenciales de administrador en producción
- ⚠️ Usar variables de entorno para secretos en producción

### Clave JWT actual (desarrollo):
```javascript
const JWT_SECRET = 'mi_clave_secreta_quibuild_2024';
```
**Cambiar esta clave en producción** y moverla a un archivo `.env`.

---

## 🤝 Colaboradores

Para revisión por parte del docente, añada como colaborador:

* **Usuario GitHub:** `JonathanDQS`
* **Nombre:** `Jonathan Quespaz`

Ruta:
**Settings → Collaborators and teams → Add collaborator**

---

## 📅 Estado del Proyecto

### ✅ Funcionalidades Completadas
- Sistema de autenticación (login/logout)
- Gestión de tipos de equipos (CRUD)
- Gestión de unidades individuales (CRUD)
- Vista de inventario con stock disponible
- Subida y visualización de imágenes
- Diseño responsivo y profesional

### 🚧 En Desarrollo
- Vista detallada de unidades específicas por tipo
- Gestión completa de clientes (CRUD)
- Sistema de alquileres (crear, consultar, finalizar)
- Integración con Power Automate para generación de documentos PDF
- Notificaciones por correo electrónico
- Reportes y estadísticas

### 🔮 Funcionalidades Futuras
- Migración a PostgreSQL para producción
- Sistema de roles (admin, operador, solo lectura)
- Historial de mantenimiento de equipos
- Dashboard con métricas y gráficos
- App móvil complementaria

---

## 🐛 Problemas Conocidos

- La base de datos SQLite es adecuada solo para desarrollo/testing
- Las imágenes se almacenan localmente (considerar cloud storage para producción)
- La integración con Power Automate requiere configuración adicional

---

## 📄 Licencia

Este proyecto es de uso académico para la materia de Desarrollo de Software.

---

## 📞 Contacto

**Desarrollador:** Esteban Quijia  
**Empresa Cliente:** 2Q Proyectos y Servicios  

---

**Última actualización:** Noviembre 2025
