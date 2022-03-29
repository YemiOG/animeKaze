import { useState, useContext } from 'react';
import { Link } from 'react-router-dom'
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import { ReactComponent as Commented } from '../../images/svg/notifyComment.svg'
import { ReactComponent as Followed } from '../../images/svg/notifyFollow.svg'
import { ReactComponent as Liked } from '../../images/svg/notifyLike.svg'

import PostNotification from './postNotification'
import CommentNotification from './commentNotification'

function ListNotification(props) {
	const profile = "/user/" + props.notifications.username 
	const {token, removeToken} = useContext(UserContext);
	const usernamer = window.localStorage.getItem('username')
	const [showPostModal, setShowPostModal] = useState(false)
	const [showCommentModal, setShowCommentModal] = useState(false)
	const uzer = props.notifications.username

	function followUser() {
        axios({
          method: "POST",
          url:"/api/follow/" + uzer,
          data:{
            username:usernamer
           },
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
			props.reload()
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
            if (error.response.status === 401 || error.response.status === 422){
              removeToken()
            }
        })  
    }

  function unfollowUser() {
        axios({
          method: "POST",
          url:"/api/unfollow/" + uzer,
          data:{
            username:usernamer
           },
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
             props.reload()
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            if (error.response.status === 401 || error.response.status === 422){
              removeToken()
            }
            }
        })  
    }

	return (
		<>
			<div className="list-notification">
				<div className="list-notification1">	
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
								{props.notifications.notify_post_comment_type ? <> <span> commented on your</span> <span className="main_notify" onClick = {() => setShowCommentModal(true)}> post</span> </> : null}
								{props.notifications.notify_cc_child_comment_type ? <> <span> replied to your</span>  <span className="main_notify" onClick = {() => setShowCommentModal(true)}>comment</span> </> : null}
						</div>
					</div>	
				</div>	
				{ props.notifications.notify_follow_type ? (props.notifications.follow_state ? 
					<button className="notification-flwd-btn" onClick={unfollowUser}>
						Followed
					</button>
					:
					<button className="notification-flw-btn" onClick={followUser}>
						Follow back
					</button>) : null}			
			</div>
			{ (showPostModal && props.notifications.post) ? <PostNotification display={showPostModal} show={setShowPostModal} 
																postId={props.notifications.post} /> : null}
			{ (showCommentModal && props.notifications.comment  && props.notifications.notify_comment_type) ? <CommentNotification display={showCommentModal} show={setShowCommentModal} 
																commentId={props.notifications.comment} like={true} /> : null}
			{ (showCommentModal && props.notifications.child_comment  && props.notifications.notify_child_comment_type) ? <CommentNotification display={showCommentModal} show={setShowCommentModal} 
																commentId={props.notifications.comment} childCommentId={props.notifications.child_comment} like={true} child={true}/> : null}
			{ (showCommentModal && props.notifications.notify_post_comment_type) ? <CommentNotification display={showCommentModal} show={setShowCommentModal} 
																commentId={props.notifications.comment} like={false} /> : null}
			{ (showCommentModal && props.notifications.notify_cc_child_comment_type) ? <CommentNotification display={showCommentModal} show={setShowCommentModal} 
																commentId={props.notifications.comment} childCommentId={props.notifications.child_comment} like={false}/> : null}

		</>
	);
  }
  
  export default ListNotification;
