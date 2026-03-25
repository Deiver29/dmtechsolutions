# 💰 CÁLCULO DE IVA INCLUIDO - COTIZACIONES

## 📊 Método de Cálculo

El sistema ahora calcula el IVA como **INCLUIDO** en el precio, no sumado al final.

---

## ✅ EJEMPLO DE CÁLCULO

### Datos de Entrada:
- **Item 1**: Desarrollo Web
  - Cantidad: 1
  - Precio Unitario: **$780,000** (CON IVA incluido)

### Cálculo Automático:

```
Gran Total = $780,000 (precio con IVA incluido)

Subtotal (sin IVA) = $780,000 / 1.19 = $655,462
IVA (19%) = $780,000 - $655,462 = $124,538
Valor Total = $780,000
```

---

## 🔢 FÓRMULAS

### 1️⃣ **Gran Total**
```javascript
granTotal = Σ(cantidad × precio_unitario)
```
Los precios unitarios YA incluyen el IVA del 19%

### 2️⃣ **Subtotal (sin IVA)**
```javascript
subtotal = granTotal / 1.19
```
Extrae el valor sin IVA

### 3️⃣ **IVA Extraído**
```javascript
iva = granTotal - subtotal
```
Calcula cuánto IVA está incluido

### 4️⃣ **Valor Total**
```javascript
valorTotal = granTotal
```
El total es igual al gran total (ya incluye IVA)

---

## 📋 DESGLOSE EN EL FORMULARIO

```
┌─────────────────────────────────────┐
│ TOTALES                              │
│ Los precios incluyen IVA del 19%    │
├─────────────────────────────────────┤
│ Subtotal (sin IVA):    $655,462     │
│ IVA (19%):             $124,538     │
│ Valor Total:           $780,000     │
└─────────────────────────────────────┘
```

---

## 💡 ¿POR QUÉ ASÍ?

En Colombia, es común presentar los precios CON IVA incluido al cliente final. El desglose muestra:

1. **Cuánto del precio es base gravable** (Subtotal sin IVA)
2. **Cuánto se paga de IVA** (19% extraído)
3. **Cuánto paga el cliente en total** (Valor Total)

---

## 🎨 INTERFAZ DE USUARIO

### Campo de Precio Unitario:
```
Precio Unitario * (con IVA incluido)
[ 780000 ]
```

### Sección de Totales:
```
Totales
Los precios incluyen IVA del 19%

Subtotal (sin IVA):    $655,462
IVA (19%):             $124,538
Valor Total:           $780,000
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### JavaScript (`js/dashboard.js`)

```javascript
function calcularTotalesCotizacion() {
    // Calcular Gran Total (precios CON IVA incluido)
    let granTotal = 0;
    
    document.querySelectorAll('.item-row').forEach(row => {
        const cantidad = parseFloat(row.querySelector('.item-cantidad').value) || 0;
        const precio = parseFloat(row.querySelector('.item-precio').value) || 0;
        granTotal += cantidad * precio;
    });
    
    // Extraer el IVA del Gran Total
    const subtotal = granTotal / 1.19;  // Precio sin IVA
    const iva = granTotal - subtotal;    // IVA extraído
    const total = granTotal;             // Total = Gran Total
    
    // Actualizar UI
    document.getElementById('cotSubtotal').textContent = formatMoney(subtotal);
    document.getElementById('cotIva').textContent = formatMoney(iva);
    document.getElementById('cotTotal').textContent = formatMoney(total);
}
```

### Al Guardar Cotización:

```javascript
let granTotal = 0;
items.forEach(item => granTotal += item.subtotal);

const subtotal = granTotal / 1.19;        // Precio sin IVA
const ivaTotal = granTotal - subtotal;    // IVA extraído
const total = granTotal;                  // Total con IVA

formData.append('subtotal', subtotal.toFixed(2));
formData.append('iva_monto', ivaTotal.toFixed(2));
formData.append('total', total.toFixed(2));
```

---

## ✅ VALIDACIÓN

### Verifica que se cumple:
```
subtotal + iva = total
subtotal × 1.19 = total
iva / subtotal ≈ 0.19 (19%)
```

### Ejemplo de Validación:
```
655,462 + 124,538 = 780,000 ✓
655,462 × 1.19 = 780,000 ✓
124,538 / 655,462 = 0.19 (19%) ✓
```

---

## 📊 COMPARACIÓN: ANTES vs AHORA

### ❌ ANTES (IVA Sumado):
```
Subtotal:   $780,000
IVA (19%):  $148,200
Total:      $928,200  ← Cliente paga MÁS
```

### ✅ AHORA (IVA Incluido):
```
Subtotal (sin IVA):  $655,462
IVA (19%):           $124,538
Valor Total:         $780,000  ← Cliente paga lo indicado
```

---

## 🚀 USO PRÁCTICO

1. **Ingresa el precio final** que quieres cobrar (con IVA incluido)
2. El sistema **calcula automáticamente**:
   - Cuánto es el subtotal sin IVA
   - Cuánto IVA está incluido
3. **El cliente ve el desglose** claro en la cotización

---

## 💼 EJEMPLO REAL

**Cotización: Desarrollo de Sitio Web**

| Item | Cantidad | Precio Unitario | Subtotal |
|------|----------|-----------------|----------|
| Diseño web responsive | 1 | $500,000 | $500,000 |
| Desarrollo backend | 1 | $800,000 | $800,000 |
| Integración API | 1 | $300,000 | $300,000 |

**Cálculo Automático:**
```
Gran Total:           $1,600,000
Subtotal (sin IVA):   $1,344,538
IVA (19%):            $  255,462
Valor Total:          $1,600,000
```

---

**DM Tech Solutions** - Sistema de cotizaciones con IVA incluido
