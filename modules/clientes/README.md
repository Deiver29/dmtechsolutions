# 📋 FORMULARIO SIMPLIFICADO DE CLIENTES

## ✅ Campos del Formulario

### **Campos OBLIGATORIOS** (marcados con *)
1. **Nombre** *
   - Nombre completo del cliente
   - Campo requerido

2. **Teléfono** *
   - Número de contacto del cliente
   - Campo requerido

### **Campos OPCIONALES**
3. **Empresa**
   - Nombre de la empresa del cliente (si aplica)

4. **Tipo de Cliente**
   - Opciones: Persona / Empresa
   - Por defecto: Persona

5. **Dirección**
   - Dirección física del cliente

6. **Ciudad**
   - Ciudad de residencia o ubicación

---

## 🔧 Cambios Realizados

### 1. **Formulario HTML** (`dashboard.html`)
- ✅ Eliminado campo `Email`
- ✅ Agregado campo `Tipo de Cliente` (select)
- ✅ Agregado campo `Ciudad`
- ✅ Solo `Nombre` y `Teléfono` son obligatorios

### 2. **Backend PHP** (`modules/clientes/guardar_cliente.php`)
- ✅ Actualizado para recibir nuevos campos: `tipo_cliente`, `ciudad`
- ✅ Eliminada validación de `email`
- ✅ Validación solo para `nombre` y `telefono`

### 3. **Base de Datos** (`database/tablas_basicas.sql`)
- ✅ Campo `email` cambiado a `NULL` (opcional)

### 4. **Tabla de Clientes** (`dashboard.html`)
Columnas actualizadas:
- ID
- Nombre
- Empresa
- **Tipo** (nuevo)
- Teléfono
- **Ciudad** (nuevo)
- Acciones

### 5. **JavaScript** (`js/dashboard.js`)
- ✅ Función `agregarClienteATabla()` actualizada para mostrar nuevos campos
- ✅ Badges de colores para tipos de cliente (Empresa/Persona)

---

## 🚀 Instrucciones de Actualización

### Paso 1: Actualizar Base de Datos
Ejecuta este script en phpMyAdmin para hacer el campo email opcional:

```sql
USE dmtech;
ALTER TABLE clientes 
MODIFY COLUMN email VARCHAR(150) NULL;
```

O ejecuta el archivo: `database/actualizar_clientes.sql`

### Paso 2: Recargar Dashboard
1. Abre: `http://localhost:8080/dmtechsolutions/dashboard.html`
2. Recarga la página (F5)

### Paso 3: Probar Crear Cliente
1. Click en **+ Nuevo Cliente**
2. Llena **solo Nombre y Teléfono** (obligatorios)
3. Los demás campos son opcionales
4. Guarda el cliente

---

## 📊 Estructura de Datos

```javascript
{
  "nombre": "Juan Pérez",           // Obligatorio
  "telefono": "300 123 4567",       // Obligatorio
  "empresa": "Tech Corp",           // Opcional
  "tipo_cliente": "empresa",        // Opcional (persona/empresa)
  "direccion": "Calle 123 #45-67",  // Opcional
  "ciudad": "Bogotá"                // Opcional
}
```

---

## ✨ Beneficios

- ✅ **Formulario más simple**: Solo 2 campos obligatorios
- ✅ **Más rápido**: Crear cliente en segundos
- ✅ **Menos errores**: Menos campos = menos errores de validación
- ✅ **Email opcional**: No todos los clientes tienen email
- ✅ **Mejor organización**: Tipo de cliente visible en la tabla

---

**DM Tech Solutions** - Sistema simplificado de gestión de clientes
