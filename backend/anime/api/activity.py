from . import api
from flask import request,url_for,jsonify
from flask_jwt_extended import jwt_required
from ..models import User, Post
from .. import db
from .errors import bad_request

@api.route('/search', methods=['POST'])
def search_user():
	usrname = request.json.get("username", None).lower()
	user = User.query.filter_by(username = usrname).first_or_404().to_dict()
	if user is None:
		user = User.query.filter_by(first_name == usrname).first_or_404().to_dict()
	if user is None:
		user = User.query.filter(User.last_name == usrname).first_or_404().to_dict()
	response=user
	return response

@api.route('/<username>/posts/', methods=['GET'])
# @jwt_required()
def get_posts(username):
	user = User.query.filter_by(username=username).first_or_404()
	page = request.args.get('page', 1, type=int)
	per_page = min(request.args.get('per_page', 10, type=int), 100)
	response = User.to_collection_dict(user.posts, page, per_page, 
										'api.get_posts', username=username)
	return response

# @api.route('/explore', methods=['GET'])
# @jwt_required()
# def explore():
#     posts = Post.query.order_by(Post.timestamp.desc()).all()
#     if len(posts) != 0:
#         if len(posts) > 100:
#             posts = random.sample(posts, k=50)
#         else:
#             posts = random.sample(posts, k=len(posts))
#     return render_template('main/explore.html', posts=posts)
