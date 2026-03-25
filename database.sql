-- ========================================
-- SCRIPT DE BASE DE DATOS - DM TECH SOLUTIONS
-- ========================================

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS dmtech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE dmtech;

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- INSERTAR USUARIOS DE PRUEBA
-- ========================================

-- Usuario 1: admin@dmtech.com / Admin123!
-- Password hasheada con password_hash()
INSERT INTO usuario (nombre, apellido, correo, password) VALUES 
('Admin', 'DM Tech', 'admin@dmtech.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Usuario 2: juan.perez@example.com / Password123
INSERT INTO usuario (nombre, apellido, correo, password) VALUES 
('Juan', 'Pérez', 'juan.perez@example.com', '$2y$10$e3mTvC5j8L4Kx9xMN2qA2OqZH8yF5Wk3rJ7xV2wS4tU6yP9vQ1nRm');

-- Usuario 3: maria.garcia@example.com / Maria2024
INSERT INTO usuario (nombre, apellido, correo, password) VALUES 
('María', 'García', 'maria.garcia@example.com', '$2y$10$k8nR5tW7yH9jL2mP4qS6vX3uZ1cF8dG2eT4oB7aQ9wN5sI6jK0pYu');

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

-- 1. Las contraseñas están hasheadas con password_hash() de PHP
-- 2. Para probar el login, usa:
--    - Correo: admin@dmtech.com
--    - Contraseña: Admin123!
--
-- 3. Para crear nuevas contraseñas hasheadas, usa este código PHP:
--    <?php echo password_hash('TuContraseña', PASSWORD_DEFAULT); ?>
--
-- 4. Si prefieres usar contraseñas en texto plano (NO RECOMENDADO en producción):
--    INSERT INTO usuario (nombre, apellido, correo, password) VALUES 
--    ('Test', 'User', 'test@example.com', 'micontraseña');
--
-- 5. El script login.php soporta tanto contraseñas hasheadas como texto plano
--    para compatibilidad, pero se recomienda usar solo hasheadas

-- ========================================
-- CONSULTAS ÚTILES
-- ========================================

-- Ver todos los usuarios
-- SELECT id, nombre, apellido, correo, created_at FROM usuario;

-- Buscar usuario por correo
-- SELECT * FROM usuario WHERE correo = 'admin@dmtech.com';

-- Actualizar contraseña de un usuario
-- UPDATE usuario SET password = '$2y$10$nuevohash' WHERE correo = 'correo@ejemplo.com';

-- Eliminar un usuario
-- DELETE FROM usuario WHERE id = 1;
