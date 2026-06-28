def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}


def test_register_new_user(client):
    response = client.post(
        "/api/register", json={"email": "alice@example.com", "password": "secret123"}
    )
    assert response.status_code == 201
    body = response.get_json()
    assert body["message"] == "User created successfully"
    assert "user_id" in body


def test_register_duplicate_email_fails(client):
    payload = {"email": "bob@example.com", "password": "secret123"}
    assert client.post("/api/register", json=payload).status_code == 201

    second = client.post("/api/register", json=payload)
    assert second.status_code == 400
    assert second.get_json()["detail"] == "Email already registered"


def test_register_short_password_fails_validation(client):
    response = client.post(
        "/api/register", json={"email": "carol@example.com", "password": "123"}
    )
    assert response.status_code == 422


def test_register_invalid_email_fails_validation(client):
    response = client.post(
        "/api/register", json={"email": "not-an-email", "password": "secret123"}
    )
    assert response.status_code == 422


def test_login_success_returns_token(client):
    client.post(
        "/api/register", json={"email": "dave@example.com", "password": "secret123"}
    )
    response = client.post(
        "/api/login", json={"email": "dave@example.com", "password": "secret123"}
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["token_type"] == "bearer"
    assert len(body["access_token"]) > 0


def test_login_wrong_password_fails(client):
    client.post(
        "/api/register", json={"email": "erin@example.com", "password": "secret123"}
    )
    response = client.post(
        "/api/login", json={"email": "erin@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_login_unknown_user_fails(client):
    response = client.post(
        "/api/login", json={"email": "nobody@example.com", "password": "secret123"}
    )
    assert response.status_code == 401
