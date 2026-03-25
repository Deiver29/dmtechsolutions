-- ========================================
-- ACTUALIZACIÓN DE TABLA CLIENTES
-- Para hacer el campo email opcional
-- ========================================

USE dmtech;

-- Modificar la columna email para que sea opcional (NULL)
ALTER TABLE clientes 
MODIFY COLUMN email VARCHAR(150) NULL;

-- Verificar la estructura actualizada
-- DESCRIBE clientes;
