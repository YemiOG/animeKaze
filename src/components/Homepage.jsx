import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import Search from "./Search"
import Posts from "./Posts"

function Home(){

	// const [postMessage, setpostMessage] = useState("")
    const [posts, setPosts] = useState("")
	const [content, setContent] = useState("")
    const {token, removeToken, setAppState}= useContext(UserContext)
	const username = window.localStorage.getItem('username')
	const userId = JSON.parse(window.localStorage.getItem("cuid"))

    useEffect(() => {
		// setAppState({ loading: true });
        getPosts()
    },[])

	function handleChange(event) { 
		const post = event.target.value
		setContent(post)
	}

    function getPosts(){
		axios({
			method: "GET",
			url:'/api/home/'+ username + '/posts',
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setPosts(
                response.data.items
			  )
			// setAppState({ loading: false });
		  }).catch((error) => {
			if (error.response) {
			  console.log(error.response);
			  console.log(error.response.status);
			  if (error.response.status === 401){
				  removeToken()
			  }
			  console.log(error.response.headers);
			  }
		  })}

	function submitForm (event){
		const formData = new FormData(event.target)
		axios({
			method: "POST",
			url: '/api/upload',
			data:formData,
			headers: {
						Authorization: 'Bearer ' + token
			  		}
			}).then((response)=>{
				getPosts() // get posts upon successful post submission
			}).catch((error) => {
				if (error.response) {
				  console.log(error.response)
				  if (error.response.status === 401){
					removeToken()
					}
				  }
			  	})
		setContent("")
		event.target.reset()
		event.preventDefault()
	}

	function handlePost(id) { 
		axios({
		  method: "POST",
		  url:"/api/likepost/" + id,
		  data:{
			username:username
		   },
		  headers: {
			Authorization: 'Bearer ' + token
		  }
		})
		.then((response) => {
			getPosts()
		}).catch((error) => {
		  if (error.response) {
			console.log(error.response)
			if (error.response.status === 401 || error.response.status === 422){
			  removeToken()
			}
			}
		})
	}

	function notInterested(id) { 
		axios({
		  method: "POST",
		  url:"/api/notinterested/" + id,
		  data:{
			username:username
		   },
		  headers: {
			Authorization: 'Bearer ' + token
		  }
		})
		.then((response) => {
		  getPosts()
		}).catch((error) => {
		  if (error.response) {
			console.log(error.response)
			if (error.response.status === 401 || error.response.status === 422){
			  removeToken()
			}
			}
		})
	  }
	  function reportPost(id) { 
		axios({
		  method: "POST",
		  url:"/api/report/" + id,
		  data:{
			username:username
		   },
		  headers: {
			Authorization: 'Bearer ' + token
		  }
		})
		.then((response) => {
		  getPosts()
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
        <>
			<div className="note">
                <h1 >  Welcome to AnimeKaze </h1>
            </div>
            <Search />
			<form onSubmit={submitForm} encType="multipart/form-data" className="create-note">
				<input  type="text" onChange={handleChange} name="content" placeholder="What's happening?" value={content} required/>
				<input type="file" id="image" name="file" accept="image/*" className="file-custom" required/>
				<input  name="uid" value={userId} hidden readOnly={true}/>
				<button
					className="btn btn-lg btn-primary pull-xs-right"
					type="submit">
					Post
				</button>
			</form>
			{posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} like={handlePost} interested={null} report={reportPost}/>)}
        </>
    )
}

export default Home;
