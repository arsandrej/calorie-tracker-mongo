from datetime import datetime, date as date_cls

import mongoengine as me


class User(me.Document):
    """A registered user.

    Stored in the `users` collection. `email` has a unique index so Mongo
    itself enforces uniqueness even under concurrent writes across replicas.
    """

    meta = {
        "collection": "users",
        "indexes": [
            {"fields": ["email"], "unique": True},
        ],
    }

    email = me.StringField(required=True, max_length=255)
    password_hash = me.StringField(required=True, max_length=255)
    created_at = me.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Entry(me.Document):
    """A single logged food entry, scoped to one user.

    `user_id` stores the owning User's ObjectId as a plain string (not a
    Mongo DBRef) so lookups stay simple and index-friendly. The compound
    index on (user_id, date) mirrors the Postgres index this schema
    replaces, and is what keeps `/api/entries` and `/api/history` fast as
    the entries collection grows and gets distributed across replicas.
    """

    meta = {
        "collection": "entries",
        "indexes": [
            {"fields": ["user_id", "date"]},
            {"fields": ["user_id", "-created_at"]},
        ],
    }

    user_id = me.StringField(required=True)
    date = me.DateField(required=True, default=date_cls.today)
    description = me.StringField(required=True, max_length=255)
    calories = me.IntField(required=True, min_value=1)
    protein_g = me.FloatField(default=0)
    carbs_g = me.FloatField(default=0)
    fat_g = me.FloatField(default=0)
    created_at = me.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "date": self.date.isoformat(),
            "description": self.description,
            "calories": self.calories,
            "protein_g": self.protein_g,
            "carbs_g": self.carbs_g,
            "fat_g": self.fat_g,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
