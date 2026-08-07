from backend.database.db import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=False
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    type = db.Column(
        db.String(50),
        nullable=False,
        default="general"
    )

    is_read = db.Column(
        db.Boolean,
        default=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __init__(self, customer_id=None, title=None, message=None, type="general", is_read=False, created_at=None, **kwargs):
        super().__init__()
        self.customer_id = customer_id
        self.title = title
        self.message = message
        self.type = type
        self.is_read = is_read
        if created_at is not None:
            self.created_at = created_at
        else:
            self.created_at = datetime.utcnow()

    def to_dict(self):
        created_at_str = None
        if self.created_at:
            iso = self.created_at.isoformat()
            created_at_str = iso if iso.endswith("Z") else iso + "Z"
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": created_at_str
        }

    def __repr__(self):
        return f"<Notification {self.id} - {self.title}>"
