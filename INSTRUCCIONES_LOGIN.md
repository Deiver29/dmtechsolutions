# 🔐 Sistema de Inicio de Sesión - DM Tech Solutions

Sistema completo de autenticación de usuarios para el sitio web de DM Tech Solutions.

## 📋 Características

- ✅ Modal de inicio de sesión moderno y responsive
- ✅ Validación de formularios (cliente y servidor)
- ✅ Contraseñas hasheadas con `password_hash()` de PHP
- ✅ Sesiones seguras con PHP
- ✅ Mensajes de error y éxito informativos
- ✅ Opción "Recordarme" con localStorage
- ✅ Compatibilidad con contraseñas en texto plano y hasheadas
- ✅ Protección contra SQL Injection con PDO
- ✅ Diseño coherente con el estilo corporativo del sitio

## 🗂️ Archivos Creados/Modificados

### Archivos Nuevos:
- `login.php` - Procesa el inicio de sesión
- `logout.php` - Cierra la sesión del usuario
- `check_session.php` - Verifica si hay una sesión activa
- `database.sql` - Script para crear la base de datos y usuarios de prueba
- `INSTRUCCIONES_LOGIN.md` - Este archivo

### Archivos Modificados:
- `index.html` - Agregado botón de login y modal
- `css/styles.css` - Estilos del modal y botón de login
- `js/main.js` - JavaScript para manejar el modal y peticiones AJAX

## 🚀 Instalación y Configuración

### Paso 1: Configurar la Base de Datos

1. Abre **phpMyAdmin** en tu navegador:
   ```
   http://localhost/phpmyadmin
   ```
   o
   ```
   http://localhost:8080/phpmyadmin
   ```

2. Ejecuta el archivo `database.sql`:
   - Ve a la pestaña "SQL"
   - Copia y pega el contenido de `database.sql`
   - Haz clic en "Continuar" para ejecutar

   Esto creará:
   - Base de datos `dmtech`
   - Tabla `usuario` con campos necesarios
   - 3 usuarios de prueba

### Paso 2: Verificar Configuración de PHP

Edita el archivo `login.php` si tu configuración es diferente:

```php
// Líneas 6-9 en login.php
$host = 'localhost';      // Tu host de MySQL
$dbname = 'dmtech';       // Nombre de tu base de datos
$username = 'root';       // Tu usuario de MySQL
$password = '';           // Tu contraseña de MySQL
```

### Paso 3: Probar el Sistema

1. Abre el sitio en tu navegador:
   ```
   http://localhost/dmtechsolutions/
   ```
   o
   ```
   http://localhost:8080/dmtechsolutions/
   ```

2. Haz clic en el botón **"Iniciar Sesión"** en el header

3. Usa estas credenciales de prueba:
   ```
   Correo: admin@dmtech.com
   Contraseña: Admin123!
   ```

## 👤 Usuarios de Prueba

| Correo | Contraseña | Nombre |
|--------|-----------|--------|
| admin@dmtech.com | Admin123! | Admin DM Tech |
| juan.perez@example.com | Password123 | Juan Pérez |
| maria.garcia@example.com | Maria2024 | María García |

## 🔧 Uso y Funcionalidades

### Iniciar Sesión

1. Clic en "Iniciar Sesión" en el header
2. Ingresa correo y contraseña
3. (Opcional) Marca "Recordarme" para guardar el correo
4. Clic en "Iniciar Sesión"

### Verificar Sesión Activa

El archivo `check_session.php` permite verificar si hay una sesión activa:

```javascript
fetch('check_session.php')
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            console.log('Usuario:', data.usuario.nombre);
        }
    });
```

### Cerrar Sesión

Redirige al usuario a `logout.php`:

```javascript
window.location.href = 'logout.php';
```

## 🛡️ Seguridad

### Contraseñas Hasheadas

El sistema usa `password_hash()` de PHP con el algoritmo BCRYPT:

```php
// Para crear una contraseña hasheada
$hash = password_hash('MiContraseña', PASSWORD_DEFAULT);

// Para verificar
password_verify('MiContraseña', $hash);
```

### Protección SQL Injection

Se usan consultas preparadas con PDO:

```php
$stmt = $pdo->prepare("SELECT * FROM usuario WHERE correo = :correo");
$stmt->execute(['correo' => $correo]);
```

### Sesiones Seguras

Las sesiones de PHP almacenan:
- ID del usuario
- Nombre y apellido
- Correo electrónico
- Hora de inicio de sesión

## 📝 Agregar Nuevos Usuarios

### Opción 1: Desde phpMyAdmin

1. Ve a la tabla `usuario`
2. Clic en "Insertar"
3. Para la contraseña, primero hasheala:

```php
// Crea un archivo temporal hash_password.php
<?php
echo password_hash('TuContraseña', PASSWORD_DEFAULT);
?>
```

### Opción 2: Con SQL

```sql
INSERT INTO usuario (nombre, apellido, correo, password) VALUES 
('Nuevo', 'Usuario', 'nuevo@correo.com', 
'$2y$10$hash_generado_aqui');
```

### Opción 3: Sistema de Registro (Por Implementar)

Puedes crear un archivo `register.php` similar a `login.php` para permitir el registro de nuevos usuarios.

## 🎨 Personalización

### Cambiar Colores del Modal

Edita en `css/styles.css`:

```css
.btn-login {
    background: linear-gradient(135deg, #TU_COLOR, #TU_COLOR);
}

.modal-header-login h2 i {
    color: #TU_COLOR;
}
```

### Redirigir Después del Login

En `js/main.js`, línea ~785:

```javascript
// Descomentar para redirigir a un dashboard
window.location.href = 'dashboard.html';
```

## 🐛 Solución de Problemas

### Error: "Error de conexión"

- Verifica que XAMPP esté corriendo
- Confirma que MySQL esté activo
- Revisa las credenciales en `login.php`

### Error: "Correo o contraseña incorrectos"

- Verifica que el usuario exista en la base de datos
- Usa las credenciales de prueba exactamente como están
- Revisa que la tabla `usuario` tenga datos

### El modal no se abre

- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que `main.js` esté cargando correctamente

### Las contraseñas no funcionan

El sistema intenta primero con contraseña hasheada y luego con texto plano. Si usas contraseñas en texto plano (NO RECOMENDADO), inserta directamente:

```sql
INSERT INTO usuario (nombre, apellido, correo, password) 
VALUES ('Test', 'User', 'test@test.com', 'password123');
```

## 📱 Responsive Design

El sistema es completamente responsive:
- Desktop: Modal centrado con ancho máximo de 440px
- Tablet: Modal con 95% de ancho
- Mobile: Modal adaptado con padding reducido

## 🔄 Próximas Mejoras Sugeridas

- [ ] Sistema de registro de usuarios
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Perfil de usuario editable
- [ ] Roles y permisos
- [ ] Autenticación de dos factores
- [ ] Login con redes sociales

## 📞 Soporte

Para cualquier duda o problema, contacta al equipo de desarrollo de DM Tech Solutions.

---

**Desarrollado por:** DM Tech Solutions  
**Versión:** 1.0.0  
**Fecha:** Marzo 2026
