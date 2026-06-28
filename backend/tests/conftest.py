import mongoengine
import mongomock
import pytest

from app import create_app


@pytest.fixture
def app():
    """Each test gets a fresh app wired to an in-memory mongomock client,
    so tests never touch a real MongoDB deployment and are fully isolated
    from one another. mongomock emulates enough of the MongoDB wire
    protocol (including the aggregation pipeline used by /api/history)
    that the real route code runs unmodified."""
    flask_app = create_app(
        {
            "TESTING": True,
            "MONGODB_URI": "mongodb://localhost/calorie_tracker_test",
            "MONGO_CLIENT_CLASS": mongomock.MongoClient,
            "JWT_SECRET_KEY": "test-secret",
        }
    )
    yield flask_app

    # Drop all collections so the next test starts from a clean database.
    from mongoengine.connection import get_db

    db = get_db()
    for collection_name in db.list_collection_names():
        db.drop_collection(collection_name)
    mongoengine.disconnect(alias="default")


@pytest.fixture
def client(app):
    return app.test_client()


def register_and_login(client, email="user@example.com", password="secret123"):
    client.post("/api/register", json={"email": email, "password": password})
    response = client.post("/api/login", json={"email": email, "password": password})
    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
