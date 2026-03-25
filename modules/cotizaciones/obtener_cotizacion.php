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
if (!isset($_GET['id']) || empty($_GET['id'])) {
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

$id = intval($_GET['id']);

// Obtener cotización
$sql = "SELECT 
            c.*,
            cli.nombre as cliente_nombre_actual,
            cli.empresa as cliente_empresa,
            cli.telefono as cliente_telefono_actual,
            cli.direccion as cliente_direccion_actual,
            cli.ciudad as cliente_ciudad
        FROM cotizaciones c
        LEFT JOIN clientes cli ON c.cliente_id = cli.id
        WHERE c.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $cotizacion = $result->fetch_assoc();
    
    // Obtener items de la cotización
    $sql_items = "SELECT * FROM cotizacion_items WHERE cotizacion_id = ? ORDER BY orden, id";
    $stmt_items = $conn->prepare($sql_items);
    $stmt_items->bind_param('i', $id);
    $stmt_items->execute();
    $result_items = $stmt_items->get_result();
    
    $items = [];
    while ($item = $result_items->fetch_assoc()) {
        $items[] = $item;
    }
    
    $cotizacion['items'] = $items;
    
    echo json_encode(['success' => true, 'data' => $cotizacion]);
    $stmt_items->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
}

$stmt->close();
$conn->close();
?>
