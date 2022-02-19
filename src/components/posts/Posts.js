import React, {useState} from "react";
import { Link } from 'react-router-dom'
import Comments from "../comments/Comments"

import { ReactComponent as Like } from '../../images/svg/like.svg'
import { ReactComponent as Comment } from '../../images/svg/comment.svg'
import { ReactComponent as Drop } from '../../images/svg/dropdown.svg'

function Posts(props){
  let fillColor= 'none'
  let strokeColor= '#575757'

  if (props.userLiked===true) {
      fillColor='#2962FF'
      strokeColor= '#2962FF'
  }

	const [comments , setComments] = useState("")
	const [showComment , setShowComment] = useState(false)
	const [showCard , setShowCard] = useState(false)
	const [liked , setLiked] = useState(fillColor)
	const [stroke , setStroke] = useState(strokeColor)
  const usernamer = window.localStorage.getItem('username')
  const profile = "/user/" + props.poster 

    function handleClick(){
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
      }
    function handleInterest(){
        props.interested(props.id);
      }
    function revealComments(){
      showComment===false ? setShowComment(true) : setShowComment(false)
      }

    function revealBar(){
      showCard===false ? setShowCard(true) : setShowCard(false);
      }


    function SideCard(){

      return (
        <div className="side-card">
            {props.report && <button onClick={handleReport}> Report </button>}
            {props.interested && <button onClick={handleInterest}> Not interested </button>}
            {(usernamer!==props.poster) && props.unfollow ? <button onClick={() => props.unfollow(props.poster)}> Unfollow </button> : null}
        </div>
      )}

	return (
        <div className="post-card">
          <div className="post-list">
              <div className="post-image-top">
                <div className="post-image-top1">
                  <div className='profile-image'>
                    <img src={props.avatar} alt="profile logo"/>
                  </div>
                  <Link to={profile}
                    className="nav-link">
                    <span>{props.fname}</span><span>{props.lname}</span>@{props.poster}
                  </Link> 
                </div>
                <Drop className="drop" onClick={revealBar}/>
              </div>
              {showCard && <SideCard />}
              <div className="post-content"> {props.content} </div>
              
				      {/* <img className="post-image" alt="" src={props.image} /> */}
              <div className="post-image" style={{backgroundImage: `url(${props.image})`}}>

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
          <Comments allComment={comments} setAllComment={setComments} postId={props.id} top={showComment}/>
        </div>
    )
}

export default Posts;
