from datetime import date, datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from mongoengine.errors import ValidationError

from app.models import Entry

entries_bp = Blueprint("entries", __name__, url_prefix="/api")


def _parse_date(value: str | None) -> date:
    if not value:
        return date.today()
    try:
        return date.fromisoformat(value)
    except ValueError:
        return date.today()


def _totals(entries: list[Entry]) -> dict:
    return {
        "calories": sum(e.calories for e in entries),
        "protein_g": round(sum(e.protein_g for e in entries), 1),
        "carbs_g": round(sum(e.carbs_g for e in entries), 1),
        "fat_g": round(sum(e.fat_g for e in entries), 1),
    }


@entries_bp.get("/entries")
@jwt_required()
def get_entries():
    """Entries + totals for a single day (defaults to today)."""
    user_id = get_jwt_identity()
    target_date = _parse_date(request.args.get("date"))

    entries = list(
        Entry.objects(user_id=user_id, date=target_date).order_by("-created_at")
    )
    return jsonify(
        {
            "date": target_date.isoformat(),
            "entries": [e.to_dict() for e in entries],
            "totals": _totals(entries),
        }
    )


@entries_bp.post("/entries")
@jwt_required()
def create_entry():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    description = (data.get("description") or "").strip()
    calories = data.get("calories")

    if not description:
        return jsonify({"detail": "Description is required"}), 422
    if not isinstance(calories, (int, float)) or calories <= 0:
        return jsonify({"detail": "Calories must be a positive number"}), 422

    entry = Entry(
        user_id=user_id,
        date=_parse_date(data.get("date")),
        description=description,
        calories=int(calories),
        protein_g=float(data.get("protein_g") or 0),
        carbs_g=float(data.get("carbs_g") or 0),
        fat_g=float(data.get("fat_g") or 0),
    )
    entry.save()
    return jsonify(entry.to_dict()), 201


@entries_bp.put("/entries/<entry_id>")
@jwt_required()
def update_entry(entry_id):
    user_id = get_jwt_identity()
    try:
        entry = Entry.objects(id=entry_id, user_id=user_id).first()
    except ValidationError:
        # entry_id wasn't a well-formed ObjectId
        return jsonify({"detail": "Entry not found"}), 404

    if not entry:
        return jsonify({"detail": "Entry not found"}), 404

    data = request.get_json(silent=True) or {}

    if "description" in data:
        description = (data.get("description") or "").strip()
        if not description:
            return jsonify({"detail": "Description cannot be empty"}), 422
        entry.description = description
    if "calories" in data:
        calories = data.get("calories")
        if not isinstance(calories, (int, float)) or calories <= 0:
            return jsonify({"detail": "Calories must be a positive number"}), 422
        entry.calories = int(calories)
    if "protein_g" in data:
        entry.protein_g = float(data.get("protein_g") or 0)
    if "carbs_g" in data:
        entry.carbs_g = float(data.get("carbs_g") or 0)
    if "fat_g" in data:
        entry.fat_g = float(data.get("fat_g") or 0)
    if "date" in data:
        entry.date = _parse_date(data.get("date"))

    entry.save()
    return jsonify(entry.to_dict())


@entries_bp.delete("/entries/<entry_id>")
@jwt_required()
def delete_entry(entry_id):
    user_id = get_jwt_identity()
    try:
        entry = Entry.objects(id=entry_id, user_id=user_id).first()
    except ValidationError:
        return jsonify({"detail": "Entry not found"}), 404

    if not entry:
        return jsonify({"detail": "Entry not found"}), 404

    entry.delete()
    return "", 204


@entries_bp.get("/history")
@jwt_required()
def get_history():
    """Aggregated daily totals for the last N days (default 7), most recent first."""
    user_id = get_jwt_identity()
    try:
        days = int(request.args.get("days", 7))
    except ValueError:
        days = 7
    days = max(1, min(days, 90))

    start_date = date.today() - timedelta(days=days - 1)
    start_datetime = datetime(start_date.year, start_date.month, start_date.day)

    # MongoDB aggregation pipeline -- the equivalent of the SQL
    # GROUP BY/func.sum() query, run server-side on whichever replica
    # is serving reads, so the heavy grouping work never has to ship
    # raw documents back to the app layer.
    pipeline = [
        {"$match": {"user_id": user_id, "date": {"$gte": start_datetime}}},
        {
            "$group": {
                "_id": "$date",
                "calories": {"$sum": "$calories"},
                "protein_g": {"$sum": "$protein_g"},
                "carbs_g": {"$sum": "$carbs_g"},
                "fat_g": {"$sum": "$fat_g"},
            }
        },
        {"$sort": {"_id": -1}},
    ]

    rows = list(Entry.objects.aggregate(pipeline))

    history = [
        {
            "date": row["_id"].date().isoformat()
            if isinstance(row["_id"], datetime)
            else row["_id"].isoformat(),
            "calories": int(row.get("calories") or 0),
            "protein_g": round(row.get("protein_g") or 0, 1),
            "carbs_g": round(row.get("carbs_g") or 0, 1),
            "fat_g": round(row.get("fat_g") or 0, 1),
        }
        for row in rows
    ]
    return jsonify(history)
