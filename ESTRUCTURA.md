# 📁 DM TECH SOLUTIONS - Estructura del Proyecto

## 🗂️ Organización de Carpetas

```
dmtechsolutions/
│
├── 📄 index.html                  # Página principal con formulario de login
├── 📄 dashboard.html             # Panel de administración principal
│
├── 📂 config/                    # ⚙️ CONFIGURACIÓN
│   └── db_config.php            # Configuración centralizada de base de datos
│
├── 📂 modules/                   # 🔧 MÓDULOS FUNCIONALES
│   │
│   ├── 📂 auth/                 # 🔐 Autenticación
│   │   ├── login.php           # Procesar inicio de sesión
│   │   ├── logout.php          # Cerrar sesión
│   │   └── check_session.php   # Verificar sesión activa
│   │
│   ├── 📂 clientes/             # 👥 Gestión de Clientes
│   │   ├── guardar_cliente.php  # Crear nuevo cliente
│   │   ├── listar_clientes.php  # Listar todos los clientes
│   │   └── clientes_api.php     # API completa (opcional)
│   │
│   └── 📂 cotizaciones/         # 📋 Gestión de Cotizaciones
│       ├── guardar_cotizacion.php    # Crear nueva cotización
│       └── cotizaciones_api.php      # API completa (opcional)
│
├── 📂 database/                 # 💾 BASE DE DATOS
│   └── tablas_basicas.sql      # Script para crear tablas
│
├── 📂 css/                      # 🎨 ESTILOS
│   ├── styles.css              # Estilos página principal
│   └── dashboard.css           # Estilos del dashboard
│
├── 📂 js/                       # ⚡ JAVASCRIPT
│   ├── main.js                 # JS página principal
│   └── dashboard.js            # JS del dashboard
│
└── 📂 images/                   # 🖼️ IMÁGENES
    └── (archivos de imagen)

```

## 🏗️ Arquitectura

### 1️⃣ Módulo de Autenticación (`modules/auth/`)
- **login.php**: Valida credenciales y crea sesión
- **check_session.php**: Verifica si el usuario está logueado
- **logout.php**: Destruye la sesión del usuario

### 2️⃣ Módulo de Clientes (`modules/clientes/`)
- **guardar_cliente.php**: INSERT simple para crear clientes
- **listar_clientes.php**: SELECT simple para listar clientes
- **clientes_api.php**: API REST completa (CRUD) - opcional

### 3️⃣ Módulo de Cotizaciones (`modules/cotizaciones/`)
- **guardar_cotizacion.php**: INSERT simple para crear cotizaciones
- **cotizaciones_api.php**: API REST completa (CRUD) - opcional

### 4️⃣ Configuración (`config/`)
- **db_config.php**: Configuración centralizada de MySQL
  - Funciones: `getPDOConnection()` y `getMySQLiConnection()`

### 5️⃣ Base de Datos (`database/`)
- **tablas_basicas.sql**: Script para crear todas las tablas necesarias

## 🔄 Flujo de Trabajo

### Login
```
index.html → js/main.js → modules/auth/login.php → dashboard.html
```

### Crear Cliente
```
dashboard.html → js/dashboard.js → modules/clientes/guardar_cliente.php → DB
```

### Crear Cotización
```
dashboard.html → js/dashboard.js → modules/cotizaciones/guardar_cotizacion.php → DB
```

## 🚀 Cómo Usar

### 1. Configurar Base de Datos
```bash
# Abrir phpMyAdmin en: http://localhost:8080/phpmyadmin
# Seleccionar base de datos: dmtech
# Ir a pestaña SQL
# Ejecutar el archivo: database/tablas_basicas.sql
```

### 2. Configurar Conexión (si es necesario)
Editar `config/db_config.php` para cambiar:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'dmtech');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### 3. Acceder al Sistema
```
http://localhost:8080/dmtechsolutions/
```

## 📝 Ventajas de esta Estructura

✅ **Modularidad**: Cada funcionalidad en su propia carpeta  
✅ **Mantenibilidad**: Fácil de encontrar y editar código  
✅ **Escalabilidad**: Puedes agregar nuevos módulos fácilmente  
✅ **Claridad**: La estructura refleja las funcionalidades  
✅ **Reutilización**: Configuración centralizada en un solo lugar  

## 🆕 Agregar Nuevos Módulos

Para agregar un nuevo módulo (ej: "proyectos"):

1. Crear carpeta: `modules/proyectos/`
2. Crear archivos PHP necesarios
3. Usar configuración: `require_once '../../config/db_config.php';`
4. Actualizar rutas en JavaScript correspondiente

---
**DM Tech Solutions** - Sistema de Gestión Empresarial
