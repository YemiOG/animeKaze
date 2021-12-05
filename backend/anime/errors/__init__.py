from flask import Blueprint

err = Blueprint('errors', __name__)

from . import handlers
