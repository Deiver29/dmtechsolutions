<?php
/* ========================================
   DM TECH SOLUTIONS - API DE COTIZACIONES
   CRUD completo para gestión de cotizaciones
   ======================================== */

session_start();
header('Content-Type: application/json; charset=utf-8');

// Verificar que el usuario tenga sesión activa
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Conexión a la base de datos
try {
    $conn = new PDO('mysql:host=localhost;dbname=dmtech;charset=utf8mb4', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// Obtener método HTTP y acción
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Enrutador de acciones
switch ($method) {
    case 'GET':
        if ($action === 'list') {
            listarCotizaciones($conn);
        } elseif ($action === 'get' && isset($_GET['id'])) {
            obtenerCotizacion($conn, $_GET['id']);
        } elseif ($action === 'get_with_items' && isset($_GET['id'])) {
            obtenerCotizacionConItems($conn, $_GET['id']);
        } elseif ($action === 'search') {
            buscarCotizaciones($conn, $_GET['q'] ?? '');
        } elseif ($action === 'next_number') {
            obtenerSiguienteNumeroCotizacion($conn);
        } else {
            listarCotizaciones($conn);
        }
        break;
        
    case 'POST':
        if ($action === 'add_item') {
            agregarItemCotizacion($conn);
        } else {
            crearCotizacion($conn);
        }
        break;
        
    case 'PUT':
        parse_str(file_get_contents("php://input"), $putData);
        if ($action === 'update_estado') {
            actualizarEstadoCotizacion($conn, $putData);
        } else {
            actualizarCotizacion($conn, $putData);
        }
        break;
        
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $deleteData);
        if ($action === 'delete_item') {
            eliminarItemCotizacion($conn, $deleteData['item_id'] ?? null);
        } else {
            eliminarCotizacion($conn, $deleteData['id'] ?? null);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        break;
}

// ========================================
// FUNCIONES DEL API
// ========================================

/**
 * Listar todas las cotizaciones del usuario actual
 */
function listarCotizaciones($conn) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        $estado = $_GET['estado'] ?? null;
        
        $sql = "SELECT 
                    cot.id,
                    cot.numero_cotizacion,
                    cot.titulo,
                    cot.cliente_nombre,
                    cot.cliente_empresa,
                    cot.fecha_emision,
                    cot.fecha_vencimiento,
                    cot.subtotal,
                    cot.iva_monto,
                    cot.total,
                    cot.estado,
                    cot.created_at,
                    c.id AS cliente_id,
                    c.email AS cliente_email,
                    c.telefono AS cliente_telefono,
                    u.nombre AS usuario_nombre,
                    u.apellido AS usuario_apellido
                FROM cotizaciones cot
                LEFT JOIN clientes c ON cot.cliente_id = c.id
                LEFT JOIN usuario u ON cot.usuario_id = u.id
                WHERE 1=1";
        $params = [];
        
        // Filtrar por estado si se proporciona
        if ($estado) {
            $sql .= " AND cot.estado = :estado";
            $params[':estado'] = $estado;
        }
        
        $sql .= " ORDER BY cot.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $cotizaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $cotizaciones,
            'total' => count($cotizaciones)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al listar cotizaciones: ' . $e->getMessage()]);
    }
}

/**
 * Obtener una cotización específica por ID (sin items)
 */
function obtenerCotizacion($conn, $id) {
    try {
        $stmt = $conn->prepare("
            SELECT 
                cot.id,
                cot.numero_cotizacion,
                cot.titulo,
                cot.cliente_nombre,
                cot.cliente_empresa,
                cot.fecha_emision,
                cot.fecha_vencimiento,
                cot.subtotal,
                cot.iva_monto,
                cot.total,
                cot.estado,
                cot.created_at,
                c.id AS cliente_id,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM cotizaciones cot
            LEFT JOIN clientes c ON cot.cliente_id = c.id
            LEFT JOIN usuario u ON cot.usuario_id = u.id
            WHERE cot.id = :id
        ");
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($cotizacion) {
            echo json_encode(['success' => true, 'data' => $cotizacion]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener cotización: ' . $e->getMessage()]);
    }
}

/**
 * Obtener una cotización con todos sus items
 */
function obtenerCotizacionConItems($conn, $id) {
    try {
        // Obtener cotización
        $stmt = $conn->prepare("SELECT * FROM cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cotizacion) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
            return;
        }
        
        // Obtener items
        $stmt = $conn->prepare("SELECT * FROM cotizacion_items WHERE cotizacion_id = :id ORDER BY orden ASC");
        $stmt->execute([':id' => $id]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $cotizacion['items'] = $items;
        
        echo json_encode(['success' => true, 'data' => $cotizacion]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener cotización: ' . $e->getMessage()]);
    }
}

/**
 * Buscar cotizaciones
 */
function buscarCotizaciones($conn, $query) {
    try {
        $searchTerm = '%' . $query . '%';
        
        $stmt = $conn->prepare("
            SELECT 
                cot.id,
                cot.numero_cotizacion,
                cot.titulo,
                cot.cliente_nombre,
                cot.cliente_empresa,
                cot.fecha_emision,
                cot.fecha_vencimiento,
                cot.subtotal,
                cot.iva_monto,
                cot.total,
                cot.estado,
                cot.created_at,
                c.id AS cliente_id,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM cotizaciones cot
            LEFT JOIN clientes c ON cot.cliente_id = c.id
            LEFT JOIN usuario u ON cot.usuario_id = u.id
            WHERE (cot.numero_cotizacion LIKE :search 
               OR cot.titulo LIKE :search 
               OR cot.cliente_nombre LIKE :search 
               OR cot.cliente_empresa LIKE :search)
            ORDER BY cot.created_at DESC
        ");
        
        $stmt->execute([':search' => $searchTerm]);
        $cotizaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $cotizaciones,
            'total' => count($cotizaciones),
            'query' => $query
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error en búsqueda: ' . $e->getMessage()]);
    }
}

/**
 * Generar el siguiente número de cotización
 */
function obtenerSiguienteNumeroCotizacion($conn) {
    try {
        $year = date('Y');
        $prefix = 'COT-' . $year . '-';
        
        $stmt = $conn->prepare("
            SELECT numero_cotizacion 
            FROM cotizaciones 
            WHERE numero_cotizacion LIKE :prefix 
            ORDER BY id DESC 
            LIMIT 1
        ");
        
        $stmt->execute([':prefix' => $prefix . '%']);
        $lastCotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($lastCotizacion) {
            // Extraer el número y sumar 1
            $parts = explode('-', $lastCotizacion['numero_cotizacion']);
            $lastNumber = intval(end($parts));
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        $numeroCotizacion = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        
        echo json_encode([
            'success' => true,
            'numero_cotizacion' => $numeroCotizacion
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al generar número: ' . $e->getMessage()]);
    }
}

/**
 * Crear nueva cotización con items
 */
function crearCotizacion($conn) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        
        // Validar campos requeridos
        $cliente_id = $_POST['cliente_id'] ?? null;
        $titulo = $_POST['titulo'] ?? '';
        $fecha_emision = $_POST['fecha_emision'] ?? date('Y-m-d');
        
        if (empty($cliente_id) || empty($titulo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos requeridos: cliente_id, titulo']);
            return;
        }
        
        // Obtener datos del cliente
        $stmt = $conn->prepare("SELECT * FROM clientes WHERE id = :id");
        $stmt->execute([':id' => $cliente_id]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cliente) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cliente no encontrado']);
            return;
        }
        
        // Generar número de cotización si no se proporciona
        $numero_cotizacion = $_POST['numero_cotizacion'] ?? null;
        if (empty($numero_cotizacion)) {
            $year = date('Y');
            $prefix = 'COT-' . $year . '-';
            
            $stmt = $conn->prepare("
                SELECT numero_cotizacion 
                FROM cotizaciones 
                WHERE numero_cotizacion LIKE :prefix 
                ORDER BY id DESC 
                LIMIT 1
            ");
            
            $stmt->execute([':prefix' => $prefix . '%']);
            $lastCotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($lastCotizacion) {
                $parts = explode('-', $lastCotizacion['numero_cotizacion']);
                $lastNumber = intval(end($parts));
                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }
            
            $numero_cotizacion = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }
        
        // Calcular fecha de vencimiento
        $validez_dias = $_POST['validez_dias'] ?? 30;
        $fecha_vencimiento = date('Y-m-d', strtotime($fecha_emision . ' + ' . $validez_dias . ' days'));
        
        // Iniciar transacción
        $conn->beginTransaction();
        
        // Insertar cotización
        $sql = "INSERT INTO cotizaciones (
            numero_cotizacion, titulo, descripcion, cliente_id, 
            cliente_nombre, cliente_email, cliente_telefono, cliente_empresa, cliente_direccion,
            fecha_emision, fecha_vencimiento, validez_dias,
            subtotal, descuento_porcentaje, descuento_monto, 
            iva_porcentaje, iva_monto, total,
            condiciones_pago, tiempo_entrega, notas, terminos_condiciones,
            estado, usuario_id
        ) VALUES (
            :numero_cotizacion, :titulo, :descripcion, :cliente_id,
            :cliente_nombre, :cliente_email, :cliente_telefono, :cliente_empresa, :cliente_direccion,
            :fecha_emision, :fecha_vencimiento, :validez_dias,
            :subtotal, :descuento_porcentaje, :descuento_monto,
            :iva_porcentaje, :iva_monto, :total,
            :condiciones_pago, :tiempo_entrega, :notas, :terminos_condiciones,
            :estado, :usuario_id
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':numero_cotizacion' => $numero_cotizacion,
            ':titulo' => $titulo,
            ':descripcion' => $_POST['descripcion'] ?? null,
            ':cliente_id' => $cliente_id,
            ':cliente_nombre' => $cliente['nombre'],
            ':cliente_email' => $cliente['email'],
            ':cliente_telefono' => $cliente['telefono'],
            ':cliente_empresa' => $cliente['empresa'],
            ':cliente_direccion' => $cliente['direccion'],
            ':fecha_emision' => $fecha_emision,
            ':fecha_vencimiento' => $fecha_vencimiento,
            ':validez_dias' => $validez_dias,
            ':subtotal' => $_POST['subtotal'] ?? 0,
            ':descuento_porcentaje' => $_POST['descuento_porcentaje'] ?? 0,
            ':descuento_monto' => $_POST['descuento_monto'] ?? 0,
            ':iva_porcentaje' => $_POST['iva_porcentaje'] ?? 19,
            ':iva_monto' => $_POST['iva_monto'] ?? 0,
            ':total' => $_POST['total'] ?? 0,
            ':condiciones_pago' => $_POST['condiciones_pago'] ?? null,
            ':tiempo_entrega' => $_POST['tiempo_entrega'] ?? null,
            ':notas' => $_POST['notas'] ?? null,
            ':terminos_condiciones' => $_POST['terminos_condiciones'] ?? null,
            ':estado' => $_POST['estado'] ?? 'borrador',
            ':usuario_id' => $usuario_id
        ]);
        
        $cotizacionId = $conn->lastInsertId();
        
        // Insertar items si se proporcionan
        $items = [];
        if (isset($_POST['items'])) {
            // Decodificar si es JSON string
            if (is_string($_POST['items'])) {
                $items = json_decode($_POST['items'], true);
            } else {
                $items = $_POST['items'];
            }
        }
        
        if (!empty($items) && is_array($items)) {
            foreach ($items as $index => $item) {
                $sqlItem = "INSERT INTO cotizacion_items (
                    cotizacion_id, orden, tipo, codigo, nombre, descripcion,
                    cantidad, unidad, precio_unitario, 
                    descuento_porcentaje, descuento_monto, subtotal,
                    aplica_iva, iva_porcentaje
                ) VALUES (
                    :cotizacion_id, :orden, :tipo, :codigo, :nombre, :descripcion,
                    :cantidad, :unidad, :precio_unitario,
                    :descuento_porcentaje, :descuento_monto, :subtotal,
                    :aplica_iva, :iva_porcentaje
                )";
                
                $stmtItem = $conn->prepare($sqlItem);
                $stmtItem->execute([
                    ':cotizacion_id' => $cotizacionId,
                    ':orden' => 
            SELECT 
                cot.id,
                cot.numero_cotizacion,
                cot.titulo,
                cot.cliente_nombre,
                cot.cliente_empresa,
                cot.fecha_emision,
                cot.fecha_vencimiento,
                cot.subtotal,
                cot.iva_monto,
                cot.total,
                cot.estado,
                cot.created_at,
                c.id AS cliente_id,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM cotizaciones cot
            LEFT JOIN clientes c ON cot.cliente_id = c.id
            LEFT JOIN usuario u ON cot.usuario_id = u.id
            WHERE cot.id = :id
        
                    ':tipo' => $item['tipo'] ?? 'servicio',
                    ':codigo' => $item['codigo'] ?? null,
                    ':nombre' => $item['nombre'],
                    ':descripcion' => $item['descripcion'] ?? null,
                    ':cantidad' => $item['cantidad'] ?? 1,
                    ':unidad' => $item['unidad'] ?? 'unidad',
                    ':precio_unitario' => $item['precio_unitario'],
                    ':descuento_porcentaje' => $item['descuento_porcentaje'] ?? 0,
                    ':descuento_monto' => $item['descuento_monto'] ?? 0,
                    ':subtotal' => $item['subtotal'],
                    ':aplica_iva' => $item['aplica_iva'] ?? 1,
                    ':iva_porcentaje' => $item['iva_porcentaje'] ?? 19
                ]);
            }
        }
        
        $conn->commit();
        
        // Obtener la cotización completa recién creada
        $stmt = $conn->prepare("SELECT * FROM vista_cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $cotizacionId]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Cotización creada exitosamente',
            'data' => $cotizacion
        ]);
        
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al crear cotización: ' . $e->getMessage()]);
    }
}

/**
 * Actualizar cotización existente
 */
function actualizarCotizacion($conn, $data) {
    try {
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cotización requerido']);
            return;
        }
        
        // Verificar que la cotización existe
        $stmt = $conn->prepare("SELECT id FROM cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
            return;
        }
        
        // Actualizar cotización
        $sql = "UPDATE cotizaciones SET 
            titulo = :titulo,
            descripcion = :descripcion,
            fecha_emision = :fecha_emision,
            fecha_vencimiento = :fecha_vencimiento,
            subtotal = :subtotal,
            descuento_porcentaje = :descuento_porcentaje,
            descuento_monto = :descuento_monto,
            iva_porcentaje = :iva_porcentaje,
            iva_monto = :iva_monto,
            total = :total,
            condiciones_pago = :condiciones_pago,
            tiempo_entrega = :tiempo_entrega,
            validez_dias = :validez_dias,
            notas = :notas,
            terminos_condiciones = :terminos_condiciones
        WHERE id = :id";
            SELECT 
                cot.id,
                cot.numero_cotizacion,
                cot.titulo,
                cot.cliente_nombre,
                cot.cliente_empresa,
                cot.fecha_emision,
                cot.fecha_vencimiento,
                cot.subtotal,
                cot.iva_monto,
                cot.total,
                cot.estado,
                cot.created_at,
                c.id AS cliente_id,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM cotizaciones cot
            LEFT JOIN clientes c ON cot.cliente_id = c.id
            LEFT JOIN usuario u ON cot.usuario_id = u.id
            WHERE cot.id = :id
        
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':titulo' => $data['titulo'] ?? '',
            ':descripcion' => $data['descripcion'] ?? null,
            ':fecha_emision' => $data['fecha_emision'] ?? date('Y-m-d'),
            ':fecha_vencimiento' => $data['fecha_vencimiento'] ?? date('Y-m-d', strtotime('+30 days')),
            ':subtotal' => $data['subtotal'] ?? 0,
            ':descuento_porcentaje' => $data['descuento_porcentaje'] ?? 0,
            ':descuento_monto' => $data['descuento_monto'] ?? 0,
            ':iva_porcentaje' => $data['iva_porcentaje'] ?? 19,
            ':iva_monto' => $data['iva_monto'] ?? 0,
            ':total' => $data['total'] ?? 0,
            ':condiciones_pago' => $data['condiciones_pago'] ?? null,
            ':tiempo_entrega' => $data['tiempo_entrega'] ?? null,
            ':validez_dias' => $data['validez_dias'] ?? 30,
            ':notas' => $data['notas'] ?? null,
            ':terminos_condiciones' => $data['terminos_condiciones'] ?? null
        ]);
        
        // Obtener la cotización actualizada
        $stmt = $conn->prepare("SELECT * FROM vista_cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Cotización actualizada exitosamente',
            'data' => $cotizacion
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar cotización: ' . $e->getMessage()]);
    }
}

/**
 * Actualizar solo el estado de la cotización
 */
function actualizarEstadoCotizacion($conn, $data) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        $id = $data['id'] ?? null;
        $estadoNuevo = $data['estado'] ?? null;
        
        if (!$id || !$estadoNuevo) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID y estado requeridos']);
            return;
        }
        
        // Obtener estado actual
        $stmt = $conn->prepare("SELECT estado FROM cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cotizacion) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
            return;
        }
        
        $estadoAnterior = $cotizacion['estado'];
        
        // Iniciar transacción
        $conn->beginTransaction();
        
        // Actualizar estado
        $stmt = $conn->prepare("UPDATE cotizaciones SET estado = :estado WHERE id = :id");
        $stmt->execute([':id' => $id, ':estado' => $estadoNuevo]);
        
        // Registrar en historial
        $stmt = $conn->prepare("
            INSERT INTO historial_cotizaciones (cotizacion_id, estado_anterior, estado_nuevo, comentario, usuario_id)
            VALUES (:cotizacion_id, :estado_anterior, :estado_nuevo, :comentario, :usuario_id)
        ");
        $stmt->execute([
            ':cotizacion_id' => $id,
            ':estado_anterior' => $estadoAnterior,
            ':estado_nuevo' => $estadoNuevo,
            ':comentario' => $data['comentario'] ?? null,
            ':usuario_id' => $usuario_id
        ]);
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo
        ]);
        
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar estado: ' . $e->getMessage()]);
    }
}

/**
 * Agregar item a una cotización existente
 */
function agregarItemCotizacion($conn) {
    try {
        $cotizacion_id = $_POST['cotizacion_id'] ?? null;
        
        if (!$cotizacion_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cotización requerido']);
            return;
        }
        
        $sql = "INSERT INTO cotizacion_items (
            cotizacion_id, orden, tipo, codigo, nombre, descripcion,
            cantidad, unidad, precio_unitario, 
            descuento_porcentaje, descuento_monto, subtotal,
            aplica_iva, iva_porcentaje
        ) VALUES (
            :cotizacion_id, :orden, :tipo, :codigo, :nombre, :descripcion,
            :cantidad, :unidad, :precio_unitario,
            :descuento_porcentaje, :descuento_monto, :subtotal,
            :aplica_iva, :iva_porcentaje
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':cotizacion_id' => $cotizacion_id,
            ':orden' => $_POST['orden'] ?? 0,
            ':tipo' => $_POST['tipo'] ?? 'servicio',
            ':codigo' => $_POST['codigo'] ?? null,
            ':nombre' => $_POST['nombre'] ?? '',
            ':descripcion' => $_POST['descripcion'] ?? null,
            ':cantidad' => $_POST['cantidad'] ?? 1,
            ':unidad' => $_POST['unidad'] ?? 'unidad',
            ':precio_unitario' => $_POST['precio_unitario'] ?? 0,
            ':descuento_porcentaje' => $_POST['descuento_porcentaje'] ?? 0,
            ':descuento_monto' => $_POST['descuento_monto'] ?? 0,
            ':subtotal' => $_POST['subtotal'] ?? 0,
            ':aplica_iva' => $_POST['aplica_iva'] ?? 1,
            ':iva_porcentaje' => $_POST['iva_porcentaje'] ?? 19
        ]);
        
        $itemId = $conn->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Item agregado exitosamente',
            'item_id' => $itemId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al agregar item: ' . $e->getMessage()]);
    }
}

/**
 * Eliminar item de cotización
 */
function eliminarItemCotizacion($conn, $itemId) {
    try {
        if (!$itemId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de item requerido']);
            return;
        }
        
        $stmt = $conn->prepare("DELETE FROM cotizacion_items WHERE id = :id");
        $stmt->execute([':id' => $itemId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Item eliminado exitosamente'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al eliminar item: ' . $e->getMessage()]);
    }
}

/**
 * Eliminar cotización completa
 */
function eliminarCotizacion($conn, $id) {
    try {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cotización requerido']);
            return;
        }
        
        // Verificar estado antes de eliminar
        $stmt = $conn->prepare("SELECT estado FROM cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cotizacion) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cotización no encontrada']);
            return;
        }
        
        // Solo permitir eliminar borradores y rechazadas
        if (!in_array($cotizacion['estado'], ['borrador', 'rechazada'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Solo se pueden eliminar cotizaciones en borrador o rechazadas']);
            return;
        }
        
        // Eliminar cotización (los items se eliminan automáticamente por CASCADE)
        $stmt = $conn->prepare("DELETE FROM cotizaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Cotización eliminada exitosamente'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al eliminar cotización: ' . $e->getMessage()]);
    }
}
?>
