<?php
/* ========================================
   DM TECH SOLUTIONS - API DE CLIENTES
   CRUD completo para gestión de clientes
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
            listarClientes($conn);
        } elseif ($action === 'get' && isset($_GET['id'])) {
            obtenerCliente($conn, $_GET['id']);
        } elseif ($action === 'search') {
            buscarClientes($conn, $_GET['q'] ?? '');
        } else {
            listarClientes($conn);
        }
        break;
        
    case 'POST':
        crearCliente($conn);
        break;
        
    case 'PUT':
        parse_str(file_get_contents("php://input"), $putData);
        actualizarCliente($conn, $putData);
        break;
        
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $deleteData);
        eliminarCliente($conn, $deleteData['id'] ?? null);
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
 * Listar todos los clientes del usuario actual
 */
function listarClientes($conn) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        $estado = $_GET['estado'] ?? null;
        
        $sql = "SELECT 
                    c.id,
                    c.nombre,
                    c.empresa,
                    c.tipo_cliente,
                    c.email,
                    c.telefono,
                    c.ciudad,
                    c.estado_depto,
                    c.nit,
                    c.estado,
                    c.created_at,
                    u.nombre AS usuario_nombre,
                    u.apellido AS usuario_apellido
                FROM clientes c
                LEFT JOIN usuario u ON c.usuario_id = u.id
                WHERE 1=1";
        $params = [];
        
        // Filtrar por estado si se proporciona
        if ($estado) {
            $sql .= " AND c.estado = :estado";
            $params[':estado'] = $estado;
        }
        
        $sql .= " ORDER BY c.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $clientes,
            'total' => count($clientes)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al listar clientes: ' . $e->getMessage()]);
    }
}

/**
 * Obtener un cliente específico por ID
 */
function obtenerCliente($conn, $id) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        
        $stmt = $conn->prepare("
            SELECT c.*, 
                   u.nombre AS usuario_nombre, 
                   u.apellido AS usuario_apellido
            FROM clientes c
            LEFT JOIN usuario u ON c.usuario_id = u.id
            WHERE c.id = :id
        ");
        
        $stmt->execute([':id' => $id]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($cliente) {
            echo json_encode(['success' => true, 'data' => $cliente]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cliente no encontrado']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al obtener cliente: ' . $e->getMessage()]);
    }
}

/**
 * Buscar clientes por nombre, empresa, email, teléfono
 */
function buscarClientes($conn, $query) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        $searchTerm = '%' . $query . '%';
        
        $stmt = $conn->prepare("
            SELECT 
                c.id,
                c.nombre,
                c.empresa,
                c.tipo_cliente,
                c.email,
                c.telefono,
                c.ciudad,
                c.estado_depto,
                c.nit,
                c.estado,
                c.created_at,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM clientes c
            LEFT JOIN usuario u ON c.usuario_id = u.id
            WHERE (c.nombre LIKE :search 
               OR c.empresa LIKE :search 
               OR c.email LIKE :search 
               OR c.telefono LIKE :search
               OR c.ciudad LIKE :search)
            ORDER BY c.created_at DESC
        ");
        
        $stmt->execute([':search' => $searchTerm]);
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $clientes,
            'total' => count($clientes),
            'query' => $query
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error en búsqueda: ' . $e->getMessage()]);
    }
}

/**
 * Crear nuevo cliente
 */
function crearCliente($conn) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        
        // Validar campos requeridos
        $nombre = $_POST['nombre'] ?? '';
        $email = $_POST['email'] ?? '';
        $telefono = $_POST['telefono'] ?? '';
        
        if (empty($nombre) || empty($email) || empty($telefono)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos requeridos: nombre, email, teléfono']);
            return;
        }
        
        // Verificar si el email ya existe
        $stmt = $conn->prepare("SELECT id FROM clientes WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ya existe un cliente con ese email']);
            return;
        }
        
        // Insertar cliente
        $sql = "INSERT INTO clientes (
            nombre, empresa, tipo_cliente, email, telefono, telefono_secundario,
            direccion, ciudad, estado_depto, codigo_postal, pais,
            nit, razon_social, sitio_web, notas, estado, usuario_id
        ) VALUES (
            :nombre, :empresa, :tipo_cliente, :email, :telefono, :telefono_secundario,
            :direccion, :ciudad, :estado_depto, :codigo_postal, :pais,
            :nit, :razon_social, :sitio_web, :notas, :estado, :usuario_id
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':empresa' => $_POST['empresa'] ?? null,
            ':tipo_cliente' => $_POST['tipo_cliente'] ?? 'persona',
            ':email' => $email,
            ':telefono' => $telefono,
            ':telefono_secundario' => $_POST['telefono_secundario'] ?? null,
            ':direccion' => $_POST['direccion'] ?? null,
            ':ciudad' => $_POST[
            SELECT 
                c.id,
                c.nombre,
                c.empresa,
                c.tipo_cliente,
                c.email,
                c.telefono,
                c.ciudad,
                c.estado_depto,
                c.nit,
                c.estado,
                c.created_at,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM clientes c
            LEFT JOIN usuario u ON c.usuario_id = u.id
            WHERE c.id = :id
        
            ':estado_depto' => $_POST['estado_depto'] ?? null,
            ':codigo_postal' => $_POST['codigo_postal'] ?? null,
            ':pais' => $_POST['pais'] ?? 'Colombia',
            ':nit' => $_POST['nit'] ?? null,
            ':razon_social' => $_POST['razon_social'] ?? null,
            ':sitio_web' => $_POST['sitio_web'] ?? null,
            ':notas' => $_POST['notas'] ?? null,
            ':estado' => $_POST['estado'] ?? 'activo',
            ':usuario_id' => $usuario_id
        ]);
        
        $clienteId = $conn->lastInsertId();
        
        // Obtener el cliente recién creado
        $stmt = $conn->prepare("SELECT * FROM vista_clientes WHERE id = :id");
        $stmt->execute([':id' => $clienteId]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Cliente creado exitosamente',
            'data' => $cliente
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al crear cliente: ' . $e->getMessage()]);
    }
}

/**
 * Actualizar cliente existente
 */
function actualizarCliente($conn, $data) {
    try {
        $usuario_id = $_SESSION['usuario_id'];
        $id = $data['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cliente requerido']);
            return;
        }
        
        // Verificar que el cliente existe
        $stmt = $conn->prepare("SELECT id FROM clientes WHERE id = :id");
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cliente no encontrado']);
            return;
        }
        
        // Actualizar cliente
        $sql = "UPDATE clientes SET 
            nombre = :nombre,
            empresa = :empresa,
            tipo_cliente = :tipo_cliente,
            email = :email,
            telefono = :telefono,
            telefono_secundario = :telefono_secundario,
            direccion = :direccion,
            ciudad = :ciudad,
            estado_depto = :estado_depto,
            codigo_postal = :codigo_postal,
            pais = :pais,
            nit = :nit,
            razon_social = :razon_social,
            sitio_web = :sitio_web,
            notas = :notas,
            estado = :estado
        WHERE id = :id";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':nombre' => $data['nombre'] ?? '',
            ':empresa' => $data[
            SELECT 
                c.id,
                c.nombre,
                c.empresa,
                c.tipo_cliente,
                c.email,
                c.telefono,
                c.ciudad,
                c.estado_depto,
                c.nit,
                c.estado,
                c.created_at,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM clientes c
            LEFT JOIN usuario u ON c.usuario_id = u.id
            WHERE c.id = :id
        
            ':tipo_cliente' => $data['tipo_cliente'] ?? 'persona',
            ':email' => $data['email'] ?? '',
            ':telefono' => $data['telefono'] ?? '',
            ':telefono_secundario' => $data['telefono_secundario'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
            ':ciudad' => $data['ciudad'] ?? null,
            ':estado_depto' => $data['estado_depto'] ?? null,
            ':codigo_postal' => $data['codigo_postal'] ?? null,
            ':pais' => $data['pais'] ?? 'Colombia',
            ':nit' => $data['nit'] ?? null,
            ':razon_social' => $data['razon_social'] ?? null,
            ':sitio_web' => $data['sitio_web'] ?? null,
            ':notas' => $data['notas'] ?? null,
            ':estado' => $data['estado'] ?? 'activo'
        ]);
        
        // Obtener el cliente actualizado
        $stmt = $conn->prepare("SELECT * FROM vista_clientes WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Cliente actualizado exitosamente',
            'data' => $cliente
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar cliente: ' . $e->getMessage()]);
    }
}

/**
 * Eliminar cliente (soft delete cambiando estado a 'inactivo')
 */
function eliminarCliente($conn, $id) {
    try {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de cliente requerido']);
            return;
        }
        
        // Verificar si el cliente tiene cotizaciones asociadas
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM cotizaciones WHERE cliente_id = :id");
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            // Soft delete: cambiar estado a inactivo
            $stmt = $conn->prepare("UPDATE clientes SET estado = 'inactivo' WHERE id = :id");
            $stmt->execute([':id' => $id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Cliente desactivado (tiene cotizaciones asociadas)',
                'soft_delete' => true
            ]);
        } else {
            // Delete permanente si no tiene cotizaciones
            $stmt = $conn->prepare("DELETE FROM clientes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente',
                'soft_delete' => false
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al eliminar cliente: ' . $e->getMessage()]);
    }
}
?>
