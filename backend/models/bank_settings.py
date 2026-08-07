from backend.database.db import db
from datetime import datetime

class BankSettings(db.Model):
    __tablename__ = "bank_settings"

    id = db.Column(db.Integer, primary_key=True)
    minimum_initial_deposit = db.Column(db.Float, nullable=False, default=1000.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, minimum_initial_deposit=1000.0, **kwargs):
        super().__init__(**kwargs)
        self.minimum_initial_deposit = minimum_initial_deposit

    @classmethod
    def get_settings(cls):
        settings = cls.query.first()
        if not settings:
            settings = cls(minimum_initial_deposit=1000.0)
            db.session.add(settings)
            db.session.commit()
        return settings
