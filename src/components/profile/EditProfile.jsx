import { useState, useContext } from 'react';
import axios from "axios";
import { UserContext } from '../contexts/userContext';

import { ReactComponent as Upload } from '../../images/svg/uploadButton.svg'
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom'

// toast import
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

function EditProfile(props){

  const {token, removeToken} = useContext(UserContext)
  const usernamer = window.localStorage.getItem('username')
  const location = useLocation();
  const [error, setError] = useState(false)
  const [showToast, setShowToast] = useState(location.state);
  const navigate = useNavigate();

  const [profiler, setProfiler] = useState({
    header: props.header,
    avatar: props.avatar,
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
  const [imageHeader, setImageHeader] = useState(profiler.header);
  const [imageAvatar, setImageAvatar] = useState(profiler.avatar);
  const [gender, setGender] = useState(props.gender);


  const toggleShowToast = () => {
          setShowToast(!showToast)
          navigate(location.pathname, { state: false })
  }

  function handleChange(event) { 
    const {value, name} = event.target
    setProfiler(prevData => ({
        ...prevData, [name]: value})
    )}

    function genderChange(event){
      const val = event.target.value
      setGender(val)
    }

    function onChangeHeader(event){
      (
        (event.target.files && (event.target.files[0] != null)) &&
        setImageHeader(URL.createObjectURL(event.target.files[0]))
      )
    }
    function onChangeAvatar(event){
      (
        (event.target.files && (event.target.files[0] != null)) &&
        setImageAvatar(URL.createObjectURL(event.target.files[0]))
      )
    }

    function submitForm(event) {
      const formData = new FormData(event.target)
      formData.append("currentUzer", usernamer);
      axios({
        method: "PUT",
        url:"/api/user/"+ props.username,
        data:formData,
         headers: {
          Authorization: 'Bearer ' + token
          }
      })
      .then((response) => {
        setShowToast(true)
        // update username in web storage
        window.localStorage.setItem(
          "username", response.data.username)

        window.localStorage.setItem(
          "avatar", response.data.avatar)
        // replace previous url
        window.history.replaceState({}, null, response.data.username);
        // update user details
        props.update("/user/" + response.data.username)
        // navigate to new url
        navigate("/user/" + response.data.username, { state: true })
        console.log("here")
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          if (error.response.status === 400){
            setError(error.response.data.message)
          }
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
        <div className="">
              <form onSubmit={submitForm} className="create-note">
                <div className="header-avatar">
                  <div className="header-image">
                    <label htmlFor="header-image"> <Upload/> </label>
                    <input type="file" id="header-image" name="header-file" accept="image/*" className="file-custom" onChange={onChangeHeader}/>
                  </div>
                    {imageHeader && <div className="header-preview">
                    <img className="preview" src={imageHeader} alt="preview" /> </div>}
                  <div className="avatar-image">
                    <div className="avatar-imager">
                      <div className="avatar-upload">
                        <label htmlFor="avatar-imag"> <Upload/> </label>
                        <input type="file" id="avatar-imag" name="file" accept="image/*" className="file-custom" onChange={onChangeAvatar}/>
                      </div>
                      {imageAvatar && <div className="avatar-preview">
                        <img className="prev" src={imageAvatar} alt="preview" /> </div>}
                    </div>
                  </div>
                </div>
                <div className="edit-profile-input">
                  <div>
                    <label htmlFor="firstName">First name</label>
                    <input id="firstName" type="text" onChange={handleChange} name="firstname"  placeholder="First Name" value={profiler.firstname ? profiler.firstname : ""} />
                  </div>
                  <div>
                    <label htmlFor="lastName">Last name</label>
                    <input id="lastName" type="text" onChange={handleChange} name="lastname"  placeholder="Last Name" value={profiler.lastname ? profiler.lastname : ""} />
                  </div>
                </div>
                <div className="edit-profile-input">
                  <div>
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" onChange={handleChange} name="username"  placeholder="Username" value={profiler.username} required/>
                  </div>
                  <div>
                    <label htmlFor="dob"> Birthday</label>
                    <input id="dob" type="date" onChange={handleChange} name="dob"  placeholder="Date of Birth" value={profiler.dob ? profiler.dob : ""} />
                  </div>
                </div>
                <div className="edit-profile-input">
                  <div>
                    <label htmlFor="Email">Email</label>
                    <input id="email" type="text" onChange={handleChange} name="email"  placeholder="luffy@bankai.com" value={profiler.email} required/>
                  </div>
                  <div className="gender">
                    <div>Gender</div>
                    <div>
                      <input type="radio" id="male" name="gender" value="male"  onChange={genderChange} checked={gender === 'male' ? true : false} />
                      <label htmlFor="male">Male</label>
                      <input type="radio" id="female" name="gender" value="female" onChange={genderChange} checked={gender === 'female' ? true : false}/>
                      <label htmlFor="female">Female</label>
                      <input type="radio" id="other" name="gender" value="other" onChange={genderChange} checked={gender === 'other' ? true : false} />
                      <label htmlFor="other">Other</label>                    
                    </div>
                  </div>
                </div>
                <div className="bio-profile">
                    <label htmlFor="bio">Bio</label>
                    <input id="bio" type="text" onChange={handleChange} name="about_me"  placeholder="Anime lover" value={profiler.bio} />
                </div>
                <div className="edit-profile-input">
                  <div>
                    <label htmlFor="location"> Location</label>
                    <input id="location" type="text" onChange={handleChange} name="location"  placeholder="Konoha" value={profiler.location ? profiler.location : ""} />
                  </div>
                  <div>
                    <label htmlFor="twitter"> Twitter</label>
                    <input id="twitter" type="text" onChange={handleChange} name="twitter"  placeholder="@Twitter" value={profiler.twitter  ? profiler.twitter : ""} />
                  </div>
                </div>
                <div className="edit-profile-input">
                  <div>
                    <label htmlFor="insta"> Instagram</label>
                    <input id="insta" type="text" onChange={handleChange} name="instagram"  placeholder="@Instagram" value={profiler.instagram ? profiler.instagram : ""} />
                  </div>
                  <div>
                    <label htmlFor="faceb"> Facebook</label>
                    <input id="faceb" type="text" onChange={handleChange} name="facebook"  placeholder="@Facebook" value={profiler.facebook ? profiler.facebook : ""} />
                  </div>
                </div>

                <div className="btn-bottom">
                  <div onClick={() => props.cancel(false)}
                      className="btn btn-lg btn-primary pull-xs-right">
                      Cancel
                  </div>
                  <button
                    className="profile-edit-save"
                    type="submit">
                    Save
                  </button>
                </div>
             </form>
             {error && <div className="profile-error">{error}</div>}

             <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} onClose={toggleShowToast} delay={1200} autohide bg='success'>
                  <Toast.Header>
                    <strong className="me-auto">Profile successfully updated</strong>
                  </Toast.Header>
                </Toast>
            </ToastContainer>
        </div>
    )
}

export default EditProfile;
