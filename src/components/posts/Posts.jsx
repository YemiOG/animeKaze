import React, {useState, useContext} from "react";
import axios from "axios";
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/userContext';
import Comments from "../comments/Comments"

import { ReactComponent as Like } from '../../images/svg/like.svg'
import { ReactComponent as Comment } from '../../images/svg/comment.svg'
import { ReactComponent as Drop } from '../../images/svg/dropdown.svg'
import { ReactComponent as Interest } from '../../images/svg/interest.svg'
import { ReactComponent as Report } from '../../images/svg/report.svg'
import { ReactComponent as Unfollow } from '../../images/svg/unfollow.svg'
import { ReactComponent as Delete } from '../../images/svg/delete.svg'
import { ReactComponent as UnHide } from '../../images/svg/unHide.svg'
import { ReactComponent as Hidden } from '../../images/svg/hidden.svg'

function Posts(props){

  const {token, removeToken}= useContext(UserContext)

  let fillColor= 'none'
  let strokeColor= '#575757'

  if (props.userLiked===true) {
      fillColor='#2962FF'
      strokeColor= '#2962FF'
  }

	const [comments , setComments] = useState("")
	const [showComment , setShowComment] = useState(false)
	const [hidePost , setHidePost] = useState(false)
	const [hideInterestPost , setHideInterestPost] = useState(false)
	const [showCard , setShowCard] = useState(false)
	const [deleteCard , setDeleteCard] = useState(false)
	const [liked , setLiked] = useState(fillColor)
	const [stroke , setStroke] = useState(strokeColor)

  const usernamer = window.localStorage.getItem('username')
  const profile = "/user/" + props.poster 

     function handleClick(){
        setShowCard(false)
        props.like(props.id)
        if (liked ==='none'){
          setLiked('#2962FF')
          setStroke('#2962FF')} else{
            setLiked('none')
            setStroke('#575757')
          } 
      }
      
    function handleReport(){
        props.report(props.id);
        hidePost === false ? setHidePost(true) : setHidePost(false)
        setShowCard(false)
      }

    function deletePost(){
        axios({
          method: "POST",
          url: '/api/post_delete',
          data:{
              pid: props.id,
             },
          headers: {
                Authorization: 'Bearer ' + token
                }
          }).then((response)=>{
            console.log(response)
            props.reload() // get posts upon deleting post successfully
          }).catch((error) => {
            if (error.response) {
              console.log(error.response)
              if (error.response.status === 401){
              removeToken()
              }
              }
       })}

    function handleInterest(){
        props.interested(props.id);
        hideInterestPost === false ? setHideInterestPost(true) : setHideInterestPost(false)
        setShowCard(false)
      }
    function revealComments(){
      showComment===false ? setShowComment(true) : setShowComment(false)
      setShowCard(false)
      }

    function revealBar(){
      showCard===false ? setShowCard(true) : setShowCard(false);
      deleteCard===true && setDeleteCard(false)
      }

    function revealDelete(){
      deleteCard===false ? setDeleteCard(true) : setDeleteCard(false);
      }


    function SideCard(){

      return (
        <div className="side-card">
            {usernamer!==props.poster  ? <>
              {props.interested && <button onClick={handleInterest}> <Interest stroke="#2c2c2c"/> Not interested </button>}
              {props.report && <button onClick={handleReport}> <Report stroke="#575757"/> Report </button>}
              {props.unfollow ? <button onClick={() => props.unfollow(props.poster)}> 
                                                              <Unfollow stroke="#575757"/> Unfollow </button> : null} </>
                                                            :
            <button onClick={revealDelete}> <Delete stroke="#575757"/> Delete </button> }
        </div>
      )}
    
	return (
        <div className="post-card">
          {!hidePost && !hideInterestPost ? <div> 
            <div className="post-list">
                <div className="post-image-top">
                  <div className="post-image-top1">
                    <div className='profile-image'>
                      <img src={props.avatar} alt="profile logo"/>
                    </div>
                    <Link to={profile}
                      className="navr-link">
                      <span>{props.fname}</span> <span>{props.lname}</span> @{props.poster}
                    </Link> 
                  </div>
                   <Drop className="drop" onClick={revealBar}/>
                </div>
                {showCard && <SideCard />}
                {deleteCard && <div className="delete-side-card"> 
                  <p>Delete This Post</p>
                  <p>This action is irreversible</p>
                  <div className="confirm-delete">
                    <button onClick={revealDelete}> Cancel </button>
                    <button onClick={deletePost}> Delete </button>
                  </div>
                            </div>}
                <div className="post-content"> {props.content} </div>
              
                {/* <div className="post-image" style={{backgroundImage: `url(${props.image})`}}> */}
                <div className="post-image">
                    <img className="post-imager" src={props.image} alt="profile logo"/>
                </div>
                <div className='like-comment-box'>
                  <div className="like-box">
                    <Like fill={liked} stroke={stroke} className="like-button" onClick={handleClick}/>
                    <div>
                      <span> {(props.likeCount > 0) && props.likeCount} </span> {(props.likeCount > 1) ? <span> Likes </span> : <span> Like </span>}
                    </div>
                  </div>
                  <div className="comment-box" onClick={revealComments}> 
                    <Comment className="comment-button"/>
                    <div className="comment-box-1">
                      <span> {(comments.length > 0) && comments.length} </span> {(comments.length > 1) ? <span> Comments </span> : <span> Comment </span>}
                    </div>
                  </div>
                </div>
            </div>

            <Comments allComment={comments} setAllComment={setComments} postId={props.id} 
                          top={showComment} reveal={setShowComment} prof={profile} 
                          postAvatar={props.avatar} cont={props.content} firname={props.fname} 
                          lasname={props.lname} postr={props.poster} contImage={props.image}
                          />
          </div>
          :
            <div className="post-hidden">

              <div className="hidden-eye">
                <Hidden fill="red"/>
              </div>

              <div className="hidden-text-content">
                <p>Post Hidden</p>
                <p>You will no longer see this post in your timeline.</p>
              </div>

              <div className="unhide">
                <UnHide onClick={hidePost ? handleReport : handleInterest}/>
                <p>Unhide</p>
              </div>

            </div>
          }
        </div>
    )
}

export default Posts;
