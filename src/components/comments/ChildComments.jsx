import React, {useState,useContext,useRef,useEffect} from "react";
import axios from "axios";
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

import { ReactComponent as Drop } from '../../images/svg/dropdown.svg'
import { ReactComponent as Like } from '../../images/svg/like.svg'


function DisplayChildComments(props) {

	const childComments = useRef(null);
	
	  useEffect(()=>{
		if(childComments.current !== null) {
			childComments.current.focus()};
	  }, []);
	

	let fillColor= 'none'
	let strokeColor= '#575757'

	if (props.child.user_liked===true) {
		fillColor='#2962FF'
		strokeColor= '#2962FF'
	}
	
	const [childStroke , setChildStroke] = useState(strokeColor)
	const [childLiked , setChildLiked] = useState(fillColor)
	const {token, removeToken, setAppState}= useContext(UserContext)
	const uzername = window.localStorage.getItem('username')

	function likeChildComment(id){
		axios({
			method: "POST",
			url:"/api/likechildcomment/" + id,
			data:{
			  username:uzername
			 },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  })
		  .then((response) => {
			if (childLiked ==='none'){
				setChildLiked('#2962FF')
				setChildStroke('#2962FF')} else{
					setChildLiked('none')
					setChildStroke('#575757')
				} 
			props.childComments(props.id)
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response)
			  if (error.response.status === 401 || error.response.status === 422){
				removeToken()
			  }
			  }
		  })
	}

	return (
		(props.child.comment === props.id ? 
					<div className="comment-child" tabIndex={1} ref={childComments}>
						<div className="comment-child-1">
							<div className='profile-image-child'>
									<img src={props.child.avatar} alt="profile logo"/>
							</div>
								{(props.child.comment === props.id ) && <>
									<div className="comment-child-2">
										<div className="comment-child-3">
											<Link to={'/user/'+props.child.poster}
												className="navr-link">
												<span>{props.child.fname}</span><span>{props.child.lname}</span>@{props.child.poster}
											</Link> 
											<Drop className="drop" />
										</div>
										<div > {props.child.content} </div>
									</div>
									<div className="like-child-comment-cont">
										<Like fill={childLiked} stroke={childStroke} className="like-comment-button" onClick={() => likeChildComment(props.child.id)}/>
									</div>
								</> 
								}								
						</div>
						<div className="child-like-list">
							<span> {(props.child.likes > 0) && props.child.likes} </span> {(props.child.likes > 1) ? <span> Likes </span> : <span> Like </span>}
						</div>
					</div>
					:
					null
		)
	)}


export default DisplayChildComments;
