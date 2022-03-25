import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

function Notification() {

	const {token, removeToken} = useContext(UserContext);
	
	useEffect(() => {
        getNotifications()
    },[])

	function getNotifications(){
		axios({
		  method: "GET",
		  url:'/api/notifications',
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

	return (
		<div>
			Notification
		</div>
	);
  }
  
  export default Notification;
