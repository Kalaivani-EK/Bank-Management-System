from database.db import db
from datetime import datetime

class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.Integer, primary_key=True)
    receipt_id = db.Column(db.String(80), unique=True, nullable=False)
    transaction_id = db.Column(db.Integer, nullable=False)
    sender_account = db.Column(db.String(50), nullable=False)
    receiver_account = db.Column(db.String(50), nullable=False)
    sender_name = db.Column(db.String(120), nullable=False)
    receiver_name = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transfer_type = db.Column(db.String(50), nullable=False)
    transaction_charges = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), nullable=False, default="Success")
    remaining_balance = db.Column(db.Float, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, receipt_id=None, transaction_id=None, sender_account=None, receiver_account=None,
                 sender_name=None, receiver_name=None, amount=0.0, transfer_type=None,
                 transaction_charges=0.0, status="Success", remaining_balance=0.0,
                 generated_at=None, **kwargs):
        super().__init__()
        self.receipt_id = receipt_id
        self.transaction_id = transaction_id
        self.sender_account = sender_account
        self.receiver_account = receiver_account
        self.sender_name = sender_name
        self.receiver_name = receiver_name
        self.amount = amount
        self.transfer_type = transfer_type
        self.transaction_charges = transaction_charges
        self.status = status
        self.remaining_balance = remaining_balance
        self.generated_at = generated_at or datetime.utcnow()
