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

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(10, 25, 41, 0.15)';
        header.style.padding = '12px 0';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(10, 25, 41, 0.08)';
        header.style.padding = '16px 0';
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

// Service card hover effect with tilt
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Cursor effect for interactive elements
document.querySelectorAll('a, button, .btn').forEach(element => {
    element.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    
    element.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

// Console branding
console.log('%c🖥️ DM TECH SOLUTIONS', 'font-size: 24px; font-weight: bold; color: #0066FF;');
console.log('%cTecnología Empresarial de Vanguardia', 'font-size: 14px; color: #00C9A7;');
console.log('%cVersión: 2.0.0 Enterprise', 'font-size: 12px; color: #5A6C7D;');
console.log('%cFecha: 27 de diciembre de 2025', 'font-size: 12px; color: #5A6C7D;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0066FF;');
console.log('%c¿Buscas talento técnico? Contáctanos!', 'font-size: 14px; font-weight: bold; color: #00C9A7;');
