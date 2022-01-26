import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import { Link } from 'react-router-dom'

function Comments(props){
	const [newComment , setComment] = useState("")
	const [allComment , setAllComment] = useState("")
	const {token, removeToken, setAppState}= useContext(UserContext)
	const userId = JSON.parse(window.localStorage.getItem("cuid"))

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

	function handleLikeComment(id){
        // props.like(props.id);
		console.log(id)
    }

	function DisplayComments(comm) {
		const profile = "/user/" + comm.username
		
		function LikeComment(){
			comm.like(comm.id);
		}

        return (
			<div className="">
				<Link to={profile}
					className="nav-link">
					{comm.username}
				</Link> 
				<h1 > {comm.content} </h1>
				<button onClick={LikeComment}> Like </button>
			</div>
		)
	}

	return (
		<div>
			{allComment && allComment.map(comments => <DisplayComments key={comments.id} id={comments.id} content={comments.content} likeCount={comments.likes} like={handleLikeComment} username={comments.username}/>)}

			{/* Comments posting form */}
			<div>
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
			</div>

		</div>
    )
}

export default Comments;
