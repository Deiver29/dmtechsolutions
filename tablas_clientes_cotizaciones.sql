-- ========================================
-- TABLAS PARA CLIENTES Y COTIZACIONES
-- DM TECH SOLUTIONS
-- ========================================

USE dmtech;

-- ========================================
-- TABLA: clientes
-- ========================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    nombre VARCHAR(100) NOT NULL,
    empresa VARCHAR(150),
    tipo_cliente ENUM('persona', 'empresa') DEFAULT 'persona',
    
    -- Información de contacto
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    telefono_secundario VARCHAR(20),
    
    -- Dirección
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    pais VARCHAR(100) DEFAULT 'Colombia',
    
    -- Información fiscal (para empresas)
    nit VARCHAR(50),
    razon_social VARCHAR(200),
    
    -- Información adicional
    sitio_web VARCHAR(200),
    notas TEXT,
    
    -- Estado y auditoría
    estado ENUM('activo', 'inactivo', 'prospecto') DEFAULT 'activo',
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_usuario (usuario_id),
    
    -- Clave foránea
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: cotizaciones
-- ========================================
CREATE TABLE IF NOT EXISTS cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    numero_cotizacion VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    
    -- Cliente
    cliente_id INT NOT NULL,
    
    -- Información del cliente (guardado en la cotización por si cambia)
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_email VARCHAR(150),
    cliente_telefono VARCHAR(20),
    cliente_empresa VARCHAR(150),
    cliente_direccion TEXT,
    
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_aceptacion DATE NULL,
    
    -- Montos (en pesos colombianos COP por defecto)
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0.00,
    descuento_monto DECIMAL(15, 2) DEFAULT 0.00,
    iva_porcentaje DECIMAL(5, 2) DEFAULT 19.00,
    iva_monto DECIMAL(15, 2) DEFAULT 0.00,
    total DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Información adicional
    condiciones_pago TEXT,
    tiempo_entrega VARCHAR(100),
    validez_dias INT DEFAULT 30,
    notas TEXT,
    terminos_condiciones TEXT,
    
    -- Estado
    estado ENUM('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida', 'convertida') DEFAULT 'borrador',
    
    -- Auditoría
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_numero (numero_cotizacion),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_emision (fecha_emision),
    INDEX idx_usuario (usuario_id),
    
    -- Claves foráneas
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: cotizacion_items
-- Los items/productos de cada cotización
-- ========================================
CREATE TABLE IF NOT EXISTS cotizacion_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación con cotización
    cotizacion_id INT NOT NULL,
    
    -- Información del item
    orden INT DEFAULT 0,
    tipo ENUM('producto', 'servicio') DEFAULT 'servicio',
    codigo VARCHAR(50),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    
    -- Cantidades y precios
    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unidad VARCHAR(20) DEFAULT 'unidad',
    precio_unitario DECIMAL(15, 2) NOT NULL,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0.00,
    descuento_monto DECIMAL(15, 2) DEFAULT 0.00,
    subtotal DECIMAL(15, 2) NOT NULL,
    
    -- IVA por item (puede variar)
    aplica_iva BOOLEAN DEFAULT TRUE,
    iva_porcentaje DECIMAL(5, 2) DEFAULT 19.00,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_cotizacion (cotizacion_id),
    INDEX idx_orden (orden),
    
    -- Clave foránea
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA OPCIONAL: historial_cotizaciones
-- Para rastrear cambios de estado
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
-- DATOS DE EJEMPLO PARA CLIENTES
-- ========================================

-- Cliente 1: Empresa
INSERT INTO clientes (nombre, empresa, tipo_cliente, email, telefono, direccion, ciudad, estado, pais, nit, razon_social, sitio_web, usuario_id) 
VALUES 
('Carlos Rodríguez', 'Tech Innovations SAS', 'empresa', 'carlos@techinnovations.com', '3201234567', 'Calle 100 #15-20', 'Bogotá', 'Cundinamarca', 'Colombia', '900123456-1', 'Tech Innovations SAS', 'www.techinnovations.com', 1),

-- Cliente 2: Persona
('María González', NULL, 'persona', 'maria.gonzalez@email.com', '3109876543', 'Carrera 50 #30-45', 'Medellín', 'Antioquia', 'Colombia', NULL, NULL, NULL, 1),

-- Cliente 3: Empresa
('Andrés Martínez', 'Comercial del Valle', 'empresa', 'andres@comercialdelvalle.com', '3156789012', 'Avenida 6 Norte #25-32', 'Cali', 'Valle del Cauca', 'Colombia', '800987654-3', 'Comercial del Valle Ltda', NULL, 1);

-- ========================================
-- TRIGGER PARA ACTUALIZAR TOTALES DE COTIZACIÓN
-- ========================================
DELIMITER //

CREATE TRIGGER after_item_insert_update_totals
AFTER INSERT ON cotizacion_items
FOR EACH ROW
BEGIN
    CALL actualizar_totales_cotizacion(NEW.cotizacion_id);
END//

CREATE TRIGGER after_item_update_update_totals
AFTER UPDATE ON cotizacion_items
FOR EACH ROW
BEGIN
    CALL actualizar_totales_cotizacion(NEW.cotizacion_id);
END//

CREATE TRIGGER after_item_delete_update_totals
AFTER DELETE ON cotizacion_items
FOR EACH ROW
BEGIN
    CALL actualizar_totales_cotizacion(OLD.cotizacion_id);
END//

DELIMITER ;

-- ========================================
-- PROCEDIMIENTO PARA CALCULAR TOTALES
-- ========================================
DELIMITER //

CREATE PROCEDURE actualizar_totales_cotizacion(IN p_cotizacion_id INT)
BEGIN
    DECLARE v_subtotal DECIMAL(15,2);
    DECLARE v_iva_monto DECIMAL(15,2);
    DECLARE v_descuento_monto DECIMAL(15,2);
    DECLARE v_total DECIMAL(15,2);
    DECLARE v_descuento_porcentaje DECIMAL(5,2);
    DECLARE v_iva_porcentaje DECIMAL(5,2);
    
    -- Obtener descuento e IVA de la cotización
    SELECT descuento_porcentaje, iva_porcentaje 
    INTO v_descuento_porcentaje, v_iva_porcentaje
    FROM cotizaciones 
    WHERE id = p_cotizacion_id;
    
    -- Calcular subtotal de los items
    SELECT COALESCE(SUM(subtotal), 0) 
    INTO v_subtotal
    FROM cotizacion_items 
    WHERE cotizacion_id = p_cotizacion_id;
    
    -- Calcular descuento
    SET v_descuento_monto = v_subtotal * (v_descuento_porcentaje / 100);
    
    -- Calcular IVA (sobre el subtotal después del descuento)
    SET v_iva_monto = (v_subtotal - v_descuento_monto) * (v_iva_porcentaje / 100);
    
    -- Calcular total
    SET v_total = v_subtotal - v_descuento_monto + v_iva_monto;
    
    -- Actualizar la cotización
    UPDATE cotizaciones 
    SET subtotal = v_subtotal,
        descuento_monto = v_descuento_monto,
        iva_monto = v_iva_monto,
        total = v_total
    WHERE id = p_cotizacion_id;
END//

DELIMITER ;

-- ========================================
-- FUNCIÓN PARA GENERAR NÚMERO DE COTIZACIÓN
-- ========================================
DELIMITER //

CREATE FUNCTION generar_numero_cotizacion() 
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE nuevo_numero VARCHAR(50);
    DECLARE contador INT;
    
    -- Obtener el contador del año actual
    SELECT COUNT(*) + 1 INTO contador
    FROM cotizaciones
    WHERE YEAR(fecha_emision) = YEAR(CURDATE());
    
    -- Formato: COT-2026-0001
    SET nuevo_numero = CONCAT('COT-', YEAR(CURDATE()), '-', LPAD(contador, 4, '0'));
    
    RETURN nuevo_numero;
END//

DELIMITER ;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de cotizaciones con información del cliente
CREATE OR REPLACE VIEW vista_cotizaciones_completas AS
SELECT 
    c.*,
    cli.nombre as cliente_nombre_actual,
    cli.empresa as cliente_empresa_actual,
    cli.email as cliente_email_actual,
    u.nombre as creador_nombre,
    u.apellido as creador_apellido
FROM cotizaciones c
JOIN clientes cli ON c.cliente_id = cli.id
JOIN usuario u ON c.usuario_id = u.id;

-- Vista de items de cotización
CREATE OR REPLACE VIEW vista_cotizacion_items_detalle AS
SELECT 
    ci.*,
    cot.numero_cotizacion,
    cot.estado as cotizacion_estado,
    cli.nombre as cliente_nombre
FROM cotizacion_items ci
JOIN cotizaciones cot ON ci.cotizacion_id = cot.id
JOIN clientes cli ON cot.cliente_id = cli.id;

-- ========================================
-- CONSULTAS ÚTILES
-- ========================================

-- Ver todos los clientes
-- SELECT * FROM clientes ORDER BY nombre;

-- Ver todas las cotizaciones con totales
-- SELECT id, numero_cotizacion, cliente_nombre, fecha_emision, total, estado FROM cotizaciones ORDER BY fecha_emision DESC;

-- Ver items de una cotización específica
-- SELECT * FROM cotizacion_items WHERE cotizacion_id = 1 ORDER BY orden;

-- Ver cotizaciones de un cliente
-- SELECT * FROM cotizaciones WHERE cliente_id = 1;

-- Estadísticas de cotizaciones por estado
-- SELECT estado, COUNT(*) as cantidad, SUM(total) as total_monto FROM cotizaciones GROUP BY estado;
