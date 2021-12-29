import axios from "axios"
import { useContext } from 'react'
import { UserContext } from './contexts/userContext'
import { useNavigate } from 'react-router';

function Header(props) {
  let navigate = useNavigate();
  const {setUserInfo,setAppState, userInfo, removeToken, token}= useContext(UserContext);
  const username = window.localStorage.getItem('username')

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

    function logMeIn(){
      navigate("/login")
    }

  return (
    <header>
      <h1>Accent</h1>
      {(!token && token!=="" && token !== undefined) ? <button onClick={logMeIn}> Login </button> 
       :
       <button onClick={logMeOut}> Logout </button>
      }
      {username ?
        <button onClick={goToProfile}> 
          Profile
        </button>
            :
        <button onClick={logMeIn}> 
          Profile
        </button>
      }
    </header>
  );
}

export default Header;
