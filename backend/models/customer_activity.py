from backend.database.db import db
from datetime import datetime

class CustomerActivity(db.Model):
    __tablename__ = "customer_activities"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False) # Deposit, Transfer, Withdrawal, Login, Password Change, Profile Update
    description = db.Column(db.String(255), nullable=False)
    ip_address = db.Column(db.String(50), default="127.0.0.1")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, customer_id=None, activity_type=None, description=None, ip_address="127.0.0.1", **kwargs):
        super().__init__()
        self.customer_id = customer_id
        self.activity_type = activity_type
        self.description = description
        self.ip_address = ip_address
