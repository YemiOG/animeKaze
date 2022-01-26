import os
import base64
import jwt
import random
from anime import app
from time import time
from flask_login import UserMixin
from flask import url_for
from sqlalchemy import and_,not_, or_
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db, login_manager
from .baseModel import BaseModel
from datetime import datetime, timedelta

#table for followed and following users
followers = db.Table('followers',
                     db.Column('follower_id', db.Integer,
                               db.ForeignKey('user.id')),
                     db.Column('followed_id',
                               db.Integer, db.ForeignKey('user.id'))
                    )

#table for posts user is not interested in
notInterested = db.Table('notInterested',
                     db.Column('post_id', db.Integer,
                               db.ForeignKey('post.id')),
                     db.Column('person_id', db.Integer,
                                db.ForeignKey('user.id'))
                    )

#table for posts reported by user
reportedPost = db.Table('reportedPost',
                     db.Column('post_id', db.Integer,
                               db.ForeignKey('post.id')),
                     db.Column('person_id', db.Integer,
                                db.ForeignKey('user.id'))
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
    comment = db.relationship('Comment', backref='author', lazy='dynamic')
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

        #get count of reported posts by post id 
        reported_count = db.session.query(
                            reportedPost.c.post_id, func.count('*').label('reporting')
                            ).group_by(reportedPost.c.post_id).subquery()

        #get posts from user's followers minus reported posts
        followed = db.session.query(Post).join(
            followers, (followers.c.followed_id == Post.user_id)).outerjoin(
                reported_count).outerjoin(reportedPost).filter(
                followers.c.follower_id == self.id).filter(
                or_(reportedPost.c.person_id != self.id, reportedPost.c.person_id == None)).filter(
                    or_(reported_count.c.reporting < 2 , reportedPost.c.person_id == None))

        #get user's own posts 
        own = Post.query.filter_by(user_id=self.id)

        #combine and return both filtered post queries
        return followed.union(own).order_by(Post.timestamp.desc(), func.random())
    
    def filter_posts(self):
        #get count of not interested posts by post id 
        no_intrst_count = db.session.query(
                            notInterested.c.post_id, func.count('*').label('not_interest_count')
                            ).group_by(notInterested.c.post_id).subquery()
        #filter out posts user doesn't want to see
        explore= db.session.query(Post).filter(Post.user_id != self.id).outerjoin(
            no_intrst_count).outerjoin(notInterested).filter(
                or_(notInterested.c.person_id != self.id, notInterested.c.person_id == None)).filter(
                    or_(no_intrst_count.c.not_interest_count < 2 , notInterested.c.person_id == None))

        return explore.order_by(Post.timestamp.desc())
    
    
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
                'followed': url_for('api.get_followed', username=self.username)
            }
        }
        return data

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'username', 'email', 'about_me']:
            if field in data:
                setattr(self, field, data[field].lower())
        if new_user and 'password' in data:
            self.set_password(data['password'])
    
    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)

#table for liked posts
likedPosts = db.Table('likedPosts',
                     db.Column('post_id', db.Integer,
                               db.ForeignKey('post.id')),
                     db.Column('liker_id', db.Integer,
                                db.ForeignKey('user.id'))
                    )

class Post(PaginatedAPIMixin, db.Model):
    __tablename__ = "post"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(360))
    image = db.Column(db.String(360))
    comments = db.relationship('Comment', backref='post', lazy='dynamic')
    likes= db.relationship(
        'User', secondary=likedPosts,
        backref=db.backref('likedPosts', lazy='dynamic'), lazy='dynamic')
    not_interested= db.relationship(
        'User', secondary=notInterested,
        backref=db.backref('notInterested', lazy='dynamic'), lazy='dynamic')
    reported= db.relationship(
        'User', secondary=reportedPost,
        backref=db.backref('reportedPost', lazy='dynamic'), lazy='dynamic')
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Post {}>'.format(self.content)
    
    def like_state(self, user):
        if not self.liked(user):
            self.likes.append(user)
        else:
            self.likes.remove(user)
    
    def liked(self, user):
        return self.likes.filter(likedPosts.c.liker_id == user.id).count() > 0
    
    def no_interest(self, user):
        if not self.interested(user):
            self.not_interested.append(user)
        else:
            self.not_interested.remove(user)
    
    def interested(self, user):
        return self.not_interested.filter(notInterested.c.person_id == user.id).count() > 0

    def report(self, user):
        if not self.post_reported(user):
            self.reported.append(user)
        else:
            print('no longer reported')
            self.reported.remove(user)

    def post_reported(self, user):
        return self.reported.filter(reportedPost.c.person_id == user.id).count() > 0
    
    def to_dict(self):
        data = {
            'id': self.id,
            'content': self.content,
            'image': self.image,
            'likes': self.likes.count(),
            # 'comments': self.comments,
            # 'reported' : self.reported
        }
        return data

class Comment(PaginatedAPIMixin, db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True)
    comments= db.Column(db.String(360))
    timestamps = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Comment from user {}>'.format(self.user_id)
    
    def to_dict(self):
        user = db.session.query(User).filter_by(id=self.user_id).all()
        data = {
            'id': self.id,
            'content': self.comments,
            'username': user[0].username,
            # 'reported' : self.reported
        }
        return data

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in
    # the query for the user
    return User.query.get(int(user_id))
