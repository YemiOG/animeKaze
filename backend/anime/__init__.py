from flask import Flask
from config import Config
from flask_migrate import Migrate
import cloudinary
import logging
from logging.handlers import RotatingFileHandler
import os
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_toastr import Toastr
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager

app = Flask(__name__)

app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
toastr = Toastr(app)
login_manager = LoginManager(app)
ma = Marshmallow(app)
jwt = JWTManager(app)
mail = Mail(app)

login_manager.login_view = 'auth.login'
cloudinary.config(cloud_name=os.getenv('CLOUD_NAME'), api_key=os.getenv('API_KEY'), 
                  api_secret=os.getenv('API_SECRET'))

if not app.debug:

    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/recipe.log', maxBytes=10240,
                                       backupCount=10)
    file_handler.setFormatter(logging.Formatter(
      '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    app.logger.info('Anime world')

# blueprint for app api
from .api import api as api_blueprint
app.register_blueprint(api_blueprint, url_prefix='/api')
