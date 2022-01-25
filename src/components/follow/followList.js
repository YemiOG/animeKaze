import React, { useContext,useState } from "react";
import axios from "axios";
import { Link} from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

function FollowList(props){
    const usernamer = window.localStorage.getItem('username')
    const {token, removeToken}= useContext(UserContext)
    const userId = JSON.parse(window.localStorage.getItem("cuid"))
    const [buttonState, setButtonState] = useState(props.isFollowing)
    // console.log(props.isFollowing)
    let idMatch = false

    if (userId === props.follow.id){
        idMatch = true
      }

    function followUser() {
        axios({
          method: "POST",
          url:"/api/follow/" + props.follow.username,
          data:{
            username:usernamer
           },
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then((response) => {
          setButtonState(true)
        }).catch((error) => {
          if (error.response) {
            console.log(error.response)
            if (error.response.status === 401){
                removeToken()
            }
            console.log(error.response.headers)
            }
        })  
    }
    
    function unfollowUser() {
            axios({
              method: "POST",
              url:"/api/unfollow/" + props.follow.username,
              data:{
                username:usernamer
               },
              headers: {
                Authorization: 'Bearer ' + token
              }
            })
            .then((response) => {
              setButtonState(false)
            }).catch((error) => {
              if (error.response) {
                console.log(error.response)
                if (error.response.status === 401){
                    removeToken()
                }
                console.log(error.response.headers)
                }
            })  
        }
    
    const uzer = "/user/" + props.follow.username
    return (
        <div className="note">
            <Link to={uzer}
                className="nav-link">
                {props.follow.username}
            </Link> 

            {/* if current user id matched follower id, 
            follow/unfollow button should be hdden*/}
            {!idMatch &&
            (buttonState ? 
              <button onClick={unfollowUser}>
                Following
              </button>
              :
              <button onClick={followUser}>
                Follow
              </button>
            )}
        </div>
    )
}

export default FollowList;
