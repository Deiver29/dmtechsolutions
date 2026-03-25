<?php
// Iniciar sesión
session_start();

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'dmtech';
$username = 'root';
$password = '';

// Headers para respuesta JSON
header('Content-Type: application/json');

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Conexión a la base de datos
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener datos del formulario
    $correo = filter_input(INPUT_POST, 'correo', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    
    // Validar campos vacíos
    if (empty($correo) || empty($password)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Por favor, completa todos los campos'
        ]);
        exit;
    }
    
    // Validar formato de correo
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Correo electrónico inválido'
        ]);
        exit;
    }
    
    // Buscar usuario en la base de datos
    $stmt = $pdo->prepare("SELECT id, nombre, apellido, correo, password FROM usuario WHERE correo = :correo LIMIT 1");
    $stmt->execute(['correo' => $correo]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar si existe el usuario
    if (!$usuario) {
        echo json_encode([
            'success' => false, 
            'message' => 'Correo o contraseña incorrectos'
        ]);
        exit;
    }
    
    // Verificar contraseña
    // Si la contraseña está hasheada en la BD, usar password_verify
    // Si está en texto plano (no recomendado), comparar directamente
    $passwordValida = false;
    
    // Intentar verificar con hash (recomendado)
    if (password_verify($password, $usuario['password'])) {
        $passwordValida = true;
    } 
    // Si falla, comparar en texto plano (para compatibilidad con datos existentes)
    elseif ($password === $usuario['password']) {
        $passwordValida = true;
        
        // Opcional: Actualizar la contraseña a hash seguro
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE usuario SET password = :password WHERE id = :id");
        $updateStmt->execute([
            'password' => $hashedPassword,
            'id' => $usuario['id']
        ]);
    }
    
    if (!$passwordValida) {
        echo json_encode([
            'success' => false, 
            'message' => 'Correo o contraseña incorrectos'
        ]);
        exit;
    }
    
    // Login exitoso - Crear sesión
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nombre'] = $usuario['nombre'];
    $_SESSION['usuario_apellido'] = $usuario['apellido'];
    $_SESSION['usuario_correo'] = $usuario['correo'];
    $_SESSION['login_time'] = time();
    
    // Actualizar último acceso (opcional)
    $updateStmt = $pdo->prepare("UPDATE usuario SET updated_at = NOW() WHERE id = :id");
    $updateStmt->execute(['id' => $usuario['id']]);
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true, 
        'message' => '¡Bienvenido ' . $usuario['nombre'] . '!',
        'usuario' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'apellido' => $usuario['apellido'],
            'correo' => $usuario['correo']
        ]
    ]);
    
} catch (PDOException $e) {
    // Error de base de datos
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error en el servidor. Por favor, intenta más tarde.'
    ]);
    
    // Log del error (solo para desarrollo)
    error_log("Error de login: " . $e->getMessage());
} catch (Exception $e) {
    // Error general
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error inesperado. Por favor, intenta más tarde.'
    ]);
    
    error_log("Error general de login: " . $e->getMessage());
}
?>
