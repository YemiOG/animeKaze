import Comments from "../comments/Comments"

function Posts(props){
    function handleClick(){
        props.like(props.id);
      }
    function handleReport(){
        props.report(props.id);
      }
    function handleInterest(){
        props.interested(props.id);
      }
	return (
        <div className="post-card">
          <div className="post-list">
              <h1 >  {props.content} </h1>
				      <img alt={""} src={props.image} />
              <p> {props.likeCount} </p>
              <button onClick={handleClick}> Like </button>
              {props.report && <button onClick={handleReport}> Report </button>}
              {props.interested && <button onClick={handleInterest}> Not interested </button>}
          </div>
          <div className="comment">
            <Comments postId={props.id}/>
          </div>
        </div>
    )
}

export default Posts;
