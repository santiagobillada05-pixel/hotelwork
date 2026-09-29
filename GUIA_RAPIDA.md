# ⚡ Guía Rápida - HotelWork

Bienvenido a **HotelWork**, el sistema ágil de gestión hotelera. Esta guía está diseñada para que empieces a utilizar el sistema en menos de 5 minutos.

---

## 🔑 Accesos Rápidos de Prueba

Si estás evaluando el sistema en un entorno de desarrollo, utiliza estas credenciales:

| Perfil | Email | Contraseña | ¿Qué puede hacer? |
|---|---|---|---|
| 👑 **Admin** | `admin@hotelwork.com` | `Admin1234!` | Ver reportes, gestionar usuarios y editar habitaciones. |
| 🛎️ **Staff** | `staff@hotelwork.com` | `Staff1234!` | Hacer Check-in/out y cobrar a los huéspedes. |
| 🧳 **Huésped** | `guest@hotelwork.com` | `Guest1234!` | Buscar disponibilidad y reservar. |

**URL de acceso:** `http://localhost:5173` (O la dirección proporcionada por su administrador).

---

## 🧳 Para Huéspedes: Tu Primera Reserva

1. **Inicia sesión** con tu cuenta de Huésped.
2. En el menú, ve a **Buscar Habitaciones**.
3. Selecciona tus fechas de **llegada y salida**. 
4. Elige una habitación de la lista y presiona **Reservar**.
5. ¡Listo! Puedes revisar los detalles en la pestaña **Mis Reservas**.

---

## 🛎️ Para Staff: Operaciones Diarias

### Cómo hacer un Check-in (Llegada)
1. Ve a **Recepción** o **Ver Reservas**.
2. Busca al huésped que acaba de llegar.
3. Haz clic en el botón **"Realizar Check-in"**.
4. *La habitación pasará a estado "Ocupada".*

### Cómo cobrar y hacer Check-out (Salida)
1. Busca la reserva del huésped que se retira.
2. Revisa la pestaña de **Pagos**. Si el "Balance Pendiente" es mayor a cero, haz clic en **"Registrar Pago"**, selecciona el método (Efectivo/Tarjeta) y guarda.
3. Una vez el saldo esté pagado, haz clic en **"Realizar Check-out"**.
4. *La habitación pasará a estado "Limpieza".*

---

## 👑 Para Administradores: Vistazo Rápido

### Dónde ver los ingresos
1. Inicia sesión como Admin.
2. La primera pantalla es tu **Dashboard**.
3. Allí verás gráficos en tiempo real con la **Tasa de Ocupación** y los **Ingresos Totales** desglosados por método de pago.

### Editar o Añadir Habitaciones
1. Ve al menú lateral y selecciona **Gestión de Habitaciones**.
2. Utiliza el botón **"Nueva Habitación"** para agregar inventario, o utiliza las opciones de la tabla para cambiar el estado de una habitación a *Mantenimiento* si está averiada.

---
*Para procesos más detallados, consulta el archivo completo `MANUAL_DE_USUARIO.md`.*
