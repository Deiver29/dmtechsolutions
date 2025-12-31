<?php
// Configuración del correo
$to = "techsolutionsdm00@gmail.com";
$subject = "Nueva Solicitud de Consultoría - DM Tech Solutions";

// Verificar que sea una petición POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitizar datos del formulario
    $nombre = htmlspecialchars(strip_tags(trim($_POST['nombre'])));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $telefono = htmlspecialchars(strip_tags(trim($_POST['telefono'])));
    $empresa = htmlspecialchars(strip_tags(trim($_POST['empresa'])));
    $servicio = htmlspecialchars(strip_tags(trim($_POST['servicio'])));
    $mensaje = htmlspecialchars(strip_tags(trim($_POST['mensaje'])));
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email inválido']);
        exit;
    }
    
    // Validar campos requeridos
    if (empty($nombre) || empty($email) || empty($telefono) || empty($servicio) || empty($mensaje)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Por favor complete todos los campos requeridos']);
        exit;
    }
    
    // Mapear servicios
    $servicios_map = [
        'soporte' => 'Soporte Técnico Empresarial',
        'infraestructura' => 'Infraestructura y Mantenimiento TI',
        'redes' => 'Arquitectura de Redes',
        'desarrollo' => 'Desarrollo de Software',
        'consultoria' => 'Consultoría General'
    ];
    
    $servicio_nombre = isset($servicios_map[$servicio]) ? $servicios_map[$servicio] : $servicio;
    
    // Crear el cuerpo del email en HTML
    $email_body = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #0066FF, #0052CC);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .field {
                margin-bottom: 20px;
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #0066FF;
            }
            .field-label {
                font-weight: bold;
                color: #0066FF;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            .field-value {
                color: #333;
                font-size: 15px;
            }
            .mensaje-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #00C9A7;
                margin-top: 20px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🖥️ Nueva Solicitud de Consultoría</h1>
                <p>DM Tech Solutions</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='field-label'>Nombre Completo</div>
                    <div class='field-value'>{$nombre}</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Email</div>
                    <div class='field-value'>{$email}</div>
                </div>
                
                <div class='field'>
                    <div class='field-label'>Teléfono</div>
                    <div class='field-value'>{$telefono}</div>
                </div>
                
                " . (!empty($empresa) ? "
                <div class='field'>
                    <div class='field-label'>Empresa</div>
                    <div class='field-value'>{$empresa}</div>
                </div>
                " : "") . "
                
                <div class='field'>
                    <div class='field-label'>Servicio de Interés</div>
                    <div class='field-value'>{$servicio_nombre}</div>
                </div>
                
                <div class='mensaje-box'>
                    <div class='field-label'>Mensaje / Requerimiento</div>
                    <div class='field-value'>" . nl2br($mensaje) . "</div>
                </div>
                
                <div style='margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;'>
                    <p style='margin: 0; font-size: 13px; color: #0066FF;'>
                        <strong>📅 Fecha:</strong> " . date('d/m/Y H:i:s') . "<br>
                        <strong>🌐 IP:</strong> " . $_SERVER['REMOTE_ADDR'] . "
                    </p>
                </div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de dmtechsolutions.com</p>
                <p>© 2025 DM Tech Solutions - Tecnología Empresarial de Vanguardia</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Headers del email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: DM Tech Solutions <noreply@dmtechsolutions.com>" . "\r\n";
    $headers .= "Reply-To: {$email}" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Enviar email
    if (mail($to, $subject, $email_body, $headers)) {
        // Email enviado exitosamente
        http_response_code(200);
        echo json_encode([
            'success' => true, 
            'message' => 'Solicitud enviada exitosamente. Nos pondremos en contacto pronto.'
        ]);
    } else {
        // Error al enviar email
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al enviar el mensaje. Por favor intente nuevamente o contáctenos por WhatsApp.'
        ]);
    }
    
} else {
    // Método no permitido
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Método no permitido'
    ]);
}
?>
