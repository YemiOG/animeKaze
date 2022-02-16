import React, {useState} from "react";
import Comments from "../comments/Comments"


import { ReactComponent as Like } from '../../images/svg/like.svg'
import { ReactComponent as Comment } from '../../images/svg/comment.svg'

function Posts(props){
  let fillColor= 'none'
  let strokeColor= '#575757'

  if (props.userLiked===true) {
      fillColor='#2962FF'
      strokeColor= '#2962FF'
  }
	const [comments , setComments] = useState("")
	const [topComment , setTopComment] = useState(true)
	const [liked , setLiked] = useState(fillColor)
	const [stroke , setStroke] = useState(strokeColor)

    function handleClick(){
        props.like(props.id)
        console.log(liked)
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
        setTopComment(false);
      }
    
    // = getRandomComment(comments)
  // console.log(randomComment(comments))
  console.log(comments)
	return (
        <div className="post-card">
          <div className="post-list">
              <h1 >  {props.content} </h1>
				      <img alt={""} src={props.image} />
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
          <Comments allComment={comments} setAllComment={setComments} postId={props.id} top={topComment}/>
          {props.report && <button onClick={handleReport}> Report </button>}
          {props.interested && <button onClick={handleInterest}> Not interested </button>}
        </div>
    )
}

export default Posts;
