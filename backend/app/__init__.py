import os
from flask import Flask
from flask_cors import CORS
import mongoengine

from app.extensions import jwt


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")

    # MONGODB_URI accepts a full connection string, including replica-set
    # syntax such as:
    #   mongodb://mongo1,mongo2,mongo3/calorie_tracker?replicaSet=rs0
    # PyMongo (under MongoEngine) discovers the current primary from this
    # seed list and automatically reconnects to the new primary on
    # failover -- the application code never needs to know which node is
    # primary at any given moment.
    app.config["MONGODB_URI"] = os.environ.get(
        "MONGODB_URI", "mongodb://localhost:27017/calorie_tracker"
    )

    if test_config:
        app.config.update(test_config)

    # mongoengine keeps a process-wide registry of connections keyed by
    # alias, so re-creating the app (as the test suite does, once per test)
    # must disconnect any previous connection on the same alias first.
    mongoengine.disconnect(alias="default")

    if test_config and test_config.get("MONGO_CLIENT_CLASS"):
        # Used by the pytest suite to swap in mongomock's in-memory client
        # instead of talking to a real MongoDB server.
        mongoengine.connect(
            host=app.config["MONGODB_URI"],
            mongo_client_class=test_config["MONGO_CLIENT_CLASS"],
            alias="default",
        )
    else:
        mongoengine.connect(
            host=app.config["MONGODB_URI"],
            uuidRepresentation="standard",
            alias="default",
        )

    jwt.init_app(app)

    allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*")
    if allowed_origins == "*":
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        origins_list = [origin.strip() for origin in allowed_origins.split(",")]
        CORS(app, resources={r"/api/*": {"origins": origins_list}}, supports_credentials=True)

    from app.routes.auth import auth_bp
    from app.routes.entries import entries_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(entries_bp)

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    @app.get("/health/db")
    def health_check_db():
        """Confirms the app can actually reach the MongoDB replica set,
        not just that the process is running. Useful as a separate
        Kubernetes readiness probe target, distinct from liveness."""
        from mongoengine.connection import get_db

        try:
            get_db().command("ping")
            return {"status": "healthy", "database": "connected"}
        except Exception as exc:  # pragma: no cover - failure path
            return {"status": "unhealthy", "database": str(exc)}, 503

    return app
