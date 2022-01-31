import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom'
import axios from "axios";
import { UserContext } from './contexts/userContext';
import UserNotFound from './error/userNotFound'
import Search from "./Search"
import Posts from "./Posts"

function Profile() {
    // let navigate = useNavigate();
    const location = useLocation();
    const {token, removeToken} = useContext(UserContext);
    const usernamer = window.localStorage.getItem('username')
    const [idMatch, setidMatch] = useState(false)
    const [following, setFollowing] = useState(false)
    const [noUser, setNoUser] = useState(false)
    const [content, setContent] = useState("")
    const [posts, setPosts] = useState("")
    // const [count, setCount] = useState("")
    const [profile, setProfile] = useState({
      username:"",
      about_me:"",
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
          const data = response.data.user.id
          const username = response.data.user.username
          if(userId === data){
            console.log("here we go")
            setidMatch(true)
          }
          // compareId(data)
          setProfile(({
            username:response.data.user.username,
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
     
    return (
      <>
        <Search />
        {(!noUser) ?
        <>
          {idMatch && 
            <form onSubmit={submitForm} encType="multipart/form-data" className="create-note">
              <input  type="text" onChange={handleChange} name="content" placeholder="What's happening?" value={content} required/>
              <input type="file" id="image" name="file" accept="image/*" className="file-custom" required/>
              {userId && <input  name="uid" value={userId} hidden readOnly={true}/>}
              <button
                className="btn btn-lg btn-primary pull-xs-right"
                type="submit">
                Post
              </button>
            </form>
          }
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
              <button>
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
          {posts && posts.map(posts => <Posts key={posts.id} id={posts.id} content={posts.content} likeCount={posts.likes} image={posts.image} like={handlePost} interested={null} report={null}/>)}
        </>
        :
        <UserNotFound/>}
      </>
    );
}
export default Profile;
