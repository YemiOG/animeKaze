import React, {useState, useEffect, useContext} from "react";
import { UserContext } from '../contexts/userContext';
import axios from "axios";
import Modal from 'react-bootstrap/Modal'

import { ReactComponent as Close } from '../../images/svg/closeButton.svg'
import { ReactComponent as Drop } from '../../images/svg/dropdown.svg'
import { ReactComponent as Like } from '../../images/svg/like.svg'

function CommentNotification(props) {

	const {token, removeToken} = useContext(UserContext);
	const [postDetail, setPostDetail] = useState("")
	const [commentDetail, setCommentDetail] = useState("")
	const [childCommentDetail, setChildCommentDetail] = useState("")

	useEffect(() => {
		// setAppState({ loading: true });
        getComment()
    },[])

	function getComment(){
		axios({
			method: "POST",
			url:'/api/notification/comment',
			data:{
				cid: props.commentId,
			   	},
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
				getPost(response.data.post_id, response.data)
			// setAppState({ loading: false });
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response);
			  console.log(error.response.status);
			  if (error.response.status === 401 || error.response.status === 422){
				removeToken()
			  }
			}
		  })}

	function getChildComment(){
		axios({
			method: "POST",
			url:'/api/notification/child_comment',
			data:{
				cid: props.childCommentId,
			   	},
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
				setChildCommentDetail(response.data)
			// setAppState({ loading: false });
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response);
			  console.log(error.response.status);
			  if (error.response.status === 401 || error.response.status === 422){
				removeToken()
			  }
			}
		  })}

	function getPost(postId, comments){
		axios({
			method: "POST",
			url:'/api/notification/post',
			data:{
				pid: postId,
				   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
				setPostDetail(response.data)
				setCommentDetail(comments)
				props.childCommentId && getChildComment()
			// setAppState({ loading: false });
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response);
			  console.log(error.response.status);
			  if (error.response.status === 401 || error.response.status === 422){
				removeToken()
			  }
			}
		  })}

	return (
		<Modal 
			show={props.display} 
			onHide={() => props.show(false)}
			animation={false}
			>
			<Modal.Header className="notify-header">
				<Close className="drop" onClick={() => props.show(false)}/> 
			</Modal.Header>
		    <Modal.Body>
				<div className="post-list">
					<div className="post-image-top">
					<div className="post-image-top1">
						<div className='profile-image'>
						<img src={postDetail.avatar} alt="profile logo"/>
						</div>
						<div className="navr-link">
						<span>{postDetail.fname}</span> <span>{postDetail.lname}</span> @{postDetail.poster}
						</div> 
					</div>
					</div>
					<div className="post-content"> {postDetail.content} </div>
					<div className="post-image">
						<img className="post-imager" src={postDetail.image} alt="profile logo"/>
					</div>
				</div>
				<div className={"notify-comment-cover " + ((props.like && !props.child ) ? '' : 'cover-spacing')}>
					<div className="comment-list">
						<div className="comment-content">
							<div className='profile-image'>
								<img src={commentDetail.avatar} alt="profile logo"/>
							</div>
							<div className="comment-content-1">
								<div className="notify-comment-content-2">
									<div className="navr-link">
										<span>{commentDetail.fname}</span> <span>{commentDetail.lname}</span> @{commentDetail.username}
									</div> 
									<Drop className="drop" />
								</div>
								<div > {commentDetail.content} </div>
							</div>
							{ (props.like && !props.child) ? <div className="like-comment-cont">
								<Like fill='#2962FF' stroke='#2962FF' className="like-comment-button"/>
							</div> : null}
						</div>
					</div>
				</div>
				{props.childCommentId ? <div className={"comment-child " + (props.like ? '' : 'cover-spacing')}>
							<div className="comment-child-1">
								<div className='profile-image-child'>
										<img src={childCommentDetail.avatar} alt="profile logo"/>
								</div>
									<div className="comment-child-2">
										<div className="notify-comment-child-3">
											<div className="navr-link">
												<span>{childCommentDetail.fname}</span> <span>{childCommentDetail.lname}</span> @{childCommentDetail.poster}
											</div> 
											<Drop className="drop" />
										</div>
										<div > {childCommentDetail.content} </div>
									</div>
									{ props.like ? <div className="like-child-comment-cont">
										<Like fill='#2962FF' stroke='#2962FF' className="like-comment-button" />
									</div> : null}							
							</div>
						</div> : null
				}
			</Modal.Body>
		</Modal>
	);
  }
  
  export default CommentNotification;
