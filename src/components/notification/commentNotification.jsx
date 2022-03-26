import React, {useState, useEffect, useContext} from "react";
import { UserContext } from '../contexts/userContext';
import axios from "axios";
import Modal from 'react-bootstrap/Modal'

import { ReactComponent as Close } from '../../images/svg/closeButton.svg'

function CommentNotification(props) {

	const {token, removeToken} = useContext(UserContext);
	const [postDetail, setPostDetail] = useState("")
	const [commentDetail, setCommentDetail] = useState("")

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
				console.log(response)
				setPostDetail(response.data)
				setCommentDetail(comments)
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
			</Modal.Body>
		</Modal>
	);
  }
  
  export default CommentNotification;
