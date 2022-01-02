import {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from './contexts/userContext';
import Search from "./Search"
import Posts from "./Posts"

function Explore(){
    const {token, removeToken, setAppState} = useContext(UserContext);
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
			  console.log(response.data.items)
			// setPosts(
            //     response.data.items
			//   )
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

    return (
        <div className='App'>
            <h1>Explore</h1>
			<Search />
			{posts && posts.map(posts => <Posts key={posts.id} content={posts.content} image={posts.image}/>)}
        </div>
    )
}

export default Explore;
