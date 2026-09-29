"""Database configuration and connection management."""

import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass

def init_db() -> None:
    """Initializes the database by creating all tables."""
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _migrate_image_urls()
    _seed_default_admin()

def _seed_default_admin() -> None:
    """Seeds a default admin user if no admin exists in the database."""
    from app.models.user import User, UserRole
    from app.services.auth_service import hash_password
    
    with SessionLocal() as db:
        admin_exists = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin_exists:
            default_admin = User(
                email="admin@hotelwork.com",
                hashed_password=hash_password("admin123"),
                first_name="Admin",
                last_name="Principal",
                role=UserRole.admin,
                is_active=True
            )
            db.add(default_admin)
            db.commit()
            print("[init_db] Default admin user created.")


def _migrate_image_urls() -> None:
    """
    Migration: adds image_urls_json column (if not present) and copies
    existing image_url values into image_urls_json for backward compat.
    Safe to run multiple times (idempotent).
    """
    with engine.connect() as conn:
        # 1. Add column if it does not exist (SQLite ignores if already present via exception)
        try:
            conn.execute(text("ALTER TABLE rooms ADD COLUMN image_urls_json TEXT"))
            conn.commit()
        except Exception:
            pass  # Column already exists

        # 2. Copy legacy image_url → image_urls_json for rows that have not been migrated yet
        try:
            rows = conn.execute(
                text("SELECT id, image_url FROM rooms WHERE image_urls_json IS NULL AND image_url IS NOT NULL")
            ).fetchall()
            for row in rows:
                json_val = json.dumps([row[1]])
                conn.execute(
                    text("UPDATE rooms SET image_urls_json = :json_val WHERE id = :id"),
                    {"json_val": json_val, "id": row[0]},
                )
            if rows:
                conn.commit()
                print(f"[init_db] Migrated image_url -> image_urls_json for {len(rows)} room(s).")
        except Exception as e:
            print(f"[init_db] Warning during image_url migration: {e}")
