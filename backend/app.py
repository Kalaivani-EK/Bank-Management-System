from flask import Flask
from config import Config
from database.db import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

@app.route("/")
def home():
    return "Bank Management Backend Running"

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)