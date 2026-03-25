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
$cliente_id = $_POST['cliente_id'] ?? 0;
$titulo = $_POST['titulo'] ?? '';
$fecha_emision = $_POST['fecha_emision'] ?? date('Y-m-d');
$fecha_vencimiento = $_POST['fecha_vencimiento'] ?? date('Y-m-d', strtotime('+30 days'));
$subtotal = $_POST['subtotal'] ?? 0;
$iva_monto = $_POST['iva_monto'] ?? 0;
$total = $_POST['total'] ?? 0;
$usuario_id = $_SESSION['usuario_id'];

// Validar
if (empty($cliente_id) || empty($titulo)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

// Generar número de cotización
$year = date('Y');
$sql_count = "SELECT COUNT(*) as total FROM cotizaciones WHERE YEAR(created_at) = ?";
$stmt_count = $conn->prepare($sql_count);
$stmt_count->bind_param('i', $year);
$stmt_count->execute();
$result = $stmt_count->get_result();
$row = $result->fetch_assoc();
$numero = str_pad($row['total'] + 1, 4, '0', STR_PAD_LEFT);
$numero_cotizacion = "COT-$year-$numero";
$stmt_count->close();

// Obtener datos del cliente
$sql_cliente = "SELECT nombre, email, telefono, empresa, direccion FROM clientes WHERE id = ?";
$stmt_cliente = $conn->prepare($sql_cliente);
$stmt_cliente->bind_param('i', $cliente_id);
$stmt_cliente->execute();
$result_cliente = $stmt_cliente->get_result();
$cliente = $result_cliente->fetch_assoc();
$stmt_cliente->close();

// Guardar cotización
$sql = "INSERT INTO cotizaciones (numero_cotizacion, titulo, cliente_id, cliente_nombre, cliente_email, 
        cliente_telefono, cliente_empresa, cliente_direccion, fecha_emision, fecha_vencimiento, 
        subtotal, iva_monto, total, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssisssssssdddi', 
    $numero_cotizacion, $titulo, $cliente_id, $cliente['nombre'], $cliente['email'],
    $cliente['telefono'], $cliente['empresa'], $cliente['direccion'], $fecha_emision, 
    $fecha_vencimiento, $subtotal, $iva_monto, $total, $usuario_id
);

if ($stmt->execute()) {
    $cotizacion_id = $conn->insert_id;
    
    // Guardar items de la cotización
    if (isset($_POST['items']) && is_array($_POST['items'])) {
        $sql_item = "INSERT INTO cotizacion_items (cotizacion_id, nombre, cantidad, precio_unitario, subtotal) 
                     VALUES (?, ?, ?, ?, ?)";
        $stmt_item = $conn->prepare($sql_item);
        
        foreach ($_POST['items'] as $item) {
            $nombre = $item['nombre'] ?? '';
            $cantidad = $item['cantidad'] ?? 1;
            $precio = $item['precio'] ?? 0;
            $subtotal_item = $cantidad * $precio;
            
            $stmt_item->bind_param('isddd', $cotizacion_id, $nombre, $cantidad, $precio, $subtotal_item);
            $stmt_item->execute();
        }
        $stmt_item->close();
    }
    
    echo json_encode(['success' => true, 'message' => 'Cotización guardada correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al guardar']);
}

$stmt->close();
$conn->close();
?>
