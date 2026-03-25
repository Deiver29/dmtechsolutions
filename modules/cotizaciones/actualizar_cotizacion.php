<?php
session_start();
header('Content-Type: application/json');

// Incluir configuración de base de datos
require_once '../../config/db_config.php';

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Validar datos requeridos
if (!isset($_POST['id']) || empty($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de cotización no proporcionado']);
    exit;
}

$cotizacion_id = intval($_POST['id']);
$titulo = trim($_POST['titulo'] ?? '');
$cliente_id = intval($_POST['cliente_id'] ?? 0);
$fecha_emision = $_POST['fecha_emision'] ?? '';
$descripcion = trim($_POST['descripcion'] ?? '');

// Validar datos obligatorios
if (empty($titulo) || $cliente_id <= 0 || empty($fecha_emision)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

// Validar items
if (!isset($_POST['items']) || !is_array($_POST['items']) || count($_POST['items']) === 0) {
    echo json_encode(['success' => false, 'message' => 'Debe agregar al menos un item']);
    exit;
}

// Obtener totales
$subtotal = floatval($_POST['subtotal'] ?? 0);
$iva_monto = floatval($_POST['iva_monto'] ?? 0);
$total = floatval($_POST['total'] ?? 0);

// Conexión
try {
    $conn = getMySQLiConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

// Iniciar transacción
$conn->begin_transaction();

try {
    // Verificar que la cotización existe y pertenece a este usuario
    $sql_check = "SELECT id FROM cotizaciones WHERE id = ? AND usuario_id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param('ii', $cotizacion_id, $_SESSION['usuario_id']);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception('Cotización no encontrada');
    }
    $stmt_check->close();
    
    // Actualizar cotización
    $sql_update = "UPDATE cotizaciones SET 
                    titulo = ?,
                    cliente_id = ?,
                    descripcion = ?,
                    fecha_emision = ?,
                    subtotal = ?,
                    iva_monto = ?,
                    total = ?,
                    usuario_id = ?
                  WHERE id = ?";
    
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param(
        'sisdddiii',
        $titulo,
        $cliente_id,
        $descripcion,
        $fecha_emision,
        $subtotal,
        $iva_monto,
        $total,
        $_SESSION['usuario_id'],
        $cotizacion_id
    );
    
    if (!$stmt_update->execute()) {
        throw new Exception('Error al actualizar cotización');
    }
    $stmt_update->close();
    
    // Eliminar items anteriores
    $sql_delete_items = "DELETE FROM cotizacion_items WHERE cotizacion_id = ?";
    $stmt_delete = $conn->prepare($sql_delete_items);
    $stmt_delete->bind_param('i', $cotizacion_id);
    $stmt_delete->execute();
    $stmt_delete->close();
    
    // Insertar nuevos items
    $sql_item = "INSERT INTO cotizacion_items 
                 (cotizacion_id, nombre, cantidad, precio_unitario, subtotal, tipo, aplica_iva, iva_porcentaje, orden) 
                 VALUES (?, ?, ?, ?, ?, 'servicio', 1, 19, ?)";
    
    $stmt_item = $conn->prepare($sql_item);
    
    foreach ($_POST['items'] as $index => $item) {
        $nombre = trim($item['nombre']);
        $cantidad = floatval($item['cantidad']);
        $precio = floatval($item['precio']);
        $item_subtotal = $cantidad * $precio;
        
        $stmt_item->bind_param(
            'isdddi',
            $cotizacion_id,
            $nombre,
            $cantidad,
            $precio,
            $item_subtotal,
            $index
        );
        
        if (!$stmt_item->execute()) {
            throw new Exception('Error al insertar item: ' . $nombre);
        }
    }
    $stmt_item->close();
    
    // Confirmar transacción
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Cotización actualizada exitosamente',
        'cotizacion_id' => $cotizacion_id
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
