import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import { Link } from 'react-router-dom'

function Comments(props){
	const [newComment , setComment] = useState("")
	const [allComment , setAllComment] = useState("")
	const [childCommentForm, setchildCommentForm]= useState(false)
	const [childComment , setchildComment] = useState("")
	const [childCommentId , setchildCommentId] = useState(null)
	const {token, removeToken, setAppState}= useContext(UserContext)
	const userId = JSON.parse(window.localStorage.getItem("cuid"))
	const uzername = window.localStorage.getItem('username')

	useEffect(() => {
		// setAppState({ loading: true });
        getComments()
    },[])
	
	function handleChange(event) {
        const newValue = event.target.value
        setComment(newValue);
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
			setAllComment(
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

	console.log(childCommentId)
	function submitChildComment(event){
		const contnt = event.target.content.value;
		console.log(childCommentId)
		axios({
			method: "POST",
			url: '/api/child/comment',
			data:{
				content: contnt,
				uid: userId,
				cid: childCommentId,
			   },
			headers: {
				Authorization: 'Bearer ' + token
			  }
			}).then((response)=>{
				getComments()
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
		
		function likeComment(){
			comm.like(comm.id);
		}

		function replyComment(id){
			comm.submit(id)
			comm.reply(true);
		}

		function likeChildComment(id){
			console.log(id)
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
				getChildComments(comm.id)
			  }).catch((error) => {
				if (error.response) {
				  console.log(error.response)
				  if (error.response.status === 401 || error.response.status === 422){
					removeToken()
				  }
				  }
			  })
		}
		
		function getComment(){
			getChildComments(comm.id);
		}
        return (
			<>
				<div className="">
					<Link to={profile}
						className="nav-link">
						{comm.username}
					</Link> 
					<h1 > {comm.content} </h1>
					<p> {comm.likeCount} </p>
					<button onClick={likeComment}> Like </button>
					<button onClick={() => replyComment(comm.id)}> Reply </button>
					{comm.child ? (comm.child > 0 ?
							<button onClick={getComment}> View {comm.child} replies </button>
							:
							<button onClick={getComment}> View {comm.child} reply </button>
							)
						:
						null}
				</div>
				{childComment  && childComment.map(child => 
					<div key={child.id} className="">
						{(child.comment === comm.id ) && <>
							<Link to={profile}
								className="nav-link">
								{child.username}
							</Link> 
							<h1 > {child.content} </h1>
							<p> {child.likes} </p>
							<button onClick={() => likeChildComment(child.id)}> Like </button>
						</>
						}
					</div>
				)}
			</>
		)
	}

	return (
		<div>
			{allComment && allComment.map(comments => <DisplayComments key={comments.id} id={comments.id} content={comments.content} 
														likeCount={comments.likes} like={handleLikeComment} username={comments.username} 
														child= {comments.child} reply={setchildCommentForm} submit={setchildCommentId}/>)}

			{/* Comments posting form */}
			<div>
			{childCommentForm ?
				<form onSubmit={submitChildComment}>
                    <fieldset>
                        <fieldset className="form-group">
                            <input
                                className="form-control form-control-lg"
                                type="text"
                                name="content"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={handleChange} />
                        </fieldset>
                        <button
                            className="btn btn-lg btn-primary pull-xs-right"
                            type="submit">
                            Posting
                        </button>
                    </fieldset>
                </form>
				:
				<form onSubmit={submitComment}>
                    <fieldset>
                        <fieldset className="form-group">
                            <input
                                className="form-control form-control-lg"
                                type="text"
                                name="content"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={handleChange} />
                        </fieldset>
                        <button
                            className="btn btn-lg btn-primary pull-xs-right"
                            type="submit">
                            Post
                        </button>
                    </fieldset>
                </form>
				}
			</div>

		</div>
    )
}

export default Comments;
