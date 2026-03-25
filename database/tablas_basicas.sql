-- ========================================
-- TABLAS BÁSICAS PARA CLIENTES Y COTIZACIONES
-- DM TECH SOLUTIONS - Versión Simplificada
-- ========================================

USE dmtech;

-- ========================================
-- TABLA: clientes
-- ========================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(150),
    tipo_cliente ENUM('persona', 'empresa') DEFAULT 'persona',
    email VARCHAR(150),
    telefono VARCHAR(20) NOT NULL,
    telefono_secundario VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado_depto VARCHAR(100),
    codigo_postal VARCHAR(10),
    pais VARCHAR(100) DEFAULT 'Colombia',
    nit VARCHAR(50),
    razon_social VARCHAR(200),
    sitio_web VARCHAR(200),
    notas TEXT,
    estado ENUM('activo', 'inactivo', 'prospecto') DEFAULT 'activo',
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_usuario (usuario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: cotizaciones
-- ========================================
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_cotizacion VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    cliente_id INT NOT NULL,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_email VARCHAR(150),
    cliente_telefono VARCHAR(20),
    cliente_empresa VARCHAR(150),
    cliente_direccion TEXT,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_aceptacion DATE NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0.00,
    descuento_monto DECIMAL(15, 2) DEFAULT 0.00,
    iva_porcentaje DECIMAL(5, 2) DEFAULT 19.00,
    iva_monto DECIMAL(15, 2) DEFAULT 0.00,
    total DECIMAL(15, 2) DEFAULT 0.00,
    condiciones_pago TEXT,
    tiempo_entrega VARCHAR(100),
    validez_dias INT DEFAULT 30,
    notas TEXT,
    terminos_condiciones TEXT,
    estado ENUM('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida', 'convertida') DEFAULT 'borrador',
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (numero_cotizacion),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_emision (fecha_emision),
    INDEX idx_usuario (usuario_id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: cotizacion_items
-- ========================================
CREATE TABLE IF NOT EXISTS cotizacion_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT NOT NULL,
    orden INT DEFAULT 0,
    tipo ENUM('producto', 'servicio') DEFAULT 'servicio',
    codigo VARCHAR(50),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unidad VARCHAR(20) DEFAULT 'unidad',
    precio_unitario DECIMAL(15, 2) NOT NULL,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0.00,
    descuento_monto DECIMAL(15, 2) DEFAULT 0.00,
    subtotal DECIMAL(15, 2) NOT NULL,
    aplica_iva TINYINT(1) DEFAULT 1,
    iva_porcentaje DECIMAL(5, 2) DEFAULT 19.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cotizacion (cotizacion_id),
    INDEX idx_orden (orden),
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: historial_cotizaciones
-- ========================================
CREATE TABLE IF NOT EXISTS historial_cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT NOT NULL,
    estado_anterior ENUM('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida', 'convertida'),
    estado_nuevo ENUM('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida', 'convertida') NOT NULL,
    comentario TEXT,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cotizacion (cotizacion_id),
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- DATOS DE EJEMPLO
-- ========================================
INSERT INTO clientes (nombre, empresa, tipo_cliente, email, telefono, direccion, ciudad, estado_depto, pais, nit, razon_social, sitio_web, usuario_id) 
VALUES 
('Carlos Rodríguez', 'Tech Innovations SAS', 'empresa', 'carlos@techinnovations.com', '3201234567', 'Calle 100 #15-20', 'Bogotá', 'Cundinamarca', 'Colombia', '900123456-1', 'Tech Innovations SAS', 'www.techinnovations.com', 1),
('María González', NULL, 'persona', 'maria.gonzalez@email.com', '3109876543', 'Carrera 50 #30-45', 'Medellín', 'Antioquia', 'Colombia', NULL, NULL, NULL, 1),
('Andrés Martínez', 'Comercial del Valle', 'empresa', 'andres@comercialdelvalle.com', '3156789012', 'Avenida 6 Norte #25-32', 'Cali', 'Valle del Cauca', 'Colombia', '800987654-3', 'Comercial del Valle Ltda', NULL, 1);

