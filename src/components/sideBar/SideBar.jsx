import axios from "axios"
import { useContext } from 'react'
import { UserContext } from '../contexts/userContext'
import { useNavigate } from 'react-router';

// import images
import feed from '../../images/svg/feed.svg'

function Sidebar(props) {
  let navigate = useNavigate();
  const {setUserInfo,setAppState, userInfo, removeToken, token}= useContext(UserContext);
  const username = window.localStorage.getItem('username')
  const avatar = window.localStorage.getItem('avatar')


  function logMeOut() {
    axios({
      method: "POST",
      url:"/api/logout",
    })
    .then((response) => {
        removeToken()
        setUserInfo({
          uid:null
        })
        navigate("/")
        setAppState({ loading: false });
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}
  
    function goToProfile(){
      const user = {username}
      const profile = "/user/" + user.username
      navigate(profile)
    }
    function goHome(){
      navigate("/home")
    }
    function goExplore(){
      navigate("/explore")
    }

    function logMeIn(){
      navigate("/login")
    }

  return (
    <>
      <div className="logo">
        <h1>bankai</h1>
      </div>
      <div className="side-bar">
        {(!token && token !== "" && token !== undefined) ? 
          <>
            <button onClick={logMeIn}> <img src={feed} alt="feed" /> Feed </button> 
            <button onClick={logMeIn}> My Community </button>
            <button onClick={logMeIn}> Explore </button>
            <button onClick={logMeIn}> Notification </button>
            <button onClick={logMeIn}> Profile </button>
            <button onClick={logMeIn}> Settings </button>
          </>
        :
          <>
            <button onClick={goHome}> Feed </button> 
            <button onClick={logMeIn}> My Community </button>
            <button onClick={goExplore}> Explore </button>
            <button onClick={logMeIn}> Notification </button>
            <button onClick={goToProfile}> Profile </button>
            <button onClick={logMeIn}> Settings </button>
            <button onClick={logMeOut}> Logout </button>
            <div>
              <p>{username}</p>
              <img src={avatar} alt="profile logo"/>
            </div>
          </>
        }
      </div>
    </>
  );
}

export default Sidebar;
