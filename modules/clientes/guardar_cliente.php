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

// Conexión
try {
    $conn = getMySQLiConnection();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

// Obtener datos del formulario
$nombre = $_POST['nombre'] ?? '';
$empresa = $_POST['empresa'] ?? '';
$tipo_cliente = $_POST['tipo_cliente'] ?? 'persona';
$telefono = $_POST['telefono'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$ciudad = $_POST['ciudad'] ?? '';
$usuario_id = $_SESSION['usuario_id'];

// Validar campos obligatorios (solo nombre y telefono)
if (empty($nombre) || empty($telefono)) {
    echo json_encode(['success' => false, 'message' => 'Nombre y teléfono son obligatorios']);
    exit;
}

// Guardar cliente
$sql = "INSERT INTO clientes (nombre, empresa, tipo_cliente, telefono, direccion, ciudad, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssssssi', $nombre, $empresa, $tipo_cliente, $telefono, $direccion, $ciudad, $usuario_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Cliente guardado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al guardar']);
}

$stmt->close();
$conn->close();
?>
