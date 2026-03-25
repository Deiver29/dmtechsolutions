<?php
// check_session.php - Verificar si el usuario tiene sesión activa
session_start();

header('Content-Type: application/json');

// Verificar si el usuario está logueado
if (isset($_SESSION['usuario_id']) && isset($_SESSION['usuario_nombre'])) {
    echo json_encode([
        'logged_in' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['usuario_nombre'],
            'apellido' => $_SESSION['usuario_apellido'],
            'correo' => $_SESSION['usuario_correo']
        ]
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?>
