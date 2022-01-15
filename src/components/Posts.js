function Posts(props){
    function handleClick(){
        props.like(props.id);
      }
	return (
            <div className="note">
                <h1 >  {props.content} </h1>
				<img alt={""} src={props.image} />
                <p> {props.likeCount} </p>
                <button onClick={handleClick}> Like </button>
            </div>
    )
}

export default Posts;
