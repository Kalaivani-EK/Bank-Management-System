from backend.database.db import db
from backend.models.notification import Notification

class NotificationService:
    @staticmethod
    def create_notification(customer_id, title, message, notification_type="general", db_session=None):
        """
        Creates a notification for a customer.
        Adds the notification object to the provided session (or db.session)
        so it commits within the same transaction as the parent action.
        """
        session = db_session if db_session is not None else db.session
        try:
            notification = Notification(
                customer_id=customer_id,
                title=title,
                message=message,
                type=notification_type
            )
            session.add(notification)
            return notification
        except Exception as e:
            print(f"Error creating notification: {e}")
            return None
