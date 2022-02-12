import { useState, useContext } from 'react';
import axios from "axios";
import { Navigate, useLocation } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

function EditProfile(props){

  const {token, removeToken} = useContext(UserContext)
  const usernamer = window.localStorage.getItem('username')

  const [profiler, setProfiler] = useState({
    username:props.username,
    about_me:props.bio,
    email:props.email,
    firstname:props.fname,
    lastname:props.lname,
  })

  function handleChange(event) { 
    const {value, name} = event.target
    setProfiler(prevData => ({
        ...prevData, [name]: value})
    )}

    function submitForm(event) {
      axios({
        method: "PUT",
        url:"/api/user/"+ props.username,
        data:{
          first_name:profiler.firstname,
          last_name:profiler.lastname,
          username:profiler.username,
          email: profiler.email,
          about_me: profiler.about_me,
          currentUzer: usernamer
         },
         headers: {
          Authorization: 'Bearer ' + token
          }
      })
      .then((response) => {
        // update username in web storage
        window.localStorage.setItem(
          "username", response.data.username)
        // replace previous url
        window.history.replaceState({}, null, response.data.username);
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
          if (error.response.status === 401 || error.response.status === 422){
            removeToken()
          }
          }
      })  
      event.preventDefault()
    }

	return (
        <div>
              <form onSubmit={submitForm} className="create-note">
                <input  type="text" onChange={handleChange} name="username"  value={profiler.username} required/>
                 <input  type="text" onChange={handleChange} name="firstname"  value={profiler.fname} required/>
                <input  type="text" onChange={handleChange} name="lastname"  value={profiler.lname} required/>
                <input  type="text" onChange={handleChange} name="email"  value={profiler.email} required/>
                <input  type="text" onChange={handleChange} name="about_me"  value={profiler.bio} required/>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit">
                  Save
                </button>
             </form>
              <button onClick={() => props.cancel()}
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit">
                    Cancel
              </button>
        </div>
    )
}

export default EditProfile;
