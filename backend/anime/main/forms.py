from flask_login import current_user
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, IntegerField, FileField, \
                    SubmitField
from wtforms.validators import Length, Regexp
from wtforms import ValidationError
from ..models import User


class EditProfileForm(FlaskForm):
    class Meta:
        csrf = False

    name = StringField('name', validators=[Length(0, 64)])
    username = StringField('username',
                           validators=[Length(1, 64),
                                       Regexp('^[A-Za-z][A-Za-z0-9_.]*$', 0,
                                              'Usernames must have only \
                                               letters, numbers, dots or '
                                              'underscores')])
    about_me = TextAreaField('about_me')
    update = SubmitField('Update')

    def validate_username(self, field):
        if field.data and field.data != current_user.username:
            if User.query.filter_by(username=field.data).first():
                raise ValidationError('Username already in use.')


class SearchForm(FlaskForm):
    class Meta:
        csrf = False

    username = StringField('username', validators=[Length(0, 64)])
    search = SubmitField('Search')


class PostForm(FlaskForm):

    class Meta:
        csrf = False

    # username = StringField('Username', validators=[DataRequired()])
    recipe = StringField('recipe', validators=[Length(min=0, max=440)])
    ingrdts = StringField('ingredients', validators=[Length(min=0, max=440)])
    cksteps = StringField('cooking steps', validators=[Length(min=0, max=440)])
    cktime = StringField('cooking time', validators=[Length(min=0, max=440)])
    picture = FileField('image')
    postTime = StringField('time', validators=[Length(min=0, max=10)])
    uSerId = IntegerField('uid')
    newPost = SubmitField('Post')
