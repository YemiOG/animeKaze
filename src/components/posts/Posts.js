import React, {useState} from "react";
import Comments from "../comments/Comments"


import { ReactComponent as Like } from '../../images/svg/like.svg'
import { ReactComponent as Comment } from '../../images/svg/comment.svg'

function Posts(props){

	const [comments , setComments] = useState("")

    function handleClick(){
        props.like(props.id);
      }
    function handleReport(){
        props.report(props.id);
      }
    function handleInterest(){
        props.interested(props.id);
      }

  console.log(comments.length)
	return (
        <div className="post-card">
          <div className="post-list">
              <h1 >  {props.content} </h1>
				      <img alt={""} src={props.image} />
              <div className='like-comment-box'>
                <div className="like-box">
                  <Like className="like-button" onClick={handleClick}/>
                  <div>
                    <span> {(props.likeCount > 0) && props.likeCount} </span> {(props.likeCount > 1) ? <span> Likes </span> : <span> Like </span>}
                  </div>
                </div>
                <div className="comment-box">
                  <Comment className="comment-button"/>
                  <div className="comment-box-1">
                    <span> {(comments.length > 0) && comments.length} </span> {(comments.length > 1) ? <span> Comments </span> : <span> Comment </span>}
                  </div>
                </div>
              </div>
          </div>
          <Comments allComment={comments} setAllComment={setComments} postId={props.id}/>
          {props.report && <button onClick={handleReport}> Report </button>}
          {props.interested && <button onClick={handleInterest}> Not interested </button>}
        </div>
    )
}

export default Posts;
