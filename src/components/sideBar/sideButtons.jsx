import axios from "axios"
import { useNavigate } from 'react-router'
import { UserContext } from '../contexts/userContext'
import { useContext,useState } from 'react'

import { ReactComponent as Feed } from '../../images/svg/feed.svg'
import { ReactComponent as Community } from '../../images/svg/community.svg'
import { ReactComponent as Explorer } from '../../images/svg/explore.svg'
import { ReactComponent as Notification } from '../../images/svg/notification.svg'
import { ReactComponent as Person } from '../../images/svg/profile.svg'
import { ReactComponent as Settings } from '../../images/svg/settings.svg'
import { ReactComponent as Logout } from '../../images/svg/logout.svg'

function CreateButton(){
	
	let navigate = useNavigate();
	const {removeToken}= useContext(UserContext);
	const username = window.localStorage.getItem('username')
	const [isActive, setActive] = useState(1);
	const [iconColor, setIconColor] = useState("#546E7A")

	function logMeIn(){
		setIconColor('#ffffff')
		navigate("/login")
	}

	function logMeOut() {
		axios({
		method: "POST",
		url:"/api/logout",
		})
		.then((response) => {
			removeToken()
			setIconColor('#546E7A')
			navigate("/")
		}).catch((error) => {
		if (error.response) {
			console.log(error.response)
			console.log(error.response.status)
			console.log(error.response.headers)
			}
	})}

	function goToProfile(id){
		setIconColor('#ffffff')
		setActive(id)
		const user = {username}
		const profile = "/user/" + user.username
		navigate(profile)
	}

	function goHome(id){
		setIconColor('#ffffff')
		setActive(id)
		navigate("/home")
	}

	function goExplore(id){
		setIconColor('#ffffff')
		setActive(id)
		navigate("/explore")
	}

	const unAuthButtons = [
		{ id: 1, icon: Feed, text: 'Feed', action: logMeIn  },
		{ id: 2, icon: Community, text: 'Community', action: logMeIn  },
		{ id: 3, icon: Explorer, text: 'Explorer', action: logMeIn  },
		{ id: 4, icon: Notification, text: 'Notification', action: logMeIn  },
		{ id: 5, icon: Person, text: 'Profile', action: logMeIn },
		{ id: 6, icon: Settings, text: 'Settings', action: logMeIn }
	]

	const AuthButtons = [
		{ id: 1, icon: Feed, text: 'Feed' , action: goHome  },
		{ id: 2, icon: Community, text: 'Community', action:'' },
		{ id: 3, icon: Explorer, text: 'Explorer', action: goExplore },
		{ id: 4, icon: Notification, text: 'Notification', action:'' },
		{ id: 5, icon: Person, text: 'Profile', action: goToProfile},
		{ id: 6, icon: Settings, text: 'Settings', action:''},
		{ id: 7, icon: Logout, text: 'Logout' , action:logMeOut }
	]

  return {unAuthButtons, AuthButtons, isActive, iconColor}
}

export default CreateButton
