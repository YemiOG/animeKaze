import jwt
from anime import app
from time import time
from flask_login import UserMixin
from flask import url_for
from sqlalchemy import or_,delete
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from . import db, login_manager
from datetime import datetime, timedelta

# table for followed and following users
followers = db.Table('followers',
                     db.Column('follower_id', db.Integer,
                               db.ForeignKey('user.id')),
                     db.Column('followed_id',
                               db.Integer, db.ForeignKey('user.id'))
                     )

# table for posts user is not interested in
notInterested = db.Table('notInterested',
                         db.Column('post_id', db.Integer,
                                   db.ForeignKey('post.id')),
                         db.Column('person_id', db.Integer,
                                   db.ForeignKey('user.id'))
                         )

# table for posts reported by user
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

#default image
image = 'https://res.cloudinary.com/nagatodev/image/upload/v1644138637/No%20picture/no_picture.png'
class User(PaginatedAPIMixin, db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)  # primary keys are required
    # by SQLAlchemy
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    avatar = db.Column(db.String(128), default=image)
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comment = db.relationship('Comment', backref='author', lazy='dynamic')
    child_comment = db.relationship('ChildComment', backref='author',
                                    lazy='dynamic')
    about_me = db.Column(db.String(140))
    gender = db.Column(db.String(140))
    location = db.Column(db.String(140))
    date_of_birth = db.Column(db.String(140))
    twitter = db.Column(db.String(140))
    instagram = db.Column(db.String(140))
    facebook = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0

    def followed_posts(self):

        # get count of reported posts by post id
        reported_count = db.session.query(
                            reportedPost.c.post_id, func.count('*').label(
                             'reporting')).group_by(
                             reportedPost.c.post_id).subquery()
        
        # # get count of not interested posts by post id
        # no_intrst_count = db.session.query(
        #                     notInterested.c.post_id, func.count('*').label(
        #                      'not_interest_count')).group_by(
        #                         notInterested.c.post_id).subquery()

        # followed = db.session.query(Post).join(
        #             followers, (followers.c.followed_id == Post.user_id)).outerjoin(
        #                 no_intrst_count).outerjoin(notInterested).outerjoin(
        #                     reported_count).outerjoin(reportedPost).filter(
        #                         followers.c.follower_id == self.id).filter(
        #                             or_(notInterested.c.person_id != self.id, notInterested.c.person_id == None)).filter(
        #                                 or_(no_intrst_count.c.not_interest_count < 2,
        #                                     notInterested.c.person_id == None)).filter(
        #                                             or_(reportedPost.c.person_id != self.id,
        #                                                 reportedPost.c.person_id == None)).filter(
        #                                                     or_(reported_count.c.reporting < 2, reportedPost.c.person_id == None))

        # get posts from user's followers minus reported posts
        followed = db.session.query(Post).join(
                    followers, (followers.c.followed_id == Post.user_id)).outerjoin(
                        reported_count).outerjoin(reportedPost).filter(
                        followers.c.follower_id == self.id).filter(
                        or_(reportedPost.c.person_id != self.id,
                            reportedPost.c.person_id == None)).filter(
                            or_(reported_count.c.reporting < 2, reportedPost.c.person_id == None))
       
        # get user's own posts
        own = Post.query.filter_by(user_id=self.id)

        # combine and return both filtered post queries
        return followed.union(own).order_by(Post.timestamp.desc())
        # return followed.union(own).order_by(Post.timestamp.desc(), func.random())

    def filter_posts(self):
        # get count of not interested posts by post id
        no_intrst_count = db.session.query(
                            notInterested.c.post_id, func.count('*').label(
                             'not_interest_count')).group_by(
                                notInterested.c.post_id).subquery()
        # get count of reported posts by post id
        reported_count = db.session.query(
                            reportedPost.c.post_id, func.count('*').label(
                             'reporting')).group_by(
                             reportedPost.c.post_id).subquery()

        # filter out posts user doesn't want to see
        explore = db.session.query(Post).filter(
            Post.user_id != self.id).outerjoin(
            no_intrst_count).outerjoin(notInterested).outerjoin(
                reported_count).outerjoin(reportedPost).filter(
                or_(notInterested.c.person_id != self.id, notInterested.c.person_id == None)).filter(
                    or_(no_intrst_count.c.not_interest_count < 2,
                        notInterested.c.person_id == None)).filter(
                                or_(reportedPost.c.person_id != self.id,
                                    reportedPost.c.person_id == None)).filter(
                                        or_(reported_count.c.reporting < 2, reportedPost.c.person_id == None))

        # explore = db.session.query(Post).filter(
        #     Post.user_id != self.id).outerjoin(
        #     no_intrst_count).outerjoin(notInterested).filter(
        #         or_(notInterested.c.person_id != self.id, notInterested.c.person_id == None)).filter(
        #             or_(no_intrst_count.c.not_interest_count < 2,
        #                 notInterested.c.person_id == None))

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

    def to_dict(self, include_email=False):
        data = {
            'id': self.id,
            'firstname': self.first_name,
            'lastname': self.last_name,
            'username': self.username,
            'last_seen': self.last_seen.isoformat() + 'Z',
            'about_me': self.about_me,
            'gender': self.gender,
            'location': self.location,
            'dob': self.date_of_birth,
            'twitter': self.twitter,
            'instagram': self.instagram,
            'facebook': self.facebook,
            'avatar': self.avatar,
            'post_count': self.posts.count(),
            'follower_count': self.followers.count(),
            'followed_count': self.followed.count(),
            '_links': {
                'self': url_for('api.get_user', uzername=self.username),
                'followers': url_for('api.get_followers', uzername=self.username),
                'followed': url_for('api.get_followed', uzername=self.username)
            }
        }
        if include_email:
            data['email'] = self.email
        return data

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'username', 'email', 'about_me', 'gender', 'location' , 'dob' ,'twitter' , 'instagram', 'facebook']:
            if field in data:
                setattr(self, field, data[field].lower())
        if new_user and 'password' in data:
            self.set_password(data['password'])

    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)


# table for liked posts
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
    likes = db.relationship(
        'User', secondary=likedPosts,
        backref=db.backref('likedPosts', lazy='dynamic'), lazy='dynamic')
    not_interested = db.relationship(
        'User', secondary=notInterested,
        backref=db.backref('notInterested', lazy='dynamic'), lazy='dynamic')
    reported = db.relationship(
        'User', secondary=reportedPost,
        backref=db.backref('reportedPost', lazy='dynamic'), lazy='dynamic')
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    username= db.Column(db.String(360))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    liked_by_user= db.Column(db.Boolean, unique=False, default=False)

    def __repr__(self):
        return '<Post {}>'.format(self.content)

    def like_state(self, user):
        if not self.liked(user):
            self.likes.append(user)
            setattr(self, 'liked_by_user', True)
        else:
            self.likes.remove(user)
            setattr(self, 'liked_by_user', False)

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

    def get_user(self, user):
        return db.session.query(User).filter_by(id=user.user_id).first()

    def to_dict(self):
        user= self.get_user(self) 
        data = {
            'id': self.id,
            'content': self.content,
            'image': self.image,
            'likes': self.likes.count(),
            'poster': user.username,
            'fname': user.first_name,
            'lname': user.last_name,
            'avatar': user.avatar,
            'user_liked': self.liked_by_user,
        }
        return data


# table for liked comments
likedComments = db.Table('likedComments',
                         db.Column('comment_id', db.Integer,
                                   db.ForeignKey('comment.id')),
                         db.Column('liker_id', db.Integer,
                                   db.ForeignKey('user.id'))
                         )


class Comment(PaginatedAPIMixin, db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(360))
    comments = db.relationship('ChildComment', backref='comment', lazy='dynamic')
    likes = db.relationship(
            'User', secondary=likedComments,
            backref=db.backref('likedComments', lazy='dynamic'), lazy='dynamic')
    timestamps = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    username= db.Column(db.String(360))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    liked_by_user= db.Column(db.Boolean, unique=False, default=False)

    def __repr__(self):
        return '<Comment from user {}>'.format(self.user_id)

    def like_comment_state(self, user):
        if not self.liked_comment(user):
            self.likes.append(user)
            setattr(self, 'liked_by_user', True)
        else:
            self.likes.remove(user)
            setattr(self, 'liked_by_user', False)

    def liked_comment(self, user):
        return self.likes.filter(likedComments.c.liker_id == user.id).count() > 0
    
    def get_user(self,user):
        return db.session.query(User).filter_by(id=user.user_id).first()
        
    def to_dict(self):
        user= self.get_user(self) 
        data = {
            'id': self.id,
            'content': self.content,
            'poster': user.username,
            'fname': user.first_name,
            'lname': user.last_name,
            'avatar': user.avatar,
            'likes': self.likes.count(),
            'child': self.comments.count(),
            'user_liked': self.liked_by_user,
        }
        return data


# table for liked child comments
likedChildComments = db.Table('likedChildComments',
                              db.Column('comment_id', db.Integer,
                                        db.ForeignKey('childcomment.id')),
                              db.Column('liker_id', db.Integer,
                                        db.ForeignKey('user.id'))
                              )


class ChildComment(PaginatedAPIMixin, db.Model):
    __tablename__ = "childcomment"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(360))
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    likes = db.relationship(
            'User', secondary=likedChildComments,
            backref=db.backref('likedChildComments', lazy='dynamic'), lazy='dynamic')
    timestamps = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    username= db.Column(db.String(360))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    liked_by_user= db.Column(db.Boolean, unique=False, default=False)

    def __repr__(self):
        return '<Child Comment from user {}>'.format(self.user_id)

    def like_child_comment(self, user):
        if not self.liked_comment(user):
            self.likes.append(user)
            setattr(self, 'liked_by_user', True)
        else:
            self.likes.remove(user)
            setattr(self, 'liked_by_user', False)

    def liked_comment(self, user):
        return self.likes.filter(likedChildComments.c.liker_id == user.id).count() > 0

    def get_user(self, user):
        return db.session.query(User).filter_by(id=user.user_id).first()

    def to_dict(self):
        user= self.get_user(self) 
        data = {
            'id': self.id,
            'content': self.content,
            'comment': self.comment_id,
            'poster': user.username,
            'fname': user.first_name,
            'lname': user.last_name,
            'avatar': user.avatar,
            'likes': self.likes.count(),
            'user_liked': self.liked_by_user,
        }
        return data

def delete_account(user_id):
    user = User.query.filter_by(id=user_id)
    user_posts = Post.query.filter_by(user_id=user_id)
    user_comments = Comment.query.filter_by(user_id=user_id)
    user_child_comments = ChildComment.query.filter_by(user_id=user_id)

    for p in user_posts.all():
        related_comments = Comment.query.filter_by(post_id=p.id)
        for c in related_comments:
            child_comments = ChildComment.query.filter_by(comment_id=c.id)
            if child_comments.all():
                child_comments.delete()
                db.session.commit()
        related_comments.delete()
        db.session.commit()

    for com in user_comments.all():
        child_comments = ChildComment.query.filter_by(comment_id=com.id)
        if child_comments.all():
            child_comments.delete()
            db.session.commit()

    #Delete all liked posts
    delete_posts= delete(likedPosts).where(
        likedPosts.c.liker_id == user_id)
    db.session.execute(delete_posts)

    #Delete all liked comments
    delete_comments= delete(likedComments).where(
        likedComments.c.liker_id == user_id)
    db.session.execute(delete_comments)

    #Delete all liked child comments
    delete_child_comments= delete(likedChildComments).where(
        likedChildComments.c.liker_id == user_id)
    db.session.execute(delete_child_comments)

    user.delete()
    user_posts.delete()
    user_comments.delete()
    user_child_comments.delete()
    db.session.commit()

    return True

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in
    # the query for the user
    return User.query.get(int(user_id))
