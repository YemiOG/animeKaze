import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom'
import axios from "axios";
import { UserContext } from '../contexts/userContext';
import UserNotFound from '../error/userNotFound'
import CreatePost from "../posts/createPost"
import Posts from "../posts/Posts"
import EditProfile from "./EditProfile"


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
      followers_cnt:null,
      following_cnt:null,
      posts:null
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
      
    function submitForm (event){
      const formData = new FormData(event.target)
      axios({
        method: "POST",
        url: '/api/upload',
        data:formData,
        headers: {
              Authorization: 'Bearer ' + token
              }
        }).then((response)=>{
          // getPosts(uzer) // get posts upon successful post submission
          getProfile()  //refresh profile data
          }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            if (error.response.status === 401 || error.response.status === 422){
              removeToken()
            }
            }
          })
      setContent("")
      event.target.reset()
      event.preventDefault()
      }

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
        <div className="profilePage">
          {idMatch && <CreatePost/>}
          <p style={{ textAlign: 'center', fontSize: '30px' }}>
            Username:{profile.username}
          </p>
          <p style={{ textAlign: 'center', fontSize: '30px' }}>
            Info:{profile.about_me}
          </p>
          <p style={{ textAlign: 'center', fontSize: '30px' }}>
            Folllowers:<Link to='followers'> {profile.followers_cnt} </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '30px' }}>
            Following:<Link to='followed'> {profile.following_cnt} </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: '30px' }}>
            Posts:{profile.posts}
          </p>
          {idMatch  ?
              <button onClick={displayEdit}>
                Edit Profile
              </button>
              :
              token && (following ? 
              <button onClick={unfollowUser}>
                Following
              </button>
              :
              <button onClick={followUser}>
                Follow
              </button>
              )
          }
          {posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} like={handlePost} interested={null} 
                                          report={null} userLiked={posts.user_liked} avatar={posts.avatar} poster={posts.poster} 
											                    fname={posts.fname} lname={posts.lname}/>)}
          {editProfile && <EditProfile key={profile.id} username={profile.username} fname={profile.firstname} lname={profile.lastname} bio={profile.about_me} email={profile.email} 
                            cancel={displayEdit} update={getProfile}/>}
        </div>
        :
        <UserNotFound/>}
      </>
    );
}
export default Profile;
