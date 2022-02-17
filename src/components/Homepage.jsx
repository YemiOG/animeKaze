import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import CreatePost from "./posts/createPost"
import Posts from "./posts/Posts"

function Home(){

	// const [postMessage, setpostMessage] = useState("")
    const [posts, setPosts] = useState("")
    const {token, removeToken}= useContext(UserContext)
	const username = window.localStorage.getItem('username')

    useEffect(() => {
		// setAppState({ loading: true });
        getPosts()
    },[])


    function getPosts(){
		axios({
			method: "GET",
			url:'/api/home/'+ username + '/posts',
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			console.log(response.data.items)
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
		  console.log(response.data.success)
		}).catch((error) => {
		  if (error.response) {
			console.log(error.response)
			if (error.response.status === 401 || error.response.status === 422){
			  removeToken()
			}
			}
		})
	  }

	  function unfollowUser(uzer) {
		console.log(uzer)
        axios({
          method: "POST",
          url:"/api/unfollow/" + uzer,
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
            console.log(error.response.status)
            console.log(error.response.headers)
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
        <div className="home-page">
			<CreatePost post={getPosts}/>
			{posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} like={handlePost} interested={notInterested} 
											report={reportPost} userLiked={posts.user_liked} avatar={posts.avatar} poster={posts.poster} 
											fname={posts.fname} lname={posts.lname} unfollow={unfollowUser}/>)}
        </div>
    )
}

export default Home;
