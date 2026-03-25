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
        const response = await fetch('modules/auth/check_session.php');
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
        
        // Cargar datos dinámicamente según la sección
        if (sectionName === 'clientes') {
            cargarClientes();
        } else if (sectionName === 'cotizaciones') {
            cargarCotizaciones();
        }
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
    
    // Botón nueva cotización
    const btnNuevaCotizacion = document.getElementById('btnNuevaCotizacion');
    if (btnNuevaCotizacion) {
        btnNuevaCotizacion.addEventListener('click', async () => {
            await abrirModalCotizacion();
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
            
            // Eliminar campo ID si existe (para edición)
            const idField = form.querySelector('#clienteId');
            if (idField) idField.remove();
            
            // Resetear texto del botón
            const submitBtn = modal.querySelector('.btn-primary');
            if (submitBtn && modalId === 'modalCliente') {
                submitBtn.textContent = 'Guardar Cliente';
            }
            
            // Limpiar items de cotización
            if (modalId === 'modalCotizacion') {
                const itemsContainer = document.getElementById('itemsContainer');
                if (itemsContainer) {
                    itemsContainer.innerHTML = '';
                }
                // Resetear totales
                document.getElementById('cotSubtotal').textContent = '$0.00';
                document.getElementById('cotIva').textContent = '$0.00';
                document.getElementById('cotTotal').textContent = '$0.00';
            }
        }
    }
}

// Hacer funciones de modal globales
window.openModal = openModal;
window.closeModal = closeModal;
window.showSection = showSection;
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.verCotizacion = verCotizacion;
window.editarCotizacion = editarCotizacion;
window.eliminarCotizacion = eliminarCotizacion;

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
    
    // Formulario de cotización
    const formCotizacion = document.getElementById('formCotizacion');
    if (formCotizacion) {
        formCotizacion.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarCotizacion();
        });
    }
    
    // Botón agregar item
    const btnAgregarItem = document.getElementById('btnAgregarItem');
    if (btnAgregarItem) {
        btnAgregarItem.addEventListener('click', agregarItemCotizacion);
    }
    
    // Inicializar listeners de items
    initItemListeners();
}

// Guardar cliente
async function guardarCliente(formData) {
    try {
        // Crear nuevo cliente
        const response = await fetch('modules/clientes/guardar_cliente.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Cliente guardado correctamente', 'success');
            closeModal('modalCliente');
            
            // Recargar la lista de clientes
            cargarClientes();
            
            // Limpiar formulario
            document.getElementById('formCliente').reset();
        } else {
            showNotification(data.message || 'Error al guardar cliente', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
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
    
    // Formatear tipo de cliente
    const tipoCliente = cliente.tipo_cliente === 'empresa' ? 
        '<span class="badge badge-primary">Empresa</span>' : 
        '<span class="badge badge-secondary">Persona</span>';
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${cliente.id}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.empresa || '-'}</td>
        <td>${tipoCliente}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.ciudad || '-'}</td>
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

// Cargar lista de clientes desde la API
async function cargarClientes() {
    try {
        const response = await fetch('modules/clientes/listar_clientes.php');
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('clientesTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (data.data.length === 0) {
                tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            <i class="fas fa-users" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                            <p style="color: #64748b; font-size: 16px;">No hay clientes registrados</p>
                            <p style="color: #94a3b8; font-size: 14px;">Agrega tu primer cliente para comenzar</p>
                        </td>
                    </tr>
                `;
            } else {
                data.data.forEach(cliente => {
                    agregarClienteATabla(cliente);
                });
            }
            
            // Actualizar estadísticas
            actualizarContadorClientes();
        }
        
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showNotification('Error al cargar clientes', 'error');
    }
}

// Editar cliente
async function editarCliente(id) {
    try {
        const response = await fetch(`clientes_api.php?action=get&id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            const cliente = data.data;
            
            // Llenar el formulario con los datos del cliente
            document.getElementById('clienteNombre').value = cliente.nombre || '';
            document.getElementById('clienteEmpresa').value = cliente.empresa || '';
            document.getElementById('clienteEmail').value = cliente.email || '';
            document.getElementById('clienteTelefono').value = cliente.telefono || '';
            document.getElementById('clienteDireccion').value = cliente.direccion || '';
            
            // Agregar campo oculto con el ID para actualización
            let inputId = document.getElementById('clienteId');
            if (!inputId) {
                inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.id = 'clienteId';
                inputId.name = 'id';
                document.getElementById('formCliente').appendChild(inputId);
            }
            inputId.value = id;
            
            // Cambiar el texto del botón
            const submitBtn = document.querySelector('#modalCliente .btn-primary');
            if (submitBtn) submitBtn.textContent = 'Actualizar Cliente';
            
            openModal('modalCliente');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al cargar cliente', 'error');
    }
}

// Eliminar cliente
async function eliminarCliente(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        return;
    }
    
    try {
        const response = await fetch('clientes_api.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            cargarClientes();
        } else {
            showNotification(data.message || 'Error al eliminar cliente', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar cliente', 'error');
    }
}

// ========================================
// DATOS DEL DASHBOARD
// ========================================
function loadDashboardData() {
    // Cargar datos reales desde la base de datos
    cargarClientes();
    cargarEstadisticas();
}

// Cargar estadísticas generales
async function cargarEstadisticas() {
    try {
        const [clientesRes, cotizacionesRes] = await Promise.all([
            fetch('clientes_api.php?action=list'),
            fetch('cotizaciones_api.php?action=list').catch(() => ({json: () => ({success: false, data: []})}))
        ]);
        
        const clientesData = await clientesRes.json();
        const cotizacionesData = await cotizacionesRes.json();
        
        const stats = {
            clientes: clientesData.success ? clientesData.total : 0,
            cotizaciones: cotizacionesData.success ? cotizacionesData.total : 0,
            proyectos: 0
        };
        
        updateStats(stats);
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
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
// FUNCIONES DE COTIZACIONES
// ========================================

// Abrir modal de cotización
async function abrirModalCotizacion() {
    try {
        // Cargar clientes en el select
        const response = await fetch('modules/clientes/listar_clientes.php');
        const data = await response.json();
        
        const selectCliente = document.getElementById('cotCliente');
        selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
        
        if (data.success && data.data.length > 0) {
            data.data.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = `${cliente.nombre}${cliente.empresa ? ' - ' + cliente.empresa : ''}`;
                selectCliente.appendChild(option);
            });
        }
        
        // Generar número temporal de cotización
        const year = new Date().getFullYear();
        document.getElementById('cotNumero').value = `COT-${year}-####`;
        
        // Establecer fecha de emisión a hoy
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('cotFechaEmision').value = today;
        
        // Limpiar items y agregar uno por defecto
        const itemsContainer = document.getElementById('itemsContainer');
        itemsContainer.innerHTML = '';
        agregarItemCotizacion();
        
        openModal('modalCotizacion');
        
    } catch (error) {
        console.error('Error al abrir modal:', error);
        showNotification('Error al cargar datos para la cotización', 'error');
    }
}

// Agregar nuevo item a la cotización
function agregarItemCotizacion() {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <div class="form-row">
            <div class="form-group" style="flex: 2;">
                <label>Descripción *</label>
                <input type="text" class="item-nombre" placeholder="Ej: Diseño de sitio web" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Cantidad *</label>
                <input type="number" class="item-cantidad" value="1" min="1" step="0.01" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Precio Unitario *</label>
                <input type="number" class="item-precio" placeholder="0.00" min="0" step="0.01" required>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Subtotal</label>
                <input type="text" class="item-subtotal" readonly style="background-color: #f1f5f9;">
            </div>
            <div class="form-group" style="flex: 0 0 50px;">
                <label>&nbsp;</label>
                <button type="button" class="btn-icon btn-remove-item" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    itemsContainer.appendChild(itemRow);
    initItemListeners();
}

// Inicializar listeners de items
function initItemListeners() {
    // Listeners para cálculos automáticos
    document.querySelectorAll('.item-cantidad, .item-precio').forEach(input => {
        input.removeEventListener('input', calcularSubtotalItem);
        input.addEventListener('input', calcularSubtotalItem);
    });
    
    // Listeners para eliminar items
    document.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.removeEventListener('click', eliminarItemRow);
        btn.addEventListener('click', eliminarItemRow);
    });
}

// Calcular subtotal de un item
function calcularSubtotalItem(e) {
    const itemRow = e.target.closest('.item-row');
    const cantidad = parseFloat(itemRow.querySelector('.item-cantidad').value) || 0;
    const precio = parseFloat(itemRow.querySelector('.item-precio').value) || 0;
    const subtotal = cantidad * precio;
    
    itemRow.querySelector('.item-subtotal').value = formatMoney(subtotal);
    calcularTotalesCotizacion();
}

// Eliminar fila de item
function eliminarItemRow(e) {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    
    // No permitir eliminar si solo hay un item
    if (itemRows.length <= 1) {
        showNotification('Debe haber al menos un item en la cotización', 'warning');
        return;
    }
    
    e.target.closest('.item-row').remove();
    calcularTotalesCotizacion();
}

// Calcular totales de la cotización
function calcularTotalesCotizacion() {
    let subtotal = 0;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const cantidad = parseFloat(row.querySelector('.item-cantidad').value) || 0;
        const precio = parseFloat(row.querySelector('.item-precio').value) || 0;
        subtotal += cantidad * precio;
    });
    
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    document.getElementById('cotSubtotal').textContent = formatMoney(subtotal);
    document.getElementById('cotIva').textContent = formatMoney(iva);
    document.getElementById('cotTotal').textContent = formatMoney(total);
}

// Formatear número como dinero
function formatMoney(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Guardar cotización
async function guardarCotizacion() {
    try {
        // Obtener datos del formulario
        const formData = new FormData(document.getElementById('formCotizacion'));
        
        // Obtener items
        const items = [];
        document.querySelectorAll('.item-row').forEach((row, index) => {
            const cantidad = parseFloat(row.querySelector('.item-cantidad').value);
            const precioUnitario = parseFloat(row.querySelector('.item-precio').value);
            const subtotal = cantidad * precioUnitario;
            
            items.push({
                orden: index,
                nombre: row.querySelector('.item-nombre').value,
                cantidad: cantidad,
                precio_unitario: precioUnitario,
                subtotal: subtotal,
                tipo: 'servicio',
                aplica_iva: 1,
                iva_porcentaje: 19
            });
        });
        
        // Calcular totales
        let subtotal = 0;
        items.forEach(item => subtotal += item.subtotal);
        const ivaTotal = subtotal * 0.19;
        const total = subtotal + ivaTotal;
        
        // Agregar datos calculados
        formData.append('subtotal', subtotal);
        formData.append('iva_monto', ivaTotal);
        formData.append('total', total);
        
        // Agregar items al formData
        items.forEach((item, index) => {
            formData.append(`items[${index}][nombre]`, item.nombre);
            formData.append(`items[${index}][cantidad]`, item.cantidad);
            formData.append(`items[${index}][precio]`, item.precio_unitario);
        });
        
        const response = await fetch('modules/cotizaciones/guardar_cotizacion.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Cotización creada exitosamente', 'success');
            closeModal('modalCotizacion');
            cargarCotizaciones();
            cargarEstadisticas();
        } else {
            showNotification(data.message || 'Error al crear cotización', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar cotización', 'error');
    }
}

// Cargar lista de cotizaciones desde la API
async function cargarCotizaciones() {
    try {
        const response = await fetch('cotizaciones_api.php?action=list');
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('cotizacionesTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (data.data.length === 0) {
                tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            <i class="fas fa-file-invoice-dollar" style="font-size: 48px; color: #cbd5e1; margin-bottom: 16px;"></i>
                            <p style="color: #64748b; font-size: 16px;">No hay cotizaciones registradas</p>
                            <p style="color: #94a3b8; font-size: 14px;">Crea tu primera cotización para tus clientes</p>
                        </td>
                    </tr>
                `;
            } else {
                data.data.forEach(cotizacion => {
                    agregarCotizacionATabla(cotizacion);
                });
            }
            
            // Actualizar estadísticas
            cargarEstadisticas();
        }
        
    } catch (error) {
        console.error('Error cargando cotizaciones:', error);
        showNotification('Error al cargar cotizaciones', 'error');
    }
}

// Agregar cotización a la tabla
function agregarCotizacionATabla(cotizacion) {
    const tbody = document.getElementById('cotizacionesTableBody');
    if (!tbody) return;
    
    // Si es la primera cotización, limpiar el estado vacío
    if (tbody.querySelector('.empty-state')) {
        tbody.innerHTML = '';
    }
    
    // Determinar clase de badge según estado
    let badgeClass = 'badge-secondary';
    switch(cotizacion.estado) {
        case 'borrador':
            badgeClass = 'badge-secondary';
            break;
        case 'enviada':
            badgeClass = 'badge-info';
            break;
        case 'aceptada':
            badgeClass = 'badge-success';
            break;
        case 'rechazada':
            badgeClass = 'badge-danger';
            break;
        case 'vencida':
            badgeClass = 'badge-warning';
            break;
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${cotizacion.numero_cotizacion}</strong></td>
        <td>${cotizacion.cliente_nombre}${cotizacion.cliente_empresa ? '<br><small style="color: #94a3b8;">' + cotizacion.cliente_empresa + '</small>' : ''}</td>
        <td>${cotizacion.titulo}</td>
        <td>${formatDate(cotizacion.fecha_emision)}</td>
        <td><strong>${formatMoney(cotizacion.total)}</strong></td>
        <td><span class="badge ${badgeClass}">${cotizacion.estado}</span></td>
        <td>
            <button class="btn-icon" onclick="verCotizacion(${cotizacion.id})" title="Ver">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="editarCotizacion(${cotizacion.id})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="eliminarCotizacion(${cotizacion.id})" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Funciones placeholder para cotizaciones
function verCotizacion(id) {
    showNotification('Función de vista detallada en desarrollo', 'info');
}

function editarCotizacion(id) {
    showNotification('Función de edición en desarrollo', 'info');
}

async function eliminarCotizacion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
        return;
    }
    
    try {
        const response = await fetch('cotizaciones_api.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            cargarCotizaciones();
        } else {
            showNotification(data.message || 'Error al eliminar cotización', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar cotización', 'error');
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
