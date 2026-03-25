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

// Validar ID
if (!isset($_POST['id']) || empty($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de cliente no proporcionado']);
    exit;
}

// Conexión
try {
    $conn = getMySQLiConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$id = intval($_POST['id']);

// Eliminar cliente
$sql = "DELETE FROM clientes WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Cliente eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cliente no encontrado']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar cliente']);
}

$stmt->close();
$conn->close();
?>
