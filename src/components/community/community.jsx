import { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { UserContext } from '../contexts/userContext';

import Loading from '../dataLoading/Loading'
import FollowList from '../follow//followList'

function Community() {
	const FollowLoading = Loading(FollowList);

	const username = window.localStorage.getItem('username')
	const {token, removeToken, setAppState}= useContext(UserContext);
	const [buttonState, setButtonState] = useState(true)
	const [changeCount, setChangeCount] = useState(false)
	const [flwcount, setFlwCount] = useState({
		followers:"",
		followed:""
	})
	const [following, setFollowing] = useState([])
	const [followUrl, setFollowUrl] = useState({
		follwrs:"",
		follwd:""
	})
	const [follows, setFollows] = useState({
		flwrs:""
	})

	useEffect(() => {
		// setAppState({ loading: true });
		console.log("back")
        getFollowLink()
    },[followUrl.follwrs, followUrl.follwd])

	function getFollowLink(){
		axios({
			method: "POST",
			url:'/api/user/' + username,
			data:{
				username:username
			   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setFlwCount(({
				followers:response.data.user.followed_count,
				followed:response.data.user.follower_count
			}))
			setFollowUrl(({
				follwrs:response.data.user._links.followers,
				follwd:response.data.user._links.followed
			  }))
			  getfollowers()
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

	function getfollowers(){
		const flw = followUrl.follwrs
		flw && axios({
			method: "POST",
			url: flw,
			data:{
				username:username
			   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setFollowing(response.data.following)
			setFollows(({
				flwrs:response.data.user.items
			  }))
			  setButtonState(true)
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

	function getfollowed(){
		const flwd = followUrl.follwd
		flwd && axios({
			method: "POST",
			url: flwd,
			data:{
				username:username
			   },
			headers: {
			  Authorization: 'Bearer ' + token
			}
		  }).then((response)=>{
			setFollowing(response.data.following)
			setFollows(({
				flwrs:response.data.user.items
			  }))
			  setButtonState(false)
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
		<div className="community">
			<div className="community-control">
                <button onClick= {getfollowers} className= {buttonState ? 'following' : ""} disabled={buttonState ? true : false}>
					<span> {flwcount.followed} </span> {(flwcount.followed> 1) ? <span> Followers </span> : <span> Follower </span>}
                </button>
				<button onClick= {getfollowed}  className= {!buttonState ? 'following' : ""} disabled={!buttonState ? true : false}>
					<span> {flwcount.followers} </span> {(flwcount.followers > 1) ? <span> Followings </span> : <span> Following </span>}
                </button>
			</div>
			<div className="comm1">
				{follows.flwrs && follows.flwrs.map( (lists,index) => <FollowLoading 
																			key={lists.id} 
																			isFollowing={following[index]} 
																			setFollowing={getfollowers} 
																			follow={lists} change={getFollowLink} 
																			/> )}
			</div>
		</div>
	);
  }
  
  export default Community;
