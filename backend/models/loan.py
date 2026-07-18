from database.db import db

class LoanApplication(db.Model):
    __tablename__ = "loan_applications"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=False
    )

    loan_type = db.Column(
        db.String(50),
        nullable=False
    )

    amount_requested = db.Column(
        db.Float,
        nullable=False
    )

    duration_months = db.Column(
        db.Integer,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="Pending"
    )

    remarks = db.Column(
        db.Text,
        nullable=True
    )

    approved_at = db.Column(
        db.DateTime,
        nullable=True
    )

    def __init__(self, customer_id=None, loan_type=None, amount_requested=None, duration_months=None, status="Pending", remarks=None, approved_at=None, **kwargs):
        super().__init__()
        self.customer_id = customer_id
        self.loan_type = loan_type
        self.amount_requested = amount_requested
        self.duration_months = duration_months
        self.status = status
        self.remarks = remarks
        self.approved_at = approved_at