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
    echo json_encode(['success' => false, 'message' => 'ID de cotización no proporcionado']);
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

// Eliminar cotización (en cascada eliminará los items por FOREIGN KEY)
$sql = "DELETE FROM cotizaciones WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Cotización eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar cotización']);
}

$stmt->close();
$conn->close();
?>
