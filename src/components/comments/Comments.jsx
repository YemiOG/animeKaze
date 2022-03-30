import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';
import Modal from 'react-bootstrap/Modal'

import FormChildComment from './childCommentForm'
import FormComment from './commentForm'
import DisplayChildComments from './ChildComments'

import { ReactComponent as Drop } from '../../images/svg/dropdown.svg'
import { ReactComponent as Like } from '../../images/svg/like.svg'
import { ReactComponent as Close } from '../../images/svg/closeButton.svg'
import { ReactComponent as Delete } from '../../images/svg/delete.svg'

function Comments(props){

	const [newComment , setComment] = useState("")
	const [newChildComment , setNewChildComment] = useState("")
	const [row , setRow] = useState(1)
	const [childCommentForm, setchildCommentForm]= useState(false)
	const [displayChildComment , setDisplayChildComment] = useState(null)
	const [submitPossible , setSubmitPossible] = useState(true)
	const [childComment , setchildComment] = useState(null)
	const [commentId , setCommentId] = useState(null)
	const {token, removeToken}= useContext(UserContext)
	const userId = JSON.parse(window.localStorage.getItem("cuid"))
	const avatar = window.localStorage.getItem('avatar')
	const uzername = window.localStorage.getItem('username')

	useEffect(() => {
		// setAppState({ loading: true });
        getComments()
    },[])
	
	function handleChange(event) {
        const newValue = event.target.value
		newValue.length > 0 && setSubmitPossible(false)
        setComment(newValue);
    }

	function handleChildChange(event) {
        const newValue = event.target.value
		newValue.length > 0 && setSubmitPossible(false)
        setNewChildComment(newValue);
    }

	function handleHeight() {
        if(row===1) {
		  setRow(3)
		}else{
			setRow(1)
			setchildCommentForm(false)
			};
    }
	
	function getComments(){
		axios({
			method: "POST",
			url:'/api/post/comments',
			data:{
				pid: props.postId,
			   	},
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
				props.setAllComment(
					response.data.items
				)
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

	function getChildComments(id){
		axios({
			method: "POST",
			url:'/api/comment/comments',
			data:{
				cid: id,
				   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setchildComment(
				response.data.items
			  )
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


	function submitComment(event){
        const contnt = event.target.content.value;
		axios({
			method: "POST",
			url: '/api/comment',
			data:{
				content: contnt,
				uid: userId,
				pid: props.postId,
			   },
			headers: {
				Authorization: 'Bearer ' + token
			  }
			}).then((response)=>{
				getComments()
				props.reveal(true)
			}).catch((error) => {
				if (error.response) {
					if (error.response.status === 401 || error.response.status === 422){
					removeToken()
					}
				}
		 	})
		setComment("")
        event.preventDefault()
      }

	function submitChildComment(event){
		event.preventDefault()
		const contnt = event.target.content.value;
		axios({
			method: "POST",
			url: '/api/child/comment',
			data:{
				content: contnt,
				uid: userId,
				cid: commentId,
			   },
			headers: {
				Authorization: 'Bearer ' + token
			  }
			}).then((response)=>{
				getComments()
				getChildComments(commentId)
			}).catch((error) => {
				if (error.response) {
					if (error.response.status === 401 || error.response.status === 422){
					removeToken()
					}
				}
			 })
		setComment("")
		setchildCommentForm(false)
	  }

	function deleteComment(id){
        axios({
          method: "POST",
          url: '/api/comment_delete',
          data:{
              cid: id,
             },
          headers: {
                Authorization: 'Bearer ' + token
                }
          }).then((response)=>{
            console.log(response)
			getComments()
          }).catch((error) => {
            if (error.response) {
              console.log(error.response)
              if (error.response.status === 401){
              removeToken()
              }
              }
       })}

	function handleLikeComment(id){
		axios({
			method: "POST",
			url:"/api/likecomment/" + id,
			data:{
			  username:uzername
			 },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  })
		  .then((response) => {
			getComments()
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response)
			  if (error.response.status === 401 || error.response.status === 422){
				removeToken()
			  }
			  }
		  })
    }

	function DisplayComments(comm) {
		const profile = "/user/" + comm.username
		
		let fillColor= 'none'
		let strokeColor= '#575757'

		if (comm.userLiked===true) {
			fillColor='#2962FF'
			strokeColor= '#2962FF'
		}
		
		const [liked , setLiked] = useState(fillColor)
		const [stroke , setStroke] = useState(strokeColor)
		const [show, setShow] = useState(false)
		const [showCard , setShowCard] = useState(false)
		
		function likeComment(){
			comm.like(comm.id)
			if (liked ==='none'){
				setLiked('#2962FF')
				setStroke('#2962FF')} else{
				  setLiked('none')
				  setStroke('#575757')
				} 
		}

		function hideComment() {
			setDisplayChildComment(null)
		}

		function replyComment(id){
			comm.submit(id)
			comm.reply(true);
		}

		function removeComment(){
			comm.delete(comm.id)
		}

		function revealBar(){
			showCard===false ? setShowCard(true) : setShowCard(false);
			}
		
		function getComment(){
			getChildComments(comm.id);
			setDisplayChildComment(comm.id)
			setShow(true)
			// onClick={ () => props.show(props.anime)
		}

		function SideCard(){

			return (
			  <div className="side-card">
				<button onClick={removeComment}>  <Delete stroke="#575757"/> Delete </button>
			  </div>
			)}


		return (
			<>
				<div className="comment-list">
					<div className="comment-content">
						<div className='profile-image'>
							<img src={comm.avatar} alt="profile logo"/>
						</div>
						<div className="comment-content-1">
							<div className="comment-content-2">
								<Link to={profile}
									className="navr-link">
									<span>{comm.fname}</span> <span>{comm.lname}</span> @{comm.username}
								</Link> 
								{uzername===comm.username && <Drop className="drop" onClick={revealBar}/>}
							</div>
							<div > {comm.content} </div>
						</div>
						<div className="like-comment-cont">
							<Like fill={liked} stroke={stroke} className="like-comment-button" onClick={likeComment}/>
						</div>
						{showCard && <SideCard />}
					</div>
					{!comm.topComment && 
						<div className="comment-list-bottom">
							<div className="like-list">
								<span> {(comm.likeCount > 0) && comm.likeCount} </span> {(comm.likeCount === 0) ? <span> 0 Likes </span> : ((comm.likeCount > 1) ? <span> Likes </span> : <span> Like </span>)}
							</div>
							<button onClick={() => replyComment(comm.id)}> Reply </button>
						</div>
					}
					{comm.child > 0 ? (displayChildComment === comm.id ? <button className="child-comment-button" onClick={hideComment}> ~ Hide replies </button>
						: (comm.child > 1 ?
							<button className="child-comment-button" onClick={getComment}> ~ View {comm.child} replies </button>
							:
							<button className="child-comment-button" onClick={getComment}> ~ View {comm.child} reply </button>
							)
					): null }
				</div>
				{(childComment && displayChildComment && comm.child > 0 ) ? (childComment.map(child => <DisplayChildComments key={child.id} child={child} id={comm.id}
								childComments={getChildComments}
				/>
				)) : null}
			</>
		)
	}


	return (
		<Modal 
			show={props.top} 
			onHide={() => props.reveal(false)}
			animation={false}
			// scrollable={true}
			>
			<Modal.Header>
				<div className="post-card post-modal-card">
					<div className="post-modal-list">
						<div className="post-image-top">
								<div className="post-image-top1">
									<div className='profile-image'>
										<img src={props.postAvatar} alt="profile logo"/>
									</div>
									<Link to={props.prof}
										className="navr-link">
										<span>{props.firname}</span><span>{props.lasname}</span>@{props.postr}
									</Link>
								</div>
								<Close className="drop" onClick={() => props.reveal(false)}/> 
						</div>
						<div className="post-content"> {props.cont} </div>
						
						<div className="post-modal-image">
							<img className="post-imager" src={props.contImage} alt="profile logo"/>
						</div>
					</div>
				</div>
			</Modal.Header>
		    <Modal.Body>
				<div >
					<div className={props.top ? "comment-cover": "no-comment-cover"}>
						{props.top && props.allComment ? props.allComment.map(comments => <DisplayComments key={comments.id} id={comments.id} content={comments.content} 
																	likeCount={comments.likes} like={handleLikeComment} username={comments.poster} 
																	child= {comments.child} reply={setchildCommentForm} submit={setCommentId} 
																	userLiked={comments.user_liked} fname={comments.fname} lname={comments.lname}
																	avatar={comments.avatar} delete={deleteComment}
																	/>)
													: null}
					</div>

					{/* Comments posting form */}
					<div>
						{childCommentForm ?
							<FormChildComment avatar={avatar} row={row} new={newChildComment} focus={handleHeight} 
												submitChild={submitChildComment} change={handleChildChange} poss={submitPossible}
												child= {setchildCommentForm}
												/>
									:
							<FormComment avatar={avatar} row={row} new={newComment} focus={handleHeight} 
												commentform={submitComment} change={handleChange} poss={submitPossible}/>}
					</div>
				</div>
			</Modal.Body>
		</Modal>
    )
}

export default Comments;
