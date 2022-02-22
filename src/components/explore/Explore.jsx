import {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import Posts from "../posts/Posts"
import CreateButton from '../sideBar/sideButtons'

function Explore(){
  const {token, removeToken, setAppState} = useContext(UserContext);
	const usernamer = window.localStorage.getItem('username')
	const [posts, setPosts] = useState("")
  const { setActive } = CreateButton();

	useEffect(() => {
		// setAppState({ loading: true });
        setActive(3)
        getExplore()
    },[])

	function getExplore(){
		axios({
			method: "POST",
			url:'/api/explore',
      data:{
        username:usernamer
           },
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
			  if (error.response.status === 401 || error.response.status === 422){
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
          username:usernamer
         },
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then((response) => {
        getExplore()
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
          username:usernamer
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
    function reportPost(id) { 
      axios({
        method: "POST",
        url:"/api/report/" + id,
        data:{
          username:usernamer
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
      <div className='explore'>
        <div className="top-title">
				  Explore
			  </div>
        <div className='explore-page'>
		    {posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} 
                                            like={handlePost} interested={notInterested} report={reportPost} userLiked={posts.user_liked} 
                                            avatar={posts.avatar} poster={posts.poster} 
											                      fname={posts.fname} lname={posts.lname}/>)}
        </div>
      </div>
    )
}

export default Explore;
