from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from mongoengine.errors import NotUniqueError

from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or "@" not in email:
        return jsonify({"detail": "A valid email is required"}), 422
    if len(password) < 6:
        return jsonify({"detail": "Password must be at least 6 characters"}), 422

    if User.objects(email=email).first():
        return jsonify({"detail": "Email already registered"}), 400

    user = User(email=email, password_hash=generate_password_hash(password))
    try:
        user.save()
    except NotUniqueError:
        # Belt-and-suspenders: the unique index on `email` catches the
        # race condition between the check above and this write, which
        # matters once multiple backend replicas are writing concurrently.
        return jsonify({"detail": "Email already registered"}), 400

    return jsonify({"message": "User created successfully", "user_id": str(user.id)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.objects(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"detail": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "token_type": "bearer"}), 200
