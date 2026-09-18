"""Main FastAPI application module for HotelWork."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import get_settings
from app.database import init_db
from app.utils.exceptions import HotelWorkException
from app.utils.responses import error_response
from app.routers import (
    auth_router,
    users_router,
    rooms_router,
    reservations_router,
    payments_router,
    reports_router,
    notifications_router,
    checkouts_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for the FastAPI application."""
    print(f"[{settings.APP_NAME}] Initializing database tables...")
    init_db()
    print(f"[{settings.APP_NAME}] Database ready. Application online.")
    yield
    print(f"[{settings.APP_NAME}] Shutting down application gracefully...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Sistema robusto y escalable para la gestión y reserva de habitaciones de hotel.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(HotelWorkException)
async def hotelwork_exception_handler(request: Request, exc: HotelWorkException):
    """Global exception handler for custom HotelWorkException."""
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.message, error_code=exc.error_code),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic validation errors in the standardized response shape."""
    first_error = exc.errors()[0] if exc.errors() else {}
    loc = " -> ".join(str(l) for l in first_error.get("loc", []))
    msg = first_error.get("msg", "Error de validación")
    detail_msg = f"{loc}: {msg}" if loc else msg
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            message="Error de validación en los datos enviados",
            detail=detail_msg,
            error_code="VALIDATION_ERROR",
        ),
    )


# Register Routers under /api/v1
API_V1_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(users_router, prefix=API_V1_PREFIX)
app.include_router(rooms_router, prefix=API_V1_PREFIX)
app.include_router(reservations_router, prefix=API_V1_PREFIX)
app.include_router(payments_router, prefix=API_V1_PREFIX)
app.include_router(reports_router, prefix=API_V1_PREFIX)
app.include_router(notifications_router, prefix=API_V1_PREFIX)
app.include_router(checkouts_router, prefix=API_V1_PREFIX)


@app.get("/", tags=["General"])
def root_endpoint() -> dict:
    """Root endpoint with API status and documentation link."""
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["General"])
def health_check() -> dict:
    """Health check endpoint for monitoring."""
    return {"status": "ok", "app": settings.APP_NAME}
