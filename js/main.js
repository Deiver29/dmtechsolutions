/* ========================================
   DM TECH SOLUTIONS - MAIN JAVASCRIPT
   ======================================== */

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect - Mejorado
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(10, 25, 41, 0.12)';
        header.style.padding = '12px 0';
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.96)';
    } else {
        header.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.05)';
        header.style.padding = '16px 0';
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
    }
    
    lastScroll = currentScroll;
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .feature, .mv-card, .contact-method');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Stats counter animation
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.textContent.includes('+')) {
            element.textContent = Math.floor(current) + '+';
        } else if (element.textContent.includes('%')) {
            element.textContent = current.toFixed(1) + '%';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

// Observe stats section
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                let value = 0;
                
                if (text.includes('500+')) {
                    value = 500;
                    stat.textContent = '0+';
                    animateCounter(stat, value);
                } else if (text.includes('24/7')) {
                    stat.textContent = '24/7';
                } else if (text.includes('99.9%')) {
                    value = 99.9;
                    stat.textContent = '0%';
                    animateCounter(stat, value);
                }
            });
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
});

// Form validation and submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const empresa = document.getElementById('empresa').value;
        const servicio = document.getElementById('servicio').value;
        const mensaje = document.getElementById('mensaje').value;
        
        // Deshabilitar botón de envío
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        try {
            // Enviar formulario por email
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('email', email);
            formData.append('telefono', telefono);
            formData.append('empresa', empresa);
            formData.append('servicio', servicio);
            formData.append('mensaje', mensaje);
            
            const response = await fetch('enviar_formulario.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Email enviado exitosamente
                showNotification('✅ Solicitud enviada exitosamente por email', 'success');
                
                // Esperar 2 segundos y luego abrir WhatsApp
                setTimeout(() => {
                    // Crear mensaje para WhatsApp
                    const serviciosMap = {
                        'soporte': 'Soporte Técnico',
                        'infraestructura': 'Infraestructura TI',
                        'redes': 'Arquitectura de Redes',
                        'desarrollo': 'Desarrollo de Software',
                        'consultoria': 'Consultoría General'
                    };
                    
                    const servicioNombre = serviciosMap[servicio] || servicio;
                    
                    const whatsappMsg = `*Solicitud de Consultoría - DM Tech Solutions*

*Nombre:* ${nombre}
*Email:* ${email}
*Teléfono:* ${telefono}
${empresa ? `*Empresa:* ${empresa}\n` : ''}*Servicio:* ${servicioNombre}

*Mensaje:*
${mensaje}`;
                    
                    const encodedMsg = encodeURIComponent(whatsappMsg);
                    const whatsappNumber = '573113601362';
                    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
                    
                    // Abrir WhatsApp
                    window.open(whatsappURL, '_blank');
                    
                    showNotification('📱 Abriendo WhatsApp...', 'info');
                }, 2000);
                
                // Limpiar formulario
                contactForm.reset();
                
            } else {
                // Error al enviar email - ofrecer WhatsApp como alternativa
                showNotification('⚠️ ' + result.message, 'warning');
                
                // Aún así ofrecer WhatsApp
                setTimeout(() => {
                    const serviciosMap = {
                        'soporte': 'Soporte Técnico',
                        'infraestructura': 'Infraestructura TI',
                        'redes': 'Arquitectura de Redes',
                        'desarrollo': 'Desarrollo de Software',
                        'consultoria': 'Consultoría General'
                    };
                    
                    const servicioNombre = serviciosMap[servicio] || servicio;
                    
                    const whatsappMsg = `*Solicitud de Consultoría - DM Tech Solutions*

*Nombre:* ${nombre}
*Email:* ${email}
*Teléfono:* ${telefono}
${empresa ? `*Empresa:* ${empresa}\n` : ''}*Servicio:* ${servicioNombre}

*Mensaje:*
${mensaje}`;
                    
                    const encodedMsg = encodeURIComponent(whatsappMsg);
                    const whatsappNumber = '573113601362';
                    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
                    
                    window.open(whatsappURL, '_blank');
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('❌ Error al enviar. Redirigiendo a WhatsApp...', 'error');
            
            // Si hay error, usar WhatsApp como respaldo
            setTimeout(() => {
                const serviciosMap = {
                    'soporte': 'Soporte Técnico',
                    'infraestructura': 'Infraestructura TI',
                    'redes': 'Arquitectura de Redes',
                    'desarrollo': 'Desarrollo de Software',
                    'consultoria': 'Consultoría General'
                };
                
                const servicioNombre = serviciosMap[servicio] || servicio;
                
                const whatsappMsg = `*Solicitud de Consultoría - DM Tech Solutions*

*Nombre:* ${nombre}
*Email:* ${email}
*Teléfono:* ${telefono}
${empresa ? `*Empresa:* ${empresa}\n` : ''}*Servicio:* ${servicioNombre}

*Mensaje:*
${mensaje}`;
                
                const encodedMsg = encodeURIComponent(whatsappMsg);
                const whatsappNumber = '573113601362';
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
                
                window.open(whatsappURL, '_blank');
            }, 1500);
        } finally {
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Notification system
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
        z-index: 10000;
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

// Add notification animations
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
    
    .nav a.active {
        color: var(--primary-color);
    }
    
    .nav a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const techBackground = document.querySelector('.tech-background');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 1.5;
    }
    
    if (techBackground && scrolled < window.innerHeight) {
        techBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Service card hover effect with tilt - Mejorado
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Parallax effect para hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
});

// Efecto de typing en el hero title (sutil)
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-main');
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        setTimeout(() => {
            heroTitle.style.transition = 'opacity 1.2s ease-out';
            heroTitle.style.opacity = '1';
        }, 300);
    }
});

// Ripple effect en botones
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Lazy loading mejorado para imágenes
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Smooth reveal para secciones
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    revealObserver.observe(section);
});

// Agregar clase revealed cuando sea visible
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    section.revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Console branding - Actualizado
console.log('%c🖥️ DM TECH SOLUTIONS', 'font-size: 24px; font-weight: bold; color: #0066FF;');
console.log('%cTecnología Empresarial de Vanguardia', 'font-size: 14px; color: #00D4B8;');
console.log('%cVersión: 2.5.0 Enterprise Edition', 'font-size: 12px; color: #5D6F80;');
console.log('%cFecha: 31 de diciembre de 2025', 'font-size: 12px; color: #5D6F80;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0066FF;');
console.log('%cOptimizado para performance y experiencia de usuario', 'font-size: 11px; color: #8E9FB0;');
console.log('%c¿Buscas talento técnico? Contáctanos!', 'font-size: 14px; font-weight: bold; color: #00C9A7;');

/* ========================================
   SISTEMA DE LOGIN
   ======================================== */

// Referencias del DOM para el modal de login
const btnLogin = document.getElementById('btnLogin');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

// Abrir modal de login
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    });
}

// Cerrar modal
if (closeModal) {
    closeModal.addEventListener('click', closeLoginModal);
}

// Cerrar modal al hacer clic fuera del contenido
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
        closeLoginModal();
    }
});

// Función para cerrar el modal
function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
    
    // Limpiar formulario y mensaje después de la animación
    setTimeout(() => {
        if (loginForm) loginForm.reset();
        hideLoginMessage();
    }, 300);
}

// Función para mostrar mensajes en el modal
function showLoginMessage(message, type = 'error') {
    if (loginMessage) {
        loginMessage.textContent = message;
        loginMessage.className = `login-message show ${type}`;
    }
}

// Función para ocultar mensajes
function hideLoginMessage() {
    if (loginMessage) {
        loginMessage.className = 'login-message';
    }
}

// Manejar el envío del formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores del formulario
        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;
        
        // Validación básica
        if (!correo || !password) {
            showLoginMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            showLoginMessage('Por favor, ingresa un correo válido', 'error');
            return;
        }
        
        // Deshabilitar botón y mostrar loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        
        hideLoginMessage();
        
        try {
            // Crear FormData
            const formData = new FormData();
            formData.append('correo', correo);
            formData.append('password', password);
            
            // Enviar petición al servidor
            const response = await fetch('modules/auth/login.php', {
                method: 'POST',
                body: formData
            });
            
            // Verificar si la respuesta es JSON válida
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Respuesta del servidor no válida');
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Login exitoso
                showLoginMessage(result.message || '¡Inicio de sesión exitoso!', 'success');
                
                // Guardar datos en localStorage si "recordarme" está activado
                const rememberMe = document.getElementById('remember').checked;
                if (rememberMe) {
                    localStorage.setItem('userEmail', correo);
                } else {
                    localStorage.removeItem('userEmail');
                }
                
                // Notificación de éxito
                showNotification('✅ ' + (result.message || '¡Bienvenido!'), 'success');
                
                // Redirigir al dashboard después de 1 segundo
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } else {
                // Error en login
                showLoginMessage(result.message || 'Error al iniciar sesión', 'error');
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            showLoginMessage('Error de conexión. Por favor, intenta nuevamente.', 'error');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Al cargar la página, verificar si hay un correo guardado
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        const correoInput = document.getElementById('correo');
        const rememberCheckbox = document.getElementById('remember');
        if (correoInput) correoInput.value = savedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
});
