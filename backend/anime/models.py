import os
import base64
import jwt
from anime import app
from time import time
from flask_login import UserMixin
from flask import url_for
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db, login_manager
from .baseModel import BaseModel
from datetime import datetime, timedelta

followers = db.Table('followers',
                     db.Column('follower_id', db.Integer,
                               db.ForeignKey('user.id')),
                     db.Column('followed_id',
                               db.Integer, db.ForeignKey('user.id'))
                     )

class PaginatedAPIMixin(object):
    @staticmethod
    def to_collection_dict(query, page, per_page, endpoint, **kwargs):
        resources = query.paginate(page, per_page, False)
        data = {
            'items': [item.to_dict() for item in resources.items],
            '_meta': {
                'page': page,
                'per_page': per_page,
                'total_pages': resources.pages,
                'total_items': resources.total
            },
            '_links': {
                'self': url_for(endpoint, page=page, per_page=per_page,
                                **kwargs),
                'next': url_for(endpoint, page=page + 1, per_page=per_page,
                                **kwargs) if resources.has_next else None,
                'prev': url_for(endpoint, page=page - 1, per_page=per_page,
                                **kwargs) if resources.has_prev else None
            }
        }
        return data
        
class User(PaginatedAPIMixin, db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)  # primary keys are required
    # by SQLAlchemy
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    avatar = db.Column(db.String(128))
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def followed_posts(self):
        followed = Post.query.join(
            followers, (followers.c.followed_id == Post.user_id)).filter(
                followers.c.follower_id == self.id)
        own = Post.query.filter_by(user_id=self.id)
        return followed.union(own).order_by(Post.timestamp.desc())
    
    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            app.config['SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, app.config['SECRET_KEY'],
                            algorithms=['HS256'])['reset_password']
        except:
            return
        return User.query.get(id)


    def to_dict(self):
        data = {
            'id': self.id,
            'firstname': self.first_name,
            'lastname': self.last_name,
            'username': self.username,
            'last_seen': self.last_seen.isoformat() + 'Z',
            'about_me': self.about_me,
            'avatar': self.avatar,
            'post_count': self.posts.count(),
            'follower_count': self.followers.count(),
            'followed_count': self.followed.count(),
            '_links': {
                'self': url_for('api.get_user', username=self.username),
                'followers': url_for('api.get_followers', username=self.username),
                'followed': url_for('api.get_followed', username=self.username),
                'posts':url_for('api.get_posts', username=self.username)
            }
        }
        return data

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'username', 'email', 'about_me']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.set_password(data['password'])
    
    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)


class Post(PaginatedAPIMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(360))
    image = db.Column(db.String(360))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Post {}>'.format(self.recipe)
    
    def to_dict(self):
        data = {
            'id': self.id,
            'content': self.content,
            'image': self.image,
        }
        return data


@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in
    # the query for the user
    return User.query.get(int(user_id))

# class User(UserMixin, BaseModel):
#     __tablename__ = 'user'

#     id = db.Column(db.Integer, primary_key=True)  # primary keys are required
#     # by SQLAlchemy
#     name = db.Column(db.String(64), index=True)
#     username = db.Column(db.String(64), index=True, unique=True)
#     email = db.Column(db.String(120), index=True, unique=True)
#     password_hash = db.Column(db.String(128))
#     posts = db.relationship('Post', backref='author', lazy='dynamic')
#     about_me = db.Column(db.String(140))
#     last_seen = db.Column(db.DateTime, default=datetime.utcnow)
#     followed = db.relationship(
#         'User', secondary=followers,
#         primaryjoin=(followers.c.follower_id == id),
#         secondaryjoin=(followers.c.followed_id == id),
#         backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

#     def __repr__(self):
#         return '<User {}>'.format(self.username)

#     def follow(self, user):
#         if not self.is_following(user):
#             self.followed.append(user)

#     def unfollow(self, user):
#         if self.is_following(user):
#             self.followed.remove(user)

#     def is_following(self, user):
#         return self.followed.filter(
#             followers.c.followed_id == user.id).count() > 0

#     def set_password(self, password):
#         self.password_hash = generate_password_hash(password)

#     def check_password(self, password):
#         return check_password_hash(self.password_hash, password)

#     def followed_posts(self):
#         followed = Post.query.join(
#             followers, (followers.c.followed_id == Post.user_id)).filter(
#                 followers.c.follower_id == self.id)
#         own = Post.query.filter_by(user_id=self.id)
#         return followed.union(own).order_by(Post.timestamp.desc())


# class Post(BaseModel):
#     id = db.Column(db.Integer, primary_key=True)
#     recipe = db.Column(db.String(360))
#     ingredients = db.Column(db.String(360))
#     cookingSteps = db.Column(db.String(360))
#     cookingTime = db.Column(db.String(10))
#     image = db.Column(db.String(360))
#     timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

#     def __repr__(self):
#         return '<Post {}>'.format(self.recipe)


# @login_manager.user_loader
# def load_user(user_id):
#     # since the user_id is just the primary key of our user table, use it in
#     # the query for the user
#     return User.query.get(int(user_id))
