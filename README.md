# 🏨 HotelWork — Sistema Integral de Gestión y Reserva Hotelera

Aplicación web robusta, modular y de alto rendimiento diseñada con arquitectura limpia para la administración y reserva de habitaciones de hotel.

---

## 🛠️ Stack Tecnológico

- **Backend:** Python 3.x, FastAPI, Pydantic v2, SQLAlchemy 2.0 (ORM), SQLite (preparado para migración inmediata a PostgreSQL).
- **Seguridad:** JWT (JSON Web Tokens: access & refresh), cifrado bcrypt para contraseñas, variables de entorno con Pydantic Settings.
- **Frontend:** React 18, Vite, React Router v6, Zustand (gestión de estado global), TailwindCSS, Lucide Icons, Axios.
- **Documentación API:** Swagger UI automática en `/docs` y ReDoc en `/redoc`.

---

## 👥 Cuentas de Acceso Rápido (Seeded)

El sistema incluye datos de prueba preconfigurados con los 3 roles del sistema:

| Rol | Correo Electrónico | Contraseña | Permisos Principales |
|---|---|---|---|
| **Admin** | `admin@hotelwork.com` | `Admin1234!` | Acceso completo: Dashboard de reportes (RF09), gestión de usuarios y roles, habitaciones y pagos. |
| **Staff** | `staff@hotelwork.com` | `Staff1234!` | Recepción: Check-in y check-out (RF05), registro de pagos (RF07), visualización de reservas. |
| **Huésped** | `guest@hotelwork.com` | `Guest1234!` | Búsqueda de habitaciones (RF02), creación/cancelación de reservas (RF03), historial propio (RF08). |

---

## 🚀 Guía de Inicio Rápido

### 1. Iniciar el Backend (FastAPI)

```bash
cd backend

# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Poblar la base de datos con usuarios y habitaciones de prueba (opcional, se autoinicializa al arrancar)
python -m app.database_seed

# 3. Iniciar el servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

- **API Base:** `http://127.0.0.1:8000`
- **Documentación Swagger interactiva:** `http://127.0.0.1:8000/docs`
- **Documentación ReDoc:** `http://127.0.0.1:8000/redoc`

### Ejecutar Tests de Integración del Backend:
```bash
cd backend
python test_api.py
```
*(15 pruebas automáticas verificando todos los RF y RNF pasan exitosamente).*

---

### 2. Iniciar el Frontend (React + Vite)

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor Vite
npm run dev
```

- **Aplicación Web:** `http://localhost:5173`

---

## 📋 Cobertura de Requisitos Funcionales (RF)

- [x] **RF01: Registro e inicio de sesión de usuarios** (huésped, staff, admin con JWT y bcrypt).
- [x] **RF02: Búsqueda de habitaciones disponibles** por rango de fechas, tipo, precio y capacidad excluyendo solapamientos activos.
- [x] **RF03: Ciclo de vida de reservas** (creación con validación de disponibilidad, modificación y cancelación).
- [x] **RF04: Gestión de habitaciones (CRUD)** con soft-delete y control de estados (`available`, `occupied`, `maintenance`, `cleaning`).
- [x] **RF05: Check-in y check-out** de huéspedes en recepción con actualización de estado de habitaciones.
- [x] **RF06: Cálculo automático de tarifas** (noches × precio, descuentos e IVA del 19% configurable).
- [x] **RF07: Gestión de pagos** (registro de pago parcial/total, métodos: tarjeta, efectivo, transferencia; balance pendiente).
- [x] **RF08: Historial de reservas** personalizado para el huésped.
- [x] **RF09: Panel administrativo con reportes** (tasa de ocupación en tiempo real, ingresos totales y desglose por método).
- [x] **RF10: Notificaciones automáticas** (confirmación, check-in, check-out, pagos guardadas en BD y emitidas en consola).
- [x] **RF11: Roles y permisos diferenciados** (seguridad estricta en backend vía dependencias `require_role` y en frontend vía `ProtectedRoute`).

---

## ⚙️ Cumplimiento de Requisitos No Funcionales (RNF)

- **RNF01 (Rendimiento):** Consultas indexadas y respuestas sub-segundo en endpoints.
- **RNF02 (Seguridad):** JWT HS256 con tiempo de expiración, contraseñas hasheadas con bcrypt salt rounds 12.
- **RNF04 (Escalabilidad):** SQLAlchemy Declarative Models totalmente compatibles con PostgreSQL cambiando únicamente `DATABASE_URL`.
- **RNF06 & RNF07 (Validación y JSON):** Validación estricta con Pydantic v2 en todas las entradas y salidas.
- **RNF08 (Manejo centralizado de errores):** Exception handlers globales que devuelven estructuras JSON consistentes (`success: false`, `message`, `error_code`).
- **RNF09 (Respaldo BD):** Base de datos SQLite contenida en archivo `hotelwork.db` respaldable mediante copia manual o script.
