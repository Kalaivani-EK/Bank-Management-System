from database.db import db

class SupportTicket(db.Model):
    __tablename__ = "support_tickets"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=False
    )

    subject = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="Open"
    )

    def __init__(self, customer_id=None, subject=None, description=None, status="Open", **kwargs):
        super().__init__()
        self.customer_id = customer_id
        self.subject = subject
        self.description = description
        self.status = status