import { useState,useContext } from 'react';
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import { useNavigate,useLocation } from 'react-router';

function Login() {
    let navigate = useNavigate()
    let location = useLocation()
    let from = location.state?.from?.pathname || "/"
    
    const {setToken} = useContext(UserContext);
    const [loginForm, setloginForm] = useState({
      email: "",
      password: ""
    })

    function logMeIn(event) {
      axios({
        method: "POST",
        url:"/api/token",
        data:{
          email: loginForm.email,
          password: loginForm.password
         }
      })
      .then((response) => {
        // store current userid in web storage
        window.localStorage.setItem(
          "cuid", response.data.userID)

        // store username in web storage
        window.localStorage.setItem(
          "username", response.data.userName)

        // store avatar in web storage
        window.localStorage.setItem(
          "avatar", response.data.avatar)

        // store token in web storage
        setToken(response.data.access_token)

        // navigate back to page before login 
        navigate(from, {replace:true})

        // update user info after log in
        // setUserInfo({
        //   uid:response.data.userID,
        //   username:response.data.userName,
        // })
        // CurrentUser()
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          }
      })
  
      setloginForm({
        email: "",
        password: ""})
        
        event.preventDefault()
      }
    
    function handleChange(event) { 
      const {value, name} = event.target
      setloginForm(prevNote => ({
          ...prevNote, [name]: value})
      )}

    return (
      <div>
        <h1>Login</h1>
          <form className="login">
            <input onChange={handleChange} 
                  type="email"
                  text={loginForm.email} 
                  name="email" 
                  placeholder="Email" 
                  value={loginForm.email} />
            <input onChange={handleChange} 
                  type="password"
                  text={loginForm.password} 
                  name="password" 
                  placeholder="Password" 
                  value={loginForm.password} />
          
          <button onClick={logMeIn}>Submit</button>
        </form>
      </div>
    );
}

export default Login;
