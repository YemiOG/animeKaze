import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import Loading from '../Loading'
import FollowList from './followList'

function Follow() {

	const location = useLocation();
	const FollowLoading = Loading(FollowList);
	const {token, removeToken, setAppState}= useContext(UserContext);
	const [followers, setFollowers] = useState({
		follwrs:""
	})

    useEffect(() => {
		// setAppState({ loading: true });
        getfollowers()
		// console.log("here")
    },[])

	function getfollowers(){
		axios({
			method: "GET",
			url:'/api' + location.pathname,
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setFollowers(({
				follwrs:response.data.items
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

		  let list
		  followers.follwrs && (list = followers.follwrs.map(a => a))
  return (
	<div>
		<FollowLoading followers={list}/>
	</div>
  );
}

export default Follow;
