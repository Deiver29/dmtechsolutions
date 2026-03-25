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

// Listar cotizaciones
$sql = "SELECT 
            c.id, 
            c.numero_cotizacion, 
            c.titulo,
            c.cliente_nombre,
            c.fecha_emision,
            c.fecha_vencimiento,
            c.total,
            c.estado,
            c.created_at
        FROM cotizaciones c
        ORDER BY c.created_at DESC";
$result = $conn->query($sql);

$cotizaciones = [];
while ($row = $result->fetch_assoc()) {
    $cotizaciones[] = $row;
}

echo json_encode(['success' => true, 'data' => $cotizaciones, 'total' => count($cotizaciones)]);

$conn->close();
?>
