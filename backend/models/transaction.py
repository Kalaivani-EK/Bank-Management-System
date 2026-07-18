from database.db import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)

    from_account_id = db.Column(
        db.Integer,
        nullable=False
    )

    to_account_id = db.Column(
        db.Integer
    )

    account_id = db.Column(
        db.Integer
    )

    transaction_type = db.Column(
        db.String(20),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="Completed"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __init__(self, from_account_id=None, to_account_id=None, account_id=None, transaction_type=None, amount=None, status="Completed", created_at=None, **kwargs):
        super().__init__()
        self.from_account_id = from_account_id
        self.to_account_id = to_account_id
        self.account_id = account_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.status = status
        self.created_at = created_at
