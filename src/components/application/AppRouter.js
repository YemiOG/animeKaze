import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

//Application
import Home from "../Homepage"
import Explore from "../explore/Explore"
import Base from "../Basepage"
import Header from "../topBottom/Header"
import Footer from "../topBottom/Footer"
import Sidebar from "../sideBar/SideBar"

// import CurrentUser from "./getUser"

// Auth
import AuthedRoute from '../Auth/AuthedRoute'
import useToken from '../Auth/useToken'
import Login from "../Auth/Login"
import Register from "../Auth/Register"
import RequestPasswordChange from "../Auth/RequestChangePassword"

//Profile
import Profile from "../profile/Profile"
import Follow from "../follow/followerList"

//error page
import PageNotFound from '../error/pageNotFound'

function AppRouter() {

	const location = useLocation();
	const profileLocation = location.pathname.includes('user') && !location.pathname.includes('follow')
	const followerLocation = location.pathname.includes('user') && location.pathname.includes('follower')
	const followingLocation = location.pathname.includes('user') && location.pathname.includes('followed')

	// console.log(profileLocation)
	// console.log(followerLocation)
	// console.log(followingLocation)
	

	const { token, removeToken, setToken } = useToken();

	const [appState, setAppState] = useState({
		loading: false,
	});

	const [userInfo, setUserInfo] = useState(
		{
		uid:null,
		cuid:null,
		currentUser:'',
		userLinks:'',
		}
	);
	const [profiler, setProfiler] = useState(
	  {
	    uid:null,
	    cuid:null,
	    user:'',
	  });

	return (
		<UserContext.Provider value={{token, userInfo, appState, setAppState, setUserInfo, removeToken, setToken}}>
		<div className='App'>
		<Header/>  
		<Sidebar/>  

		{/* {console.log(userInfo.uzer)} */}
		{console.log(location.pathname)}
		{/* username: {userInfo.currentUser} */}
		<Routes>
			<Route exact path="/login" element={<Login/>}></Route>
			<Route exact path="/register" element={<Register/>}></Route>
			<Route exact path="/" element={<Base />}></Route> 
			<Route exact path="/accounts/password/reset/" element={<RequestPasswordChange/>}></Route>
			<Route exact path="/explore" element={
						<AuthedRoute >
							<Explore/>
						</AuthedRoute>
						} />
			<Route exact path="/home" 
				element={
						<AuthedRoute >
							<Home />
						</AuthedRoute>
						} />
			{profileLocation &&
			<Route exact path={`${location.pathname}`} element={<Profile />} />}
			{followerLocation &&
			<Route exact path={`${location.pathname}`} 
				element={
					<AuthedRoute >
						<Follow />
					</AuthedRoute>
					}/>}
			{followingLocation &&
			<Route exact path={`${location.pathname}`} 
				element={
						<AuthedRoute >
							<Follow />
						</AuthedRoute>
						}/>}
			<Route path='*' element={<PageNotFound />}/>
		</Routes> 
		{console.log(appState.loading)}
		<Footer />
		</div>
		</UserContext.Provider>
	)
}

export default AppRouter;
