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

// Obtener datos del formulario
$id = intval($_POST['id']);
$nombre = $_POST['nombre'] ?? '';
$empresa = $_POST['empresa'] ?? '';
$tipo_cliente = $_POST['tipo_cliente'] ?? 'persona';
$telefono = $_POST['telefono'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$ciudad = $_POST['ciudad'] ?? '';

// Validar campos obligatorios
if (empty($nombre) || empty($telefono)) {
    echo json_encode(['success' => false, 'message' => 'Nombre y teléfono son obligatorios']);
    exit;
}

// Actualizar cliente
$sql = "UPDATE clientes 
        SET nombre = ?, empresa = ?, tipo_cliente = ?, telefono = ?, direccion = ?, ciudad = ?
        WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssssssi', $nombre, $empresa, $tipo_cliente, $telefono, $direccion, $ciudad, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Cliente actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar cliente']);
}

$stmt->close();
$conn->close();
?>
