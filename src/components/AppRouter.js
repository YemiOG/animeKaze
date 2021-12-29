import { useState } from 'react';
import { UserContext } from './contexts/userContext';
import Home from "./Homepage"
import Base from "./Basepage"
import CurrentUser from "./getUser"
import Login from "./Auth/Login"
import Register from "./Auth/Register"
import { Routes, Route, useLocation } from 'react-router-dom'
import Profile from "./Profile"
import Follow from "./follow/followerList"
import Header from "./Header"
import Footer from "./Footer"
import useToken from './useToken'
//error page
import PageNotFound from './error/pageNotFound'

import Loading from './Loading'

import AuthedRoute from './Auth/AuthedRoute'

function AppRouter() {

	const location = useLocation();
	const profileLocation = location.pathname.includes('user') && !location.pathname.includes('follow')
	const followerLocation = location.pathname.includes('user') && location.pathname.includes('follower')
	const followingLocation = location.pathname.includes('user') && location.pathname.includes('followed')

	console.log(profileLocation)
	console.log(followerLocation)
	console.log(followingLocation)
	
	const AppLoading = Loading(Home);
	const ProfileLoading = Loading(Profile);
	const FollowLoading = Loading(Follow);

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

		{/* {console.log(userInfo.uzer)} */}
		{console.log(location.pathname)}
		{/* username: {userInfo.currentUser} */}
		<Routes>
			<Route exact path="/" element={<Base />}></Route> 
			<Route exact path="/login" element={<Login/>}></Route>
			<Route exact path="/register" element={<Register/>}></Route>
			{profileLocation &&
			<Route exact path={`${location.pathname}`} element={<ProfileLoading />} />}
			<Route exact path="/home" element={
												<AuthedRoute >
													<Home />
												</AuthedRoute >
											} />
			{followerLocation &&
			<Route exact path={`${location.pathname}`} element={
																<AuthedRoute >
																	<FollowLoading />
																</AuthedRoute >
																}/>}
			{followingLocation &&
			<Route exact path={`${location.pathname}`} element={
																<AuthedRoute >
																	<FollowLoading />
																</AuthedRoute >
																}/>}
			<Route path='*' element={<PageNotFound />}/>
		</Routes> 
		{console.log(appState.loading)}
		{/* UserId is "{userInfo.cuid}" */}
		<Footer />
		</div>
		</UserContext.Provider>
	)
}

export default AppRouter;
