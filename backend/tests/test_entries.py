from datetime import date, timedelta

from tests.conftest import register_and_login


def test_get_entries_requires_auth(client):
    response = client.get("/api/entries")
    assert response.status_code == 401


def test_create_and_list_entry_with_macros(client):
    headers = register_and_login(client)

    create_resp = client.post(
        "/api/entries",
        json={
            "description": "Grilled chicken salad",
            "calories": 450,
            "protein_g": 40,
            "carbs_g": 15,
            "fat_g": 18,
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    entry = create_resp.get_json()
    assert entry["calories"] == 450
    assert entry["protein_g"] == 40
    assert entry["carbs_g"] == 15
    assert entry["fat_g"] == 18

    list_resp = client.get("/api/entries", headers=headers)
    assert list_resp.status_code == 200
    body = list_resp.get_json()
    assert len(body["entries"]) == 1
    assert body["totals"] == {
        "calories": 450,
        "protein_g": 40.0,
        "carbs_g": 15.0,
        "fat_g": 18.0,
    }


def test_create_entry_rejects_missing_description(client):
    headers = register_and_login(client)
    response = client.post(
        "/api/entries", json={"calories": 200}, headers=headers
    )
    assert response.status_code == 422


def test_create_entry_rejects_non_positive_calories(client):
    headers = register_and_login(client)
    response = client.post(
        "/api/entries",
        json={"description": "Bad entry", "calories": 0},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_entry(client):
    headers = register_and_login(client)
    create_resp = client.post(
        "/api/entries",
        json={"description": "Protein shake", "calories": 200, "protein_g": 25},
        headers=headers,
    )
    entry_id = create_resp.get_json()["id"]

    update_resp = client.put(
        f"/api/entries/{entry_id}", json={"calories": 250}, headers=headers
    )
    assert update_resp.status_code == 200
    body = update_resp.get_json()
    assert body["calories"] == 250
    assert body["description"] == "Protein shake"


def test_update_nonexistent_entry_returns_404(client):
    headers = register_and_login(client)
    # A syntactically valid ObjectId that doesn't exist in the collection --
    # this exercises the "not found" branch specifically, distinct from the
    # "malformed id" branch which is also handled (and also returns 404).
    response = client.put(
        "/api/entries/64b000000000000000000000", json={"calories": 100}, headers=headers
    )
    assert response.status_code == 404


def test_update_malformed_entry_id_returns_404(client):
    headers = register_and_login(client)
    response = client.put(
        "/api/entries/not-a-valid-id", json={"calories": 100}, headers=headers
    )
    assert response.status_code == 404


def test_delete_entry(client):
    headers = register_and_login(client)
    create_resp = client.post(
        "/api/entries",
        json={"description": "Dinner", "calories": 600},
        headers=headers,
    )
    entry_id = create_resp.get_json()["id"]

    delete_resp = client.delete(f"/api/entries/{entry_id}", headers=headers)
    assert delete_resp.status_code == 204

    list_resp = client.get("/api/entries", headers=headers)
    assert list_resp.get_json()["entries"] == []


def test_users_cannot_see_each_others_entries(client):
    headers_a = register_and_login(client, email="userA@example.com")
    headers_b = register_and_login(client, email="userB@example.com")

    client.post(
        "/api/entries",
        json={"description": "User A's lunch", "calories": 300},
        headers=headers_a,
    )

    response = client.get("/api/entries", headers=headers_b)
    assert response.get_json()["entries"] == []


def test_history_aggregates_per_day(client):
    headers = register_and_login(client)
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    client.post(
        "/api/entries",
        json={"description": "Breakfast", "calories": 300, "protein_g": 20, "date": today},
        headers=headers,
    )
    client.post(
        "/api/entries",
        json={"description": "Lunch", "calories": 500, "protein_g": 30, "date": today},
        headers=headers,
    )
    client.post(
        "/api/entries",
        json={"description": "Dinner yesterday", "calories": 700, "protein_g": 35, "date": yesterday},
        headers=headers,
    )

    response = client.get("/api/history?days=7", headers=headers)
    assert response.status_code == 200
    history = response.get_json()

    by_date = {row["date"]: row for row in history}
    assert by_date[today]["calories"] == 800
    assert by_date[today]["protein_g"] == 50.0
    assert by_date[yesterday]["calories"] == 700

    # most recent day first
    assert history[0]["date"] == today
