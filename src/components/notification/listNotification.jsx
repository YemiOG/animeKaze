import { useState } from 'react';
import { Link } from 'react-router-dom'
import { ReactComponent as Commented } from '../../images/svg/notifyComment.svg'
import { ReactComponent as Followed } from '../../images/svg/notifyFollow.svg'
import { ReactComponent as Liked } from '../../images/svg/notifyLike.svg'

import PostNotification from './postNotification'
import CommentNotification from './commentNotification'

function ListNotification(props) {
	const profile = "/user/" + props.notifications.username 
	const [showPostModal, setShowPostModal] = useState(false)
	const [showCommentModal, setShowCommentModal] = useState(false)

	return (
		<>
			<div className="list-notification">
				<div className="notification-icon">
					{(props.notifications.notify_post_type || props.notifications.notify_comment_type || props.notifications.notify_child_comment_type) ? <Liked /> : null}
					{props.notifications.notify_follow_type ? <Followed /> : null}
					{(props.notifications.notify_post_comment_type || props.notifications.notify_cc_child_comment_type) ? <Commented /> : null}
				</div>
				<div className="notification-image">
					<img src={props.notifications.avatar} alt=""/>
				</div>
				<div className="notification-details">
					<div className="username"> 
						<Link to={profile}
							className="navr-link">
							<span>{props.notifications.username}</span> 
						</Link> 
						{props.notifications.notify_post_type ? <> <span> liked your</span> <span className="main_notify" onClick = {() => setShowPostModal(true)}> post</span> </> : null}
						{(props.notifications.notify_comment_type || props.notifications.notify_child_comment_type) ? <> <span> liked your</span>  <span className="main_notify" onClick = {() => setShowCommentModal(true)}> comment</span> </>: null}
						{props.notifications.notify_follow_type ? <span> followed you</span> : null}
						{props.notifications.notify_post_comment_type ? <> <span> commented on your</span> <span className="main_notify" onClick = {() => setShowPostModal(true)}> post</span> </> : null}
						{props.notifications.notify_cc_child_comment_type ? <span> replied to your comment</span> : null}
					</div>				
				</div>
			</div>
			{ (showPostModal && props.notifications.post) ? <PostNotification display={showPostModal} show={setShowPostModal} 
																postId={props.notifications.post} /> : null}
			{ (showCommentModal && props.notifications.comment) ? <CommentNotification display={showCommentModal} show={setShowCommentModal} 
																commentId={props.notifications.comment} /> : null}
		</>
	);
  }
  
  export default ListNotification;
