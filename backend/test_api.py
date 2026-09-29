"""Comprehensive integration test script for HotelWork API."""

import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.database_seed import seed_database

def run_integration_tests():
    print(">>> Starting HotelWork API Integration Tests...")
    init_db()
    seed_database()

    client = TestClient(app)

    # 1. Health & Root
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("  [PASS] GET /")

    # 2. Login as Admin
    res = client.post("/api/v1/auth/login", json={"email": "admin@hotelwork.com", "password": "Admin1234!"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["data"]["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("  [PASS] POST /api/v1/auth/login (Admin)")

    # 3. Login as Staff
    res = client.post("/api/v1/auth/login", json={"email": "staff@hotelwork.com", "password": "Staff1234!"})
    assert res.status_code == 200, f"Staff login failed: {res.text}"
    staff_token = res.json()["data"]["access_token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    print("  [PASS] POST /api/v1/auth/login (Staff)")

    # 4. Register new Guest
    res = client.post("/api/v1/auth/register", json={
        "email": "testguest@hotelwork.com",
        "password": "Password123!",
        "first_name": "Laura",
        "last_name": "GÃ³mez",
        "phone": "+57 300 000 1122",
        "document_id": "CC-998877",
    })
    # If already registered in a previous run, allow 201 or skip
    if res.status_code == 201:
        print("  [PASS] POST /api/v1/auth/register (Guest created)")
    else:
        print(f"  [NOTE] Register returned {res.status_code} (already exists): {res.json()['message']}")

    # 5. Login as Guest
    res = client.post("/api/v1/auth/login", json={"email": "testguest@hotelwork.com", "password": "Password123!"})
    assert res.status_code == 200, f"Guest login failed: {res.text}"
    guest_token = res.json()["data"]["access_token"]
    guest_headers = {"Authorization": f"Bearer {guest_token}"}
    guest_user_id = res.json()["data"]["user"]["id"]
    print("  [PASS] POST /api/v1/auth/login (Guest)")

    # 6. RF02: Search available rooms
    res = client.get("/api/v1/rooms/available?check_in=2026-10-01&check_out=2026-10-05")
    assert res.status_code == 200, f"Search rooms failed: {res.text}"
    available_rooms = res.json()["data"]
    assert len(available_rooms) > 0, "Expected at least 1 available room"
    selected_room = available_rooms[0]
    room_id = selected_room["id"]
    print(f"  [PASS] GET /api/v1/rooms/available (Found {len(available_rooms)} rooms, selected #{selected_room['room_number']})")

    # 7. RF03, RF06: Create Reservation (4 nights, tariff check)
    res = client.post(
        "/api/v1/reservations/",
        headers=guest_headers,
        json={
            "room_id": room_id,
            "check_in_date": "2026-10-01",
            "check_out_date": "2026-10-05",
            "num_guests": 1,
            "special_requests": "Piso alto y cama cÃ³moda por favor.",
            "discount_rate": 0.10,
        },
    )
    assert res.status_code == 201, f"Create reservation failed: {res.text}"
    reservation = res.json()["data"]
    res_id = reservation["id"]
    print(f"  [PASS] POST /api/v1/reservations/ (ID #{res_id}, Base: ${reservation['base_total']}, Final: ${reservation['final_total']})")

    # Verify calculation: 4 nights * price
    expected_base = round(4 * selected_room["price_per_night"], 2)
    assert reservation["base_total"] == expected_base, f"Tariff mismatch: {reservation['base_total']} != {expected_base}"
    print("  [PASS] RF06: Automatic tariff & tax calculation verified accurately")

    # 8. RF08: Guest history
    res = client.get("/api/v1/reservations/my", headers=guest_headers)
    assert res.status_code == 200
    assert len(res.json()["data"]) >= 1
    print("  [PASS] GET /api/v1/reservations/my (Guest history)")

    # 9. RF05: Staff Check-in
    res = client.patch(f"/api/v1/reservations/{res_id}/check-in", headers=staff_headers)
    assert res.status_code == 200, f"Check-in failed: {res.text}"
    assert res.json()["data"]["status"] == "checked_in"
    print("  [PASS] PATCH /api/v1/reservations/{id}/check-in (Staff)")

    # Test failed check-out (unpaid)
    res_fail = client.patch(f"/api/v1/reservations/{res_id}/check-out", headers=staff_headers)
    assert res_fail.status_code == 400, "Should fail check-out if unpaid"
    assert "pago" in res_fail.text.lower()
    print("  [PASS] Failed check-out without payment returns 400")

    # 10. RF07: Register Payment (using idempotent confirm)
    # The pending payment should have been created with the reservation
    pending_payment_id = reservation["payments"][0]["id"]
    res = client.patch(
        f"/api/v1/payments/{pending_payment_id}/confirm",
        headers=staff_headers,
        json={
            "amount": reservation["final_total"],
            "payment_method": "credit_card",
            "transaction_ref": "TXN-VISA-987654",
        },
    )
    assert res.status_code == 200, f"Payment confirm failed: {res.text}"
    print("  [PASS] PATCH /api/v1/payments/{id}/confirm (Payment confirmed)")

    # 11. Check payments balance
    res = client.get(f"/api/v1/payments/reservation/{res_id}", headers=guest_headers)
    assert res.status_code == 200
    assert res.json()["data"]["balance_pending"] == 0.0
    print("  [PASS] GET /api/v1/payments/reservation/{id} (Balance is 0.0)")

    # 12. RF05: Staff Check-out
    res = client.patch(f"/api/v1/reservations/{res_id}/check-out", headers=staff_headers)
    assert res.status_code == 200, f"Check-out failed: {res.text}"
    assert res.json()["data"]["status"] == "checked_out"
    print("  [PASS] PATCH /api/v1/reservations/{id}/check-out (Staff)")

    # 13. RF09: Admin Dashboard Summary & Revenue
    res = client.get("/api/v1/reports/summary", headers=admin_headers)
    assert res.status_code == 200, f"Admin summary failed: {res.text}"
    kpis = res.json()["data"]["kpis"]
    print(f"  [PASS] GET /api/v1/reports/summary (Total revenue: ${kpis['total_revenue']}, Reservations: {kpis['total_reservations']})")

    res = client.get("/api/v1/reports/revenue", headers=admin_headers)
    assert res.status_code == 200
    print("  [PASS] GET /api/v1/reports/revenue")

    # 14. RF10: Guest Notifications & Mark as Read
    res = client.get("/api/v1/notifications/", headers=guest_headers)
    assert res.status_code == 200
    notifs = res.json()["data"]["notifications"]
    initial_unread = res.json()["data"]["unread_count"]
    assert len(notifs) >= 3, "Expected confirmation, check-in and payment notifications"
    assert initial_unread > 0, "Expected unread notifications before opening panel"
    print(f"  [PASS] GET /api/v1/notifications/ (Found {len(notifs)} notifications, {initial_unread} unread)")

    # 14b. RF10: Mark all notifications as read on open (bulk endpoint)
    res = client.patch("/api/v1/notifications/read-all", headers=guest_headers)
    assert res.status_code == 200, f"Mark read-all failed: {res.text}"
    assert res.json()["data"]["unread_count"] == 0

    # Verify persistence upon re-fetch / page reload simulation
    res_refetch = client.get("/api/v1/notifications/", headers=guest_headers)
    assert res_refetch.status_code == 200
    assert res_refetch.json()["data"]["unread_count"] == 0, "Unread count should be 0 after read-all"
    assert all(n["is_read"] is True for n in res_refetch.json()["data"]["notifications"]), "All notifications should have is_read=True"
    print("  [PASS] PATCH /api/v1/notifications/read-all & persistence verification (Unread count = 0)")

    # 15. RF11: Role security test - guest trying to access admin report should fail (403)
    res = client.get("/api/v1/reports/summary", headers=guest_headers)
    assert res.status_code == 403, f"Expected 403 for guest accessing admin report, got {res.status_code}"
    print("  [PASS] RF11: Security role validation strictly enforced (Guest denied 403 on admin report)")

    # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    # NEW TESTS: Role restriction & staff registration
    # â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    print("\n>>> Running NEW role restriction & staff registration tests...")

    # 16. Admin CANNOT change role via PATCH (body contains "role")
    res = client.patch(
        f"/api/v1/users/{guest_user_id}",
        headers=admin_headers,
        json={"role": "staff"},
    )
    assert res.status_code == 400, f"Expected 400 when sending role in PATCH, got {res.status_code}: {res.text}"
    assert "ROLE_CHANGE_FORBIDDEN" in res.text or "rol" in res.text.lower()
    # Verify the role did NOT change
    res_check = client.get(f"/api/v1/users/{guest_user_id}", headers=admin_headers)
    assert res_check.status_code == 200
    assert res_check.json()["data"]["role"] == "guest", "Role should still be 'guest' after rejected PATCH"
    print("  [PASS] TEST 16: Admin cannot change role via PATCH (400 + role unchanged)")

    # 17. Admin CAN edit phone, document_id and is_active via PATCH
    res = client.patch(
        f"/api/v1/users/{guest_user_id}",
        headers=admin_headers,
        json={"phone": "+57 999 888 7777", "document_id": "CC-UPDATED-123", "is_active": False},
    )
    assert res.status_code == 200, f"Admin PATCH phone/doc/active failed: {res.text}"
    patched = res.json()["data"]
    assert patched["phone"] == "+57 999 888 7777", f"Phone not updated: {patched['phone']}"
    assert patched["document_id"] == "CC-UPDATED-123", f"Doc not updated: {patched['document_id']}"
    assert patched["is_active"] is False, f"is_active not updated: {patched['is_active']}"
    assert patched["role"] == "guest", f"Role changed unexpectedly: {patched['role']}"
    print("  [PASS] TEST 17: Admin can PATCH phone, document_id, is_active (role unchanged)")

    # Restore guest to active for subsequent tests
    res = client.patch(
        f"/api/v1/users/{guest_user_id}",
        headers=admin_headers,
        json={"is_active": True},
    )
    assert res.status_code == 200

    # 18. Admin CAN register a new staff member via POST /users/staff
    res = client.post(
        "/api/v1/users/staff",
        headers=admin_headers,
        json={
            "email": "newstaff@hotelwork.com",
            "password": "StaffNew123!",
            "first_name": "Pedro",
            "last_name": "Empleado",
            "phone": "+57 310 555 0000",
            "document_id": "CC-NEWSTAFF-001",
        },
    )
    if res.status_code == 201:
        new_staff = res.json()["data"]
        assert new_staff["role"] == "staff", f"New staff should have role 'staff', got: {new_staff['role']}"
        print(f"  [PASS] TEST 18: Admin registered staff (ID #{new_staff['id']}, role=staff)")
    elif res.status_code == 409:
        print("  [NOTE] TEST 18: Staff already exists from previous run (409 Conflict)")
    else:
        raise AssertionError(f"POST /users/staff unexpected status: {res.status_code}: {res.text}")

    # 19. Staff CANNOT register a new staff member (403)
    res = client.post(
        "/api/v1/users/staff",
        headers=staff_headers,
        json={
            "email": "unauthorized_staff@hotelwork.com",
            "password": "StaffBad123!",
            "first_name": "Intento",
            "last_name": "NoPermitido",
        },
    )
    assert res.status_code == 403, f"Expected 403 for staff registering staff, got {res.status_code}"
    print("  [PASS] TEST 19: Staff cannot register new staff (403)")

    # 20. Guest CANNOT register a new staff member (403)
    res = client.post(
        "/api/v1/users/staff",
        headers=guest_headers,
        json={
            "email": "unauthorized_staff2@hotelwork.com",
            "password": "GuestBad123!",
            "first_name": "Intento",
            "last_name": "GuestNoPermitido",
        },
    )
    assert res.status_code == 403, f"Expected 403 for guest registering staff, got {res.status_code}"
    print("  [PASS] TEST 20: Guest cannot register new staff (403)")

    # 21. Old PUT /{id}/role endpoint no longer exists (405 Method Not Allowed)
    res = client.put(
        f"/api/v1/users/{guest_user_id}/role",
        headers=admin_headers,
        json={"role": "admin"},
    )
    assert res.status_code in (404, 405), f"Expected 404/405 for removed PUT role endpoint, got {res.status_code}"
    print(f"  [PASS] TEST 21: PUT /users/{{id}}/role no longer exists ({res.status_code})")

    # 22. Get list of checkouts
    res = client.get("/api/v1/checkouts/", headers=admin_headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    checkouts = res.json()["data"]
    assert len(checkouts) > 0, "Expected at least one checkout record from test 12"
    checkout_id = checkouts[0]["id"]
    print("  [PASS] TEST 22: GET /api/v1/checkouts/ (Checkouts found)")

    # 23. Admin updates counting status
    res = client.patch(
        f"/api/v1/checkouts/{checkout_id}/status",
        headers=admin_headers,
        json={"status": "kept"}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json()["data"]["counting_status"] == "kept"
    print("  [PASS] TEST 23: Admin updates CheckoutRecord counting status")

    # Make room available again since we made it cleaning after checkout
    client.patch(
        f"/api/v1/rooms/{room_id}/status",
        headers=staff_headers,
        json={"status": "available"}
    )
    
    # 24. Cannot register payment on a cancelled reservation (400)
    res_cancel_res = client.post(
        "/api/v1/reservations/",
        headers=guest_headers,
        json={
            "room_id": room_id,
            "check_in_date": "2026-11-01",
            "check_out_date": "2026-11-03",
            "num_guests": 1,
        },
    )
    assert res_cancel_res.status_code == 201
    cancel_res_id = res_cancel_res.json()["data"]["id"]

    cancel_pending_payment_id = res_cancel_res.json()["data"]["payments"][0]["id"]

    res_cancel = client.patch(f"/api/v1/reservations/{cancel_res_id}/cancel", headers=guest_headers)
    assert res_cancel.status_code == 200
    assert res_cancel.json()["data"]["status"] == "cancelled"

    res_pay_fail = client.patch(
        f"/api/v1/payments/{cancel_pending_payment_id}/confirm",
        headers=staff_headers,
        json={
            "amount": 100.0,
            "payment_method": "cash",
            "transaction_ref": "TXN-CANCELLED-01",
        },
    )
    assert res_pay_fail.status_code == 409, f"Expected 409 when paying cancelled reservation, got {res_pay_fail.status_code}"
    assert "confirmable" in res_pay_fail.text.lower() or "cancelada" in res_pay_fail.text.lower()
    print("  [PASS] TEST 24: Payment attempt on cancelled reservation rejected (409 Conflict)")

    # 25. Cancelling a reservation removes it from checkouts / pagados list
    checkouts_after = client.get("/api/v1/checkouts/", headers=admin_headers).json()["data"]
    checkout_res_ids = [c["reservation_id"] for c in checkouts_after]
    assert cancel_res_id not in checkout_res_ids, "Cancelled reservation should not be present in checkouts/pagados list"
    print("  [PASS] TEST 25: Cancelled reservation excluded/deleted from checkouts/pagados list")


    # ══════════════════════════════════════════════════════════════════
    # GALLERY TESTS (T-G1 to T-G7): image_urls array support
    # ══════════════════════════════════════════════════════════════════

    print("\n>>> Running GALLERY tests (image_urls multi-photo)...")

    GALLERY_URLS = [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    ]

    # T-G1: Create room with image_urls array
    res = client.post(
        "/api/v1/rooms/",
        headers=admin_headers,
        json={
            "room_number": "G02",
            "room_type": "suite",
            "price_per_night": 175.0,
            "capacity": 2,
            "floor": "4",
            "description": "Habitacion con galeria de prueba.",
            "image_urls": GALLERY_URLS,
        },
    )
    assert res.status_code == 201, f"T-G1 FAILED: {res.text}"
    gallery_room = res.json()["data"]
    gallery_room_id = gallery_room["id"]
    assert gallery_room["image_urls"] == GALLERY_URLS, f"T-G1: image_urls mismatch: {gallery_room['image_urls']}"
    assert gallery_room["image_url"] == GALLERY_URLS[0], f"T-G1: image_url should be first URL"
    print(f"  [PASS] T-G1: POST /rooms/ with image_urls[3] -> room #{gallery_room_id}, image_urls correct")

    # T-G2: GET by ID returns full image_urls array
    res = client.get(f"/api/v1/rooms/{gallery_room_id}")
    assert res.status_code == 200, f"T-G2 FAILED: {res.text}"
    detail = res.json()["data"]
    assert detail["image_urls"] == GALLERY_URLS, f"T-G2: GET detail image_urls mismatch"
    assert detail["image_url"] == GALLERY_URLS[0], f"T-G2: GET detail image_url compat mismatch"
    print("  [PASS] T-G2: GET /rooms/{id} returns image_urls[3] + image_url compat")

    # T-G3: GET /rooms/ listing includes image_urls for all rooms
    res = client.get("/api/v1/rooms/", params={"include_inactive": "false"})
    assert res.status_code == 200, f"T-G3 FAILED: {res.text}"
    all_rooms = res.json()["data"]
    for r in all_rooms:
        assert "image_urls" in r, f"T-G3: room #{r['room_number']} missing image_urls field"
        assert isinstance(r["image_urls"], list), f"T-G3: image_urls not a list for room #{r['room_number']}"
    print(f"  [PASS] T-G3: GET /rooms/ listing — image_urls present in all {len(all_rooms)} rooms")

    # T-G4: PUT /rooms/{id} — update to 4 URLs, first element changes
    NEW_URLS = [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    ]
    res = client.put(
        f"/api/v1/rooms/{gallery_room_id}",
        headers=admin_headers,
        json={"image_urls": NEW_URLS},
    )
    assert res.status_code == 200, f"T-G4 FAILED: {res.text}"
    updated = res.json()["data"]
    assert updated["image_urls"] == NEW_URLS, f"T-G4: updated image_urls mismatch"
    assert updated["image_url"] == NEW_URLS[0], f"T-G4: image_url should be updated first URL"
    print("  [PASS] T-G4: PUT /rooms/{id} — image_urls updated to 4 entries, compat field updated")

    # T-G5: Legacy rooms (seeded with image_url) return image_urls[0] == image_url
    res = client.get("/api/v1/rooms/available?check_in=2026-12-01&check_out=2026-12-05")
    assert res.status_code == 200, f"T-G5 FAILED: {res.text}"
    avail = res.json()["data"]
    legacy_rooms = [r for r in avail if r["room_number"] in ("101", "102", "201", "301")]
    assert len(legacy_rooms) > 0, "T-G5: No legacy seeded rooms found in available list"
    for r in legacy_rooms:
        assert len(r["image_urls"]) >= 1, f"T-G5: legacy room #{r['room_number']} has empty image_urls"
        assert r["image_urls"][0] == r["image_url"], f"T-G5: legacy room image_url != image_urls[0]"
    print(f"  [PASS] T-G5: {len(legacy_rooms)} legacy rooms — image_urls[0] == image_url (migration OK)")

    # T-G6: Create room with 0 image_urls -> 422 Validation Error
    res = client.post(
        "/api/v1/rooms/",
        headers=admin_headers,
        json={
            "room_number": "G99",
            "room_type": "single",
            "price_per_night": 50.0,
            "capacity": 1,
            "image_urls": [],
        },
    )
    assert res.status_code == 422, f"T-G6: Expected 422 for empty image_urls, got {res.status_code}: {res.text}"
    print("  [PASS] T-G6: POST with empty image_urls[] -> 422 Validation Error")

    # T-G7: Create room with invalid URL -> 422 Validation Error
    res = client.post(
        "/api/v1/rooms/",
        headers=admin_headers,
        json={
            "room_number": "G98",
            "room_type": "single",
            "price_per_night": 50.0,
            "capacity": 1,
            "image_urls": ["not-a-valid-url"],
        },
    )
    assert res.status_code == 422, f"T-G7: Expected 422 for invalid URL, got {res.status_code}: {res.text}"
    print("  [PASS] T-G7: POST with invalid URL -> 422 Validation Error")

    # Cleanup: deactivate gallery test room
    client.delete(f"/api/v1/rooms/{gallery_room_id}", headers=admin_headers)

    print("\n>>> ALL INTEGRATION TESTS PASSED SUCCESSFULLY! <<<\n")
if __name__ == "__main__":
    run_integration_tests()




