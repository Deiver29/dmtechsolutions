/* ========================================
   DM TECH SOLUTIONS - DASHBOARD JAVASCRIPT
   ======================================== */

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initDashboard();
});

// Verificar si el usuario tiene sesión activa
async function checkSession() {
    try {
        const response = await fetch('check_session.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            // No hay sesión activa, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Actualizar UI con datos del usuario
        updateUserInfo(data.usuario);
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        // En caso de error, redirigir al login
        window.location.href = 'index.html';
    }
}

// Actualizar información del usuario en la UI
function updateUserInfo(usuario) {
    const userName = document.getElementById('userName');
    const welcomeName = document.getElementById('welcomeName');
    
    if (userName && usuario) {
        userName.textContent = usuario.nombre + ' ' + usuario.apellido;
    }
    
    if (welcomeName && usuario) {
        welcomeName.textContent = usuario.nombre;
    }
}

// Inicializar funcionalidades del dashboard
function initDashboard() {
    initNavigation();
    initMobileToggle();
    initModals();
    initForms();
    loadDashboardData();
}

// ========================================
// NAVEGACIÓN
// ========================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const section = item.dataset.section;
            if (section) {
                showSection(section);
                
                // Actualizar nav activo
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Actualizar título de la página
                updatePageTitle(section);
            }
        });
    });
}

// Mostrar sección específica
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById('section-' + sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Actualizar título de la página
function updatePageTitle(section) {
    const titles = {
        dashboard: 'Dashboard',
        clientes: 'Gestión de Clientes',
        cotizaciones: 'Cotizaciones',
        proyectos: 'Proyectos',
        servicios: 'Servicios',
        reportes: 'Reportes y Análisis',
        configuracion: 'Configuración'
    };
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || 'Dashboard';
    }
}

// ========================================
// TOGGLE MÓVIL
// ========================================
function initMobileToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Cerrar sidebar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

// ========================================
// MODALES
// ========================================
function initModals() {
    // Botón nuevo cliente
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    if (btnNuevoCliente) {
        btnNuevoCliente.addEventListener('click', () => {
            openModal('modalCliente');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Limpiar formulario
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Hacer funciones de modal globales
window.openModal = openModal;
window.closeModal = closeModal;
window.showSection = showSection;

// ========================================
// FORMULARIOS
// ========================================
function initForms() {
    // Formulario de cliente
    const formCliente = document.getElementById('formCliente');
    if (formCliente) {
        formCliente.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarCliente(new FormData(formCliente));
        });
    }
}

// Guardar cliente
async function guardarCliente(formData) {
    try {
        // Por ahora, simular guardado (más adelante se conectará con PHP)
        showNotification('Cliente guardado correctamente', 'success');
        closeModal('modalCliente');
        
        // Agregar cliente a la tabla
        agregarClienteATabla({
            id: Math.floor(Math.random() * 1000),
            nombre: formData.get('nombre'),
            empresa: formData.get('empresa'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            estado: 'Activo'
        });
        
        // Actualizar contador
        actualizarContadorClientes();
        
    } catch (error) {
        showNotification('Error al guardar cliente', 'error');
    }
}

// Agregar cliente a la tabla
function agregarClienteATabla(cliente) {
    const tbody = document.getElementById('clientesTableBody');
    if (!tbody) return;
    
    // Si es el primer cliente, limpiar el estado vacío
    if (tbody.querySelector('.empty-state')) {
        tbody.innerHTML = '';
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${cliente.id}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.empresa || '-'}</td>
        <td>${cliente.email}</td>
        <td>${cliente.telefono}</td>
        <td><span class="badge badge-success">${cliente.estado}</span></td>
        <td>
            <button class="btn-icon" onclick="editarCliente(${cliente.id})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="eliminarCliente(${cliente.id})" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// ========================================
// DATOS DEL DASHBOARD
// ========================================
function loadDashboardData() {
    // Aquí se cargarían los datos reales desde la base de datos
    // Por ahora, datos de ejemplo
    const stats = {
        clientes: 0,
        cotizaciones: 0,
        proyectos: 0
    };
    
    updateStats(stats);
}

// Actualizar estadísticas
function updateStats(stats) {
    const statClientes = document.getElementById('statClientes');
    const statCotizaciones = document.getElementById('statCotizaciones');
    const statProyectos = document.getElementById('statProyectos');
    
    if (statClientes) statClientes.textContent = stats.clientes;
    if (statCotizaciones) statCotizaciones.textContent = stats.cotizaciones;
    if (statProyectos) statProyectos.textContent = stats.proyectos;
}

// Actualizar contador de clientes
function actualizarContadorClientes() {
    const tbody = document.getElementById('clientesTableBody');
    const statClientes = document.getElementById('statClientes');
    
    if (tbody && statClientes) {
        const count = tbody.querySelectorAll('tr:not(.empty-state)').length;
        statClientes.textContent = count;
    }
}

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let bgColor;
    switch(type) {
        case 'success':
            bgColor = 'linear-gradient(135deg, #10b981, #059669)';
            break;
        case 'warning':
            bgColor = 'linear-gradient(135deg, #f59e0b, #d97706)';
            break;
        case 'error':
            bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        default:
            bgColor = 'linear-gradient(135deg, #0066FF, #0052CC)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
        font-weight: 600;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Agregar animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .badge-success {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }
    
    .badge-warning {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }
    
    .badge-error {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
`;
document.head.appendChild(style);

// ========================================
// FUNCIONES GLOBALES (para usar en HTML)
// ========================================
window.editarCliente = function(id) {
    showNotification('Función de editar en desarrollo', 'info');
};

window.eliminarCliente = function(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        showNotification('Cliente eliminado', 'success');
        // Aquí iría la lógica para eliminar
    }
};

// Console branding
console.log('%c🖥️ DM TECH SOLUTIONS - DASHBOARD', 'font-size: 20px; font-weight: bold; color: #0066FF;');
console.log('%cPanel de Administración', 'font-size: 14px; color: #00D4B8;');
