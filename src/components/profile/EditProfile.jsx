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
    gender: props.gender,
    location: props.location,
    dob: props.dob,
    firstname:props.fname,
    lastname:props.lname,
    twitter:props.twitter,
    instagram:props.instagram,
    facebook:props.facebook,
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
          currentUzer: usernamer,
          gender: profiler.gender,
          location: profiler.location,
          dob: profiler.dob,
          twitter:profiler.twitter,
          instagram:profiler.instagram,
          facebook:profiler.facebook,
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
                <input  type="text" onChange={handleChange} name="username"  placeholder="Username" value={profiler.username} />
                 <input  type="text" onChange={handleChange} name="firstname"  placeholder="First Name" value={profiler.fname} />
                <input  type="text" onChange={handleChange} name="lastname"  placeholder="Last Name" value={profiler.lname} />
                <input  type="text" onChange={handleChange} name="email"  placeholder="luffy@bankai.com" value={profiler.email} />
                <input  type="text" onChange={handleChange} name="about_me"  placeholder="Bio" value={profiler.bio} />
                <input  type="text" onChange={handleChange} name="gender"  placeholder="Gender" value={profiler.gender} />
                <input  type="text" onChange={handleChange} name="location"  placeholder="Location" value={profiler.location} />
                <input  type="text" onChange={handleChange} name="dob"  placeholder="Date of Birth" value={profiler.dob} />
                <input  type="text" onChange={handleChange} name="twitter"  placeholder="@Twitter" value={profiler.twitter} />
                <input  type="text" onChange={handleChange} name="instagram"  placeholder="@Instagram" value={profiler.instagram} />
                <input  type="text" onChange={handleChange} name="facebook"  placeholder="@Facebook" value={profiler.facebook} />
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
