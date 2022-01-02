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
    const {token, removeToken, setAppState} = useContext(UserContext);
    const usernamer = window.localStorage.getItem('username')
    const [idMatch, setidMatch] = useState(false)
    const [noUser, setNoUser] = useState(false)
    const [content, setContent] = useState("")
    const [posts, setPosts] = useState("")
    const [profile, setProfile] = useState({
      username:"",
      about_me:"",
      followers_cnt:null,
      following_cnt:null,
      posts:null
    })
    const userId = JSON.parse(window.localStorage.getItem("cuid"))

    useEffect(() => {
        getProfile()
        return () => {
          setidMatch({})
        };
    },[])
    
    function compareId(data){
      if(userId === data){
          setidMatch(true)
      }
    }

    function handleChange(event) { 
      const post = event.target.value
      setContent(post)
    }

    function getPosts(usernames){
      console.log(usernames)
      axios({
        method: "GET",
        url:'/api/profile/'+ usernames + '/posts',
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
      axios({
          method: "GET",
          url: '/api' + location.pathname,
        }).then((response)=>{
          const data = response.data.id
          const username = response.data.username
          compareId(data)
          setProfile(({
            username:response.data.username,
            about_me: response.data.about_me,
            followers_cnt: response.data.follower_count,
            following_cnt: response.data.followed_count,
            posts: response.data.post_count
            }))
            username && getPosts(username) //if user exists check for posts
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
          getPosts() // get posts upon successful post submission
          }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            }
          })
      setContent("")
      event.target.reset()
      event.preventDefault()
      }

  function followUser(event) {
    const uzer = location.pathname.split("/")[2]
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
            console.log(response)
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })  
        event.preventDefault()
    }

  function unfollowUser(event) {
    const uzer = location.pathname.split("/")[2]
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
            console.log(response)
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            console.log(error.response.status)
            console.log(error.response.headers)
            }
        })  
        event.preventDefault()
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
              <input  name="uid" value={userId} hidden readOnly={true}/>
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
          {idMatch ? 
              <button>
                Edit Profile
              </button>
              :
              <button onClick={followUser}>
                Follow
              </button>
          }
          {posts && posts.map(posts => <Posts key={posts.id} content={posts.content} image={posts.image}/>)}
        </>
        :
        <UserNotFound/>}
      </>
    );
}
export default Profile;
