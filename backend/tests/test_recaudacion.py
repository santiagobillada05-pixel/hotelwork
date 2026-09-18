import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta, timezone

def test_get_recaudacion_unauthorized(client: TestClient):
    """Prueba que sin token rechace la solicitud"""
    response = client.get("/api/v1/reports/recaudacion")
    assert response.status_code == 401

def test_get_recaudacion_guest_forbidden(client: TestClient, guest_token_headers):
    """Prueba que un guest no puede acceder"""
    response = client.get("/api/v1/reports/recaudacion", headers=guest_token_headers)
    assert response.status_code == 403

def test_get_recaudacion_staff_success(client: TestClient, staff_token_headers, db_session):
    """Prueba que un staff puede acceder y los totales funcionan con mock data"""
    from app.models.payment import Payment, PaymentStatus
    from app.models.user import User
    from app.models.reservation import Reservation, ReservationStatus
    from app.models.room import Room
    
    # Crear un pago para 'esta semana'
    now_bogota = datetime.now(timezone(timedelta(hours=-5)))
    
    user = db_session.query(User).first()
    room = db_session.query(Room).first()
    
    res = Reservation(user_id=user.id, room_id=room.id, check_in_date=now_bogota.date(), check_out_date=now_bogota.date() + timedelta(days=1), num_guests=1, base_total=100.0, final_total=100.0, status=ReservationStatus.confirmed)
    db_session.add(res)
    db_session.commit()
    
    payment = Payment(
        reservation_id=res.id,
        amount=100.0,
        payment_method="cash",
        status=PaymentStatus.completed,
        paid_at=datetime.now(timezone.utc)
    )
    db_session.add(payment)
    db_session.commit()
    
    response = client.get("/api/v1/reports/recaudacion?period=week", headers=staff_token_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert "totals" in data
    assert "week" in data["totals"]
    assert data["totals"]["week"]["amount"] >= 100.0
    
    # Check that payment is in list
    assert len(data["payments"]) >= 1
    assert data["payments"][0]["amount"] == 100.0
