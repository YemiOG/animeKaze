from datetime import datetime, timedelta
import unittest
from anime import app, db
from anime.models import User, Post, Comment, ChildComment


# Test User model
class UserModelCase(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_password_hashing(self):
        u = User(username='Luffy')
        u.set_password('pirate')
        self.assertFalse(u.check_password('piracy'))
        self.assertTrue(u.check_password('pirate'))

    def test_follow(self):
        u1 = User(username='johndoe', email='johndoe@example.com')
        u2 = User(username='goldroger', email='goldroger@example.com')
        db.session.add(u1)
        db.session.add(u2)
        db.session.commit()
        self.assertEqual(u1.followed.all(), [])
        self.assertEqual(u1.followers.all(), [])

        u1.follow(u2)
        db.session.commit()
        self.assertTrue(u1.is_following(u2))
        self.assertEqual(u1.followed.count(), 1)
        self.assertEqual(u1.followed.first().username, 'goldroger')
        self.assertEqual(u2.followers.count(), 1)
        self.assertEqual(u2.followers.first().username, 'johndoe')

        u1.unfollow(u2)
        db.session.commit()
        self.assertFalse(u1.is_following(u2))
        self.assertEqual(u1.followed.count(), 0)
        self.assertEqual(u2.followers.count(), 0)

    def test_follow_posts(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u2,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u4,
                  timestamp=now + timedelta(seconds=2))
        p5 = Post(content="Usopp is the pirate kings's sniper!!", author=u4,
                  timestamp=now + timedelta(seconds=1))

        db.session.add_all([p1, p2, p3, p4, p5])
        db.session.commit()

        # setup the followers
        u1.follow(u2)  # luffy follows sabo
        u1.follow(u4)  # luffy follows zoro
        u2.follow(u3)  # sabo follows ace
        u3.follow(u4)  # ace follows zoro
        db.session.commit()

        # check the followed posts of each user
        f1 = u1.followed_posts().all()
        f2 = u2.followed_posts().all()
        f3 = u3.followed_posts().all()
        f4 = u4.followed_posts().all()

        # check for posts by timestamp descending order
        self.assertEqual(f1, [p2, p4, p1, p5])
        # luffy can see his own post and that of sabo and zoro
        self.assertEqual(f2, [p2, p3])
        # sabo can see his own post and that of ace
        self.assertEqual(f3, [p3, p4, p5])
        # # ace can see his own post and that of zoro
        self.assertEqual(f4, [p4, p5])
        # zoro follows no one, so he can see only his own post

    def test_reported_posts(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u2,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u4,
                  timestamp=now + timedelta(seconds=2))
        p5 = Post(content="Usopp is the pirate kings's sniper!!", author=u4,
                  timestamp=now + timedelta(seconds=1))

        db.session.add_all([p1, p2, p3, p4, p5])
        db.session.commit()

        # setup the followers
        u1.follow(u2)  # luffy follows sabo
        u1.follow(u4)  # luffy follows zoro
        u2.follow(u3)  # sabo follows ace
        u2.follow(u1)  # sabo follows luffy
        u3.follow(u2)  # ace follows sabo
        u3.follow(u4)  # ace follows zoro
        u4.follow(u3)  # zoro follows ace
        db.session.commit()

        # report posts
        p1.report(u2)
        # post 1 reported by user2 named "sabo"
        p2.report(u3)
        # post 2 reported by user3 named "ace"
        p4.report(u1)
        # post 4 reported by user1 named "luffy"
        p3.report(u4)
        # post 3 reported by user4 named "zoro"
        db.session.commit()

        # check the followed posts of each user
        f1 = u1.followed_posts().all()
        f2 = u2.followed_posts().all()
        f3 = u3.followed_posts().all()
        f4 = u4.followed_posts().all()

        # check for posts by timestamp descending order excluding the reported posts 
        self.assertEqual(f1, [p2, p1, p5])
        # luffy can see his own post and that of sabo and zoro minus post 4 that he reported
        self.assertEqual(f2, [p2, p3])
        # sabo can see his own post and that of ace and luffy minus post 1 that he reported
        self.assertEqual(f3, [p3, p4, p5])
        # ace can see his own post and that of zoro minus sabo's post that he reported
        self.assertEqual(f4, [p4, p5])
        # zoro can see his own post minus ace's post that he reported

    def test_not_interested_in_posts(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u2,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u4,
                  timestamp=now + timedelta(seconds=2))
        p5 = Post(content="Usopp is the pirate kings's sniper!!", author=u4,
                  timestamp=now + timedelta(seconds=1))

        db.session.add_all([p1, p2, p3, p4, p5])
        db.session.commit()

        # mark posts as not interested
        p1.no_interest(u2)
        # post 1 reported by user2 named "sabo"
        p2.no_interest(u3)
        # post 2 reported by user3 named "ace"
        p4.no_interest(u1)
        # post 4 reported by user1 named "luffy"
        p3.no_interest(u4)
        # post 3 reported by user4 named "zoro"
        db.session.commit()

        # check the followed posts of each user
        f1 = u1.filter_posts().all()
        f2 = u2.filter_posts().all()
        f3 = u3.filter_posts().all()
        f4 = u4.filter_posts().all()

        # display all posts by timestamp descending order excluding posts user has no interest in
        self.assertEqual(f1, [p2, p3, p5])
        # luffy can see all other users' posts minus post 4 that he marked as not interested
        self.assertEqual(f2, [p3, p4, p5])
        # sabo can see all other users' posts minus post 1 that he marked as not interested
        self.assertEqual(f3, [p4, p5, p1])
        # ace can see all other users' posts minus post 2 that he marked as not interested
        self.assertEqual(f4, [p2, p1])
        # zoro can see all other users' posts minus post 3 that he marked as not interested


# Test Post model
class PostModelCase(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_report_posts(self):
        # create two users
        u1 = User(username='luffy', first_name='Monkey', last_name='D.luffy',
                  email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        db.session.add_all([u1, u2, u3])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # setup the followers
        u1.follow(u2)  # luffy follows sabo
        u2.follow(u1)  # sabo follows luffy
        db.session.commit()

        # report posts
        p1.report(u2)
        # post 1 reported by user2 named "sabo"
        p2.report(u2)
        # post 2 reported by user2 named "sabo"
        p2.report(u3)
        # post 2 reported by user3 named "ace"
        p4.report(u1)
        # post 4 reported by user1 named "luffy"
        db.session.commit()

        self.assertEqual(p1.reported.first(), u2)
        self.assertEqual(p2.reported.all(), [u2, u3])
        self.assertEqual(p4.reported.first(), u1)

        # confirm who reported which post
        self.assertFalse(p1.post_reported(u1))
        self.assertTrue(p1.post_reported(u2))

        # confirm who reported which post
        self.assertFalse(p4.post_reported(u2))
        self.assertTrue(p4.post_reported(u1))

    def test_interest_posts(self):
        # create two users
        u1 = User(username='luffy', first_name='Monkey', last_name='D.luffy',
                  email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        db.session.add_all([u1, u2, u3])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # mark posts as not interested
        p1.no_interest(u2)
        # post 1 reported by user2 named "sabo"
        p2.no_interest(u3)
        # post 2 reported by user3 named "ace"
        p4.no_interest(u1)
        # post 4 reported by user1 named "luffy"
        p3.no_interest(u1)
        # post 3 reported by user4 named "zoro"
        db.session.commit()

        # check the posts marked as not interested by the users
        self.assertEqual(p1.not_interested.all(), [u2])
        self.assertEqual(p2.not_interested.all(), [u3])
        self.assertEqual(p4.not_interested.all(), [u1])
        self.assertEqual(p3.not_interested.all(), [u1])

    def test_like_posts(self):
        # create three users
        u1 = User(username='luffy', first_name='Monkey', last_name='D.luffy',
                  email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        db.session.add_all([u1, u2])

        # create four posts
        now = datetime.utcnow()
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # like posts
        p1.like_state(u1)
        p1.like_state(u2)
        p1.like_state(u3)
        # post 1 reported by luffy and users 2 and 3
        p2.like_state(u2)
        p2.like_state(u3)
        # post 2 liked by sabo and user 3
        p4.like_state(u2)
        # post 4 reported by user2
        p3.like_state(u1)
        # post 3 reported by user1
        db.session.commit()

        # check the posts liked by the users
        self.assertEqual(p1.likes.all(), [u1, u2, u3])
        self.assertEqual(p2.likes.all(), [u2, u3])
        self.assertEqual(p4.likes.all(), [u2])
        self.assertEqual(p3.likes.all(), [u1])


# Test Comment model
class CommentModelCase(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_post_comment(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        now = datetime.utcnow()

        # create four posts
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # create comment on posts
        c1 = Comment(content="luffy the pirate king", author=u1,
                     timestamps=now + timedelta(seconds=1), post=p1)
        c2 = Comment(content="Sabo finally consumes the flare flare fruit ",
                     author=u2, post=p2,
                     timestamps=now + timedelta(seconds=4))
        c3 = Comment(content="Akainu must pay for killing ace :(",  author=u3,
                     post=p3, timestamps=now + timedelta(seconds=3))
        c4 = Comment(content="Zoro has gotten lost again. haha!!", author=u4,
                     post=p4, timestamps=now + timedelta(seconds=2))

        db.session.add_all([c1, c2, c3, c4])
        db.session.commit()

        # check the comments dropped by the users
        self.assertEqual(p1.comments.all(), [c1])
        self.assertEqual(p2.comments.all(), [c2])
        self.assertEqual(p3.comments.all(), [c3])
        self.assertEqual(p4.comments.all(), [c4])

    def test_like_comment(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        now = datetime.utcnow()

        # create four posts
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # create comment on posts
        c1 = Comment(content="luffy the pirate king", author=u1,
                     timestamps=now + timedelta(seconds=1), post=p1)
        c2 = Comment(content="Sabo finally consumes the flare flare fruit ",
                     author=u2, post=p2,
                     timestamps=now + timedelta(seconds=4))
        c3 = Comment(content="Akainu must pay for killing ace :(",  author=u3,
                     post=p3, timestamps=now + timedelta(seconds=3))
        c4 = Comment(content="Zoro has gotten lost again. haha!!", author=u4,
                     post=p4, timestamps=now + timedelta(seconds=2))

        db.session.add_all([c1, c2, c3, c4])
        db.session.commit()

        # like comments
        c1.like_comment_state(u1)
        c1.like_comment_state(u2)
        c1.like_comment_state(u3)
        # comment 1 reported by luffy and users 2 and 3
        c2.like_comment_state(u2)
        c2.like_comment_state(u3)
        # comment 2 liked by sabo and user 3
        c4.like_comment_state(u2)
        # comment 4 reported by user2
        c3.like_comment_state(u1)
        # comment 3 reported by user1
        db.session.commit()

        # check the comments liked by the users
        self.assertEqual(c1.likes.all(), [u1, u2, u3])
        self.assertEqual(c2.likes.all(), [u2, u3])
        self.assertEqual(c3.likes.all(), [u1])
        self.assertEqual(c4.likes.all(), [u2])


# Test Child comments model
class ChildCommentModelCase(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_post_child_comment(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        now = datetime.utcnow()

        # create four posts
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # create comment on posts
        c1 = Comment(content="luffy the pirate king", author=u1,
                     timestamps=now + timedelta(seconds=1), post=p1)
        c2 = Comment(content="Sabo finally consumes the flare flare fruit ",
                     author=u2, post=p2,
                     timestamps=now + timedelta(seconds=4))
        c3 = Comment(content="Akainu must pay for killing ace :(",  author=u3,
                     post=p3, timestamps=now + timedelta(seconds=3))
        c4 = Comment(content="Zoro has gotten lost again. haha!!", author=u4,
                     post=p4, timestamps=now + timedelta(seconds=2))

        db.session.add_all([c1, c2, c3, c4])
        db.session.commit()

        # create comment under comments
        cc1 = ChildComment(content="one piece is within reach", author=u1,
                           timestamps=now + timedelta(seconds=1), comment=c1)
        cc2 = ChildComment(content="Sabo finally consumes the flare flare fruit",
                           author=u2, comment=c2,
                           timestamps=now + timedelta(seconds=4))
        cc3 = ChildComment(content="Akainu must pay for killing ace :(",
                           author=u3,
                           comment=c3, timestamps=now + timedelta(seconds=3))
        cc4 = ChildComment(content="Zoro has gotten lost again. haha!!",
                           author=u4,
                           comment=c4, timestamps=now + timedelta(seconds=2))

        # check the comments dropped by the users
        self.assertEqual(c1.comments.all(), [cc1])
        self.assertEqual(c2.comments.all(), [cc2])
        self.assertEqual(c3.comments.all(), [cc3])
        self.assertEqual(c4.comments.all(), [cc4])

    def test_like_child_comment(self):
        # create four users
        u1 = User(username='luffy', email='luffy@example.com')
        u2 = User(username='sabo', email='sabo@example.com')
        u3 = User(username='ace', email='ace@example.com')
        u4 = User(username='zoro', email='zoro@example.com')
        db.session.add_all([u1, u2, u3, u4])

        now = datetime.utcnow()

        # create four posts
        p1 = Post(content="luffy the pirate king", author=u1,
                  timestamp=now + timedelta(seconds=1))
        p2 = Post(content="Sabo finally consumes the flare flare fruit ",
                  author=u1,
                  timestamp=now + timedelta(seconds=4))
        p3 = Post(content="Akainu must pay for killing ace :(",  author=u3,
                  timestamp=now + timedelta(seconds=3))
        p4 = Post(content="Zoro has gotten lost again. haha!!", author=u2,
                  timestamp=now + timedelta(seconds=2))

        db.session.add_all([p1, p2, p3, p4])
        db.session.commit()

        # create comment on posts
        c1 = Comment(content="luffy the pirate king", author=u1,
                     timestamps=now + timedelta(seconds=1), post=p1)
        c2 = Comment(content="Sabo finally consumes the flare flare fruit ",
                     author=u2, post=p2,
                     timestamps=now + timedelta(seconds=4))
        c3 = Comment(content="Akainu must pay for killing ace :(",  author=u3,
                     post=p3, timestamps=now + timedelta(seconds=3))
        c4 = Comment(content="Zoro has gotten lost again. haha!!", author=u4,
                     post=p4, timestamps=now + timedelta(seconds=2))

        db.session.add_all([c1, c2, c3, c4])
        db.session.commit()

        # create comment under comments
        cc1 = ChildComment(content="one piece is within reach", author=u1,
                           timestamps=now + timedelta(seconds=1), comment=c1)
        cc2 = ChildComment(content="Sabo finally consumes the flare flare fruit",
                           author=u2, comment=c2,
                           timestamps=now + timedelta(seconds=4))
        cc3 = ChildComment(content="Akainu must pay for killing ace :(",
                           author=u3,
                           comment=c3, timestamps=now + timedelta(seconds=3))
        cc4 = ChildComment(content="Zoro has gotten lost again. haha!!",
                           author=u4,
                           comment=c4, timestamps=now + timedelta(seconds=2))

        # like child comments
        cc1.like_child_comment(u1)
        cc1.like_child_comment(u2)
        cc1.like_child_comment(u3)
        # child comment under comment 1 liked by users 1, 2 and 3
        cc2.like_child_comment(u2)
        cc2.like_child_comment(u3)
        # child comment under comment 2 liked by users 2 and 3
        cc4.like_child_comment(u2)
        # child comment under comment 4 liked by user2
        cc3.like_child_comment(u1)
        # child comment under comment 3 liked by user1
        db.session.commit()

        # check the child comments liked by the users
        self.assertEqual(cc1.likes.all(), [u1, u2, u3])
        self.assertEqual(cc2.likes.all(), [u2, u3])
        self.assertEqual(cc3.likes.all(), [u1])
        self.assertEqual(cc4.likes.all(), [u2])


if __name__ == '__main__':
    unittest.main(verbosity=2)
