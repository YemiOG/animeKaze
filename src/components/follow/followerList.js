import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import Loading from '../dataLoading/Loading'
import FollowList from './followList'

function Follow() {

	const location = useLocation();
	const usernamer = window.localStorage.getItem('username')
	const [following, setFollowing] = useState([])
	const FollowLoading = Loading(FollowList);
	const {token, removeToken, setAppState}= useContext(UserContext);
	const [followers, setFollowers] = useState({
		follwrs:""
	})

    useEffect(() => {
		// setAppState({ loading: true });
        getfollowers()
    },[])

	function getfollowers(){
		axios({
			method: "POST",
			url:'/api' + location.pathname,
			data:{
				username:usernamer
			   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setFollowing(response.data.following)
			setFollowers(({
				follwrs:response.data.user.items
			  }))
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
	<div>
		{followers.follwrs && followers.follwrs.map( (lists,index) => <FollowLoading 
																		key={lists.id} 
																		isFollowing={following[index]} 
																		setFollowing={getfollowers} 
																		follow={lists}/> )}
	</div>
  );
}

export default Follow;
