from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_toastr import Toastr
from flask_marshmallow import Marshmallow


db = SQLAlchemy()
toastr = Toastr()
login_manager = LoginManager()
ma = Marshmallow()
