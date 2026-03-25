# 🎯 Dashboard DM Tech Solutions

Dashboard completo para gestionar tu empresa, con funcionalidades de clientes, cotizaciones, proyectos y más.

## ✨ Características

### ✅ Implementado:
- 🏠 **Dashboard Principal** con estadísticas en tiempo real
- 👥 **Gestión de Clientes** - Crear, ver, editar y eliminar clientes
- 📊 **Estadísticas Visuales** - Tarjetas con métricas importantes
- 🔒 **Protección de Sesión** - Solo usuarios autenticados pueden acceder
- 📱 **Diseño Responsive** - Funciona en móvil, tablet y desktop
- 🎨 **Interfaz Moderna** - Diseño profesional coherente con tu marca
- 🔔 **Sistema de Notificaciones** - Alertas visuales elegantes
- 📑 **Navegación por Secciones** - Sidebar con menú completo

### 🚧 Próximamente (Por Implementar):
- 💰 **Cotizaciones** - Sistema completo de cotizaciones
- 📦 **Proyectos** - Gestión de proyectos activos
- ⚙️ **Servicios** - Catálogo de servicios
- 📈 **Reportes** - Análisis e inteligencia de negocios
- 🔧 **Configuración** - Ajustes de perfil y empresa

## 🚀 Cómo Funciona

### 1️⃣ Iniciar Sesión
1. Ve a `http://localhost:8080/dmtechsolutions/`
2. Haz clic en **"Iniciar Sesión"**
3. Ingresa credenciales:
   - **Correo:** `admin@dmtech.com`
   - **Contraseña:** `Admin123!`
4. Automáticamente serás redirigido al dashboard

### 2️⃣ Navegación del Dashboard

#### **Sidebar (Menú Lateral)**
- 🏠 Dashboard - Vista general
- 👥 Clientes - Gestión de clientes
- 💰 Cotizaciones - Sistema de cotizaciones
- 📦 Proyectos - Gestión de proyectos
- ⚙️ Servicios - Catálogo de servicios
- 📈 Reportes - Análisis y reportes
- 🔧 Configuración - Ajustes generales

#### **Barra Superior**
- 🔍 Búsqueda rápida
- 🔔 Notificaciones (3 pendientes)
- 👤 Perfil de usuario

### 3️⃣ Gestionar Clientes

#### Agregar Nuevo Cliente:
1. Clic en **"Clientes"** en el sidebar
2. Clic en **"Nuevo Cliente"**
3. Completa el formulario:
   - Nombre (obligatorio)
   - Empresa
   - Email (obligatorio)
   - Teléfono (obligatorio)
   - Dirección
4. Clic en **"Guardar Cliente"**

El cliente aparecerá en la tabla y el contador se actualizará automáticamente.

### 4️⃣ Cerrar Sesión
- Clic en **"Cerrar Sesión"** al final del sidebar
- Serás redirigido a la página principal (index.html)

## 📁 Estructura de Archivos

```
dmtechsolutions/
├── dashboard.html          # Página principal del dashboard
├── css/
│   └── dashboard.css      # Estilos del dashboard
├── js/
│   └── dashboard.js       # Funcionalidad del dashboard
├── login.php              # Procesa el login
├── logout.php             # Cierra la sesión
├── check_session.php      # Verifica sesión activa
└── database.sql           # Base de datos
```

## 🔐 Seguridad

### Protección del Dashboard:
El archivo `dashboard.js` verifica automáticamente si hay una sesión activa:

```javascript
// Si no hay sesión, redirige al index
if (!data.logged_in) {
    window.location.href = 'index.html';
}
```

### Flujo de Autenticación:
1. Usuario inicia sesión en `index.html`
2. `login.php` valida credenciales
3. Si es válido, crea sesión PHP
4. Redirige a `dashboard.html`
5. `dashboard.js` verifica sesión con `check_session.php`
6. Si no hay sesión válida, regresa a `index.html`

## 💾 Almacenamiento de Datos

### **Actualmente:**
- Los clientes se guardan temporalmente en el navegador
- Los datos se pierden al recargar la página

### **Próximamente (Conectar con Base de Datos):**

#### Crear archivo `clientes_api.php`:
```php
<?php
session_start();
header('Content-Type: application/json');

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$host = 'localhost';
$dbname = 'dmtech';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Listar clientes
        $stmt = $pdo->query("SELECT * FROM clientes");
        echo json_encode(['success' => true, 'clientes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Crear cliente
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("INSERT INTO clientes (nombre, empresa, email, telefono, direccion) 
                               VALUES (:nombre, :empresa, :email, :telefono, :direccion)");
        
        $stmt->execute([
            'nombre' => $data['nombre'],
            'empresa' => $data['empresa'],
            'email' => $data['email'],
            'telefono' => $data['telefono'],
            'direccion' => $data['direccion']
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
```

#### Crear tabla de clientes:
```sql
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```

## 🎨 Personalización

### Cambiar Colores:
Edita las variables en `css/dashboard.css`:

```css
:root {
    --primary-color: #0066FF;      /* Color principal */
    --secondary-color: #00D4B8;    /* Color secundario */
    --success: #10b981;            /* Color de éxito */
    --warning: #f59e0b;            /* Color de advertencia */
    --error: #ef4444;              /* Color de error */
}
```

### Agregar Nueva Sección:
1. Agrega item en el sidebar (dashboard.html):
```html
<a href="#miseccion" class="nav-item" data-section="miseccion">
    <i class="fas fa-icon"></i>
    <span>Mi Sección</span>
</a>
```

2. Agrega el contenido de la sección:
```html
<section id="section-miseccion" class="content-section">
    <div class="section-header">
        <h2><i class="fas fa-icon"></i> Mi Sección</h2>
    </div>
    <!-- Tu contenido aquí -->
</section>
```

3. Actualiza el título en `dashboard.js`:
```javascript
const titles = {
    // ... otros títulos
    miseccion: 'Mi Sección'
};
```

## 📱 Responsive Design

El dashboard es completamente responsive:

- **Desktop** (>1024px): Sidebar fijo, vista completa
- **Tablet** (768px-1024px): Sidebar colapsable
- **Mobile** (<768px): Sidebar oculto, menú hamburguesa

## 🔧 Solución de Problemas

### No puedo acceder al dashboard
- Verifica que hayas iniciado sesión correctamente
- Abre la consola del navegador (F12) y busca errores
- Verifica que `check_session.php` esté funcionando

### Las estadísticas muestran 0
- Por defecto, todas las estadísticas están en 0
- Agrega clientes para ver los contadores actualizarse
- Conecta con la base de datos para datos reales

### El sidebar no se muestra en móvil
- Haz clic en el icono de menú (☰) en la esquina superior izquierda
- El sidebar se deslizará desde la izquierda

## 🆕 Próximas Funcionalidades a Implementar

Cuando necesites agregar estas funcionalidades, pídemelas:

1. **Sistema de Cotizaciones Completo**
   - Crear cotizaciones con items
   - Calcular subtotales, IVA y totales
   - Generar PDF de cotizaciones
   - Enviar por email

2. **Gestión de Proyectos**
   - Crear y asignar proyectos
   - Seguimiento de progreso
   - Gestión de tareas
   - Kanban board

3. **Catálogo de Servicios**
   - CRUD de servicios
   - Precios y descripciones
   - Categorías de servicios

4. **Sistema de Reportes**
   - Gráficas de ventas
   - Estadísticas detalladas
   - Exportación de datos
   - Dashboard analytics

5. **Gestión de Usuarios**
   - Múltiples usuarios
   - Roles y permisos
   - Historial de actividad

## 📞 Soporte

Para agregar más funcionalidades o resolver problemas, solo mencióname lo que necesitas.

---

**Desarrollado para:** DM Tech Solutions  
**Versión:** 1.0.0  
**Fecha:** Marzo 2026
