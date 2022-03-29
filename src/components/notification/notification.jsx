import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import { UserContext } from '../contexts/userContext';

// local imports
import ListNotification from "./listNotification"

function Notification() {

	const usernamer = window.localStorage.getItem('username')
	const {token, removeToken} = useContext(UserContext);
	const [notifier, setNotifier] = useState("")
	
	useEffect(() => {
        getNotifications()
    },[])

	function getNotifications(){
		axios({
		  method: "POST",
		  url:'/api/notifications',
		  data:{
            username:usernamer
           },
		  headers: {
			Authorization: 'Bearer ' + token
		  }
		  }).then((response)=>{
				console.log(response)
				setNotifier(response.data.items)
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
		<div className="notification">
				<div className="notification-cover">
				<div className="notification-title">
					Notification
				</div>
				<div className="notification-list-cover">
					{notifier.length > 0 ? notifier.map( lists => <ListNotification 
															key={lists.id}
															notifications={lists} 
															reload={getNotifications}/> 
														)
						: <div>
							No notification yet
						</div>}
				</div>
				</div>
		</div>
	);
  }
  
  export default Notification;
