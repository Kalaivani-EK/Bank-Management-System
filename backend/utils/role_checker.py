from flask_jwt_extended import get_jwt_identity

from models.customer import Customer
from models.user import User


def get_current_user():

    identity = get_jwt_identity()

    user_type, user_id = identity.split(":")

    if user_type == "customer":
        return Customer.query.get(int(user_id))

    return User.query.get(int(user_id))