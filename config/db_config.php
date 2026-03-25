<?php
/* ========================================
   DM TECH SOLUTIONS - CONFIGURACIÓN DE BASE DE DATOS
   Configuración centralizada para conexión MySQL
   ======================================== */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'dmtech');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Obtener conexión PDO
 * @return PDO
 */
function getPDOConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        throw new Exception('Error de conexión: ' . $e->getMessage());
    }
}

/**
 * Obtener conexión MySQLi
 * @return mysqli
 */
function getMySQLiConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Error de conexión: ' . $conn->connect_error);
    }
    
    $conn->set_charset(DB_CHARSET);
    return $conn;
}
?>
