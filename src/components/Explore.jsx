import {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import Search from "./Search"
import Posts from "./Posts"

function Explore(){
    const {token, removeToken, setAppState} = useContext(UserContext);
	const usernamer = window.localStorage.getItem('username')
	const [posts, setPosts] = useState("")

	useEffect(() => {
		// setAppState({ loading: true });
        getExplore()
    },[])

	function getExplore(){
		axios({
			method: "GET",
			url:'/api/explore',
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
        // setCount(post)
        console.log(response)
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
        <div className='App'>
            <h1>Explore</h1>
			<Search />
			{posts && posts.map(posts => <Posts key={posts.id} id={posts.id} likeCount={posts.count} content={posts.content} image={posts.image} like={handlePost}/>)}
        </div>
    )
}

export default Explore;
