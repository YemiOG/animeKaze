import React, { useContext,useState } from "react";
import axios from "axios";
import { Link} from 'react-router-dom'
import { UserContext } from '../contexts/userContext';

function FollowList(props){
    const usernamer = window.localStorage.getItem('username')
    const {token, removeToken}= useContext(UserContext)
    const userId = JSON.parse(window.localStorage.getItem("cuid"))
    const [buttonState, setButtonState] = useState(props.isFollowing)
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
          props.change()
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
              props.change()
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
        <div className="follow-card">
            <Link to={uzer}
                className="nav-link">
                <div>
                  <div className="follow-card-top">
                    <div className="follow-card-img-cover">
                      <img src={props.follow.avatar} alt=""/>
                    </div>
                    <div>
                      <div className="username"> {props.follow.username} </div>
                      <div className="about">{props.follow.about_me}</div>
                    </div>
                  </div>
                </div>
            </Link> 

            {/* if current user id matched follower id, 
            follow/unfollow button should be hdden*/}
            {!idMatch &&
              <div className="follow-btns">
                <button onClick={unfollowUser} className= {buttonState ? 'following' : ""} disabled={!buttonState ? true : false}>
                  Unfollow
                </button>
                <button onClick={followUser} className= {!buttonState ? 'following' : ""} disabled={buttonState ? true : false}>
                  Follow
                </button>
              </div>
            }
        </div>
    )
}

export default FollowList;
