from flask import Blueprint

api = Blueprint('api', __name__)

from . import users, tokens, errors, auth, activity, email
