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