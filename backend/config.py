class Config:
    SECRET_KEY = "bank_secret_key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///bank.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False