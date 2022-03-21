import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom'
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import UserNotFound from '../error/userNotFound'
import CreatePost from "../posts/createPost"
import Posts from "../posts/Posts"
import EditProfile from "./EditProfile"

// import svg icons
import { ReactComponent as Dob } from '../../images/svg/dob.svg'
import { ReactComponent as Facebook } from '../../images/svg/facebook.svg'
import { ReactComponent as Instagram } from '../../images/svg/instagram.svg'
import { ReactComponent as Twitter } from '../../images/svg/twitter.svg'
import { ReactComponent as User } from '../../images/svg/user.svg'
import { ReactComponent as Locate } from '../../images/svg/location.svg'

function Profile() {
    // let navigate = useNavigate();
    const location = useLocation();
    const {token, removeToken} = useContext(UserContext);
    const usernamer = window.localStorage.getItem('username')
    const [idMatch, setidMatch] = useState(false)
    const [following, setFollowing] = useState(false)
    const [noUser, setNoUser] = useState(false)
    const [editProfile, setEditProfile] = useState(false)
    const [content, setContent] = useState("")
    const [posts, setPosts] = useState("")
    // const [count, setCount] = useState("")
    const [profile, setProfile] = useState({
      username:"",
      about_me:"",
      email:"",
      firstname:"",
      lastname:"",
      avatar: null,
      followers_cnt:null,
      following_cnt:null,
      posts:null,
      gender:"",
      location:"",
      twitter:"",
      facebook:"",
      instagram:"",
      dob:"",
    })
    const userId = JSON.parse(window.localStorage.getItem("cuid"))
    const uzer = location.pathname.split("/")[2]


    useEffect(() => {
        getProfile()
        return () => {
          setidMatch({})
        };
    },[uzer])
    
    function handleChange(event) { 
      const post = event.target.value
      setContent(post)
    }

    function getPosts(uzername){
      axios({
        method: "GET",
        url:'/api/profile/'+ uzername + '/posts',
        headers: {
          Authorization: 'Bearer ' + token
        }
        }).then((response)=>{
          setPosts(
            response.data.items
          )
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

    function getProfile() {
      setidMatch(false)
      axios({
          method: "POST",
          url: '/api' + location.pathname,
          data:{
            username:usernamer
           },
        }).then((response)=>{
          console.log(response.data.user)
          const data = response.data.user.id
          const username = response.data.user.username
          if(userId === data){
            setidMatch(true)
          }
          setProfile(({
            username:response.data.user.username,
            email:response.data.user.email,
            firstname:response.data.user.firstname,
            lastname:response.data.user.lastname,
            avatar:response.data.user.avatar,
            about_me: response.data.user.about_me,
            followers_cnt: response.data.user.follower_count,
            following_cnt: response.data.user.followed_count,
            posts: response.data.user.post_count
            }))
            username && getPosts(username) //if user exists check for posts
            setFollowing(response.data.following) //set user following status
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            if (error.response.status === 404){
              setNoUser(true)
            }
            }
        })}
      
  function followUser() {
        axios({
          method: "POST",
          url:"/api/follow/" + uzer,
          data:{
            username:usernamer
           },
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
            getProfile()
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
            if (error.response.status === 401 || error.response.status === 422){
              removeToken()
            }
        })  
    }

  function unfollowUser(event) {
        axios({
          method: "POST",
          url:"/api/unfollow/" + uzer,
          data:{
            username:usernamer
           },
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
             getProfile()
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

    function handlePost(id) { 
      axios({
        method: "POST",
        url:"/api/likepost/" + id,
        data:{
          username:usernamer
         },
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then((response) => {
        getPosts(uzer)
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          if (error.response.status === 401 || error.response.status === 422){
            removeToken()
          }
          }
      })
    }

    function displayEdit() {
      editProfile? setEditProfile(false) : setEditProfile(true)
    }
     
    return (
      <>
        {(!noUser) ?
        <div className="profile-page">
          <div className="profile-header-avatar">
            <div className="profile-header">
                <img src="https://res.cloudinary.com/nagatodev/image/upload/c_scale,h_179,w_766/v1647505420/Profile/Default_header_background.png" 
                      alt="profile header"/>
            </div>
            <div className='profile-page-image'>
                <img src={profile.avatar} alt="profile logo"/>
            </div>
          </div>
          
          <div className="profile-info-topper">
            <div className="profile-info-top">
              <span>{profile.firstname} {profile.lastname}</span><span className="profile-info-top">@{profile.username}</span>
              <p className="">
                {profile.about_me}
              </p>
            </div>
            {idMatch  ?
                    <button className="profile-info-btn1" onClick={displayEdit}>
                      Edit Profile
                    </button>
                    :
                    token && (following ? 
                    <button className="profile-info-btn2" onClick={unfollowUser}>
                      Following
                    </button>
                    :
                    <button className="profile-info-btn3" onClick={followUser}>
                      Follow
                    </button>
                    )
                }
          </div>

          <div className="profile-details"> 
              <div className="detail-card">
                <div className="top-detail-card">
                  <p>
                    <User fill="191E22"/> {profile.gender ? profile.gender : <span className="noDetail"> ------------------------------- </span>} 
                  </p>
                  <p>
                    <Dob fill="191E22"/>{profile.dob ? <>Born profile.dob </> : <span className="noDetail"> ------------------------------- </span>}
                  </p>
                  <p>
                    <Locate fill="191E22"/> {profile.location ? profile.location : <span className="noDetail"> ------------------------------- </span>}
                  </p>
                  <p>
                    <Instagram fill="191E22"/> {profile.instagram ? profile.instagram : <span className="noDetail"> ------------------------------- </span>}
                  </p>
                  <p>
                    <Twitter fill="191E22"/> {profile.twitter ? profile.twitter : <span className="noDetail"> ------------------------------- </span>}
                  </p>
                  <p>
                    <Facebook fill="191E22"/> {profile.facebook ? profile.facebook : <span className="noDetail"> ------------------------------- </span>}
                  </p>
                </div>
                  <div className="post-follow">
                    <p>
                      <Link to='followed'> <span> {profile.following_cnt} </span> Following</Link> 
                    </p>
                    <p>
                      <Link to='followers'> <span> {profile.followers_cnt} </span> {profile.followers_cnt.length > 1 ? <>Followers</> : <>Follower</>}</Link> 
                    </p>
                    <p>
                      <span>Posts:</span> <span>{profile.posts}</span>
                    </p>
                  </div>
              </div>
              <div className="post-detail">
                {idMatch && <CreatePost/>}
                <div className="profile-posts">
                  {posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} like={handlePost} interested={null} 
                                                  report={null} userLiked={posts.user_liked} avatar={posts.avatar} poster={posts.poster} 
                                                  fname={posts.fname} lname={posts.lname}/>)}
                </div>
                {editProfile && <EditProfile key={profile.id} username={profile.username} fname={profile.firstname} lname={profile.lastname} bio={profile.about_me} email={profile.email} 
                                  cancel={displayEdit} update={getProfile}/>}
              </div>
          </div>
        </div>  
          :
          <UserNotFound/>}
      </>
    );
}
export default Profile;
