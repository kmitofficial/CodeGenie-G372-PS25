from flask import Flask # type: ignore
from routes import register_routes

app = Flask(__name__)

register_routes(app)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
