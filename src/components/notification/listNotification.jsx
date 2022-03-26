import { Link } from 'react-router-dom'

import { ReactComponent as Commented } from '../../images/svg/notifyComment.svg'
import { ReactComponent as Followed } from '../../images/svg/notifyFollow.svg'
import { ReactComponent as Liked } from '../../images/svg/notifyLike.svg'

function ListNotification(props) {

	const profile = "/user/" + props.notifications.username 

	return (
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
					{props.notifications.notify_post_type ? <span> liked your post</span> : null}
					{(props.notifications.notify_comment_type || props.notifications.notify_child_comment_type) ? <span> liked your comment</span> : null}
					{props.notifications.notify_follow_type ? <span> followed you</span> : null}
					{props.notifications.notify_post_comment_type ? <span> commented on your post</span> : null}
					{props.notifications.notify_cc_child_comment_type ? <span> replied to your comment</span> : null}
				</div>				
			</div>
		</div>
	);
  }
  
  export default ListNotification;
