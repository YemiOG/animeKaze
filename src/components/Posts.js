function Posts(props){
	return (
            <div className="note">
                <h1 >  {props.content} </h1>
				<img alt={""} src={props.image} />
            </div>
    )
}

export default Posts;
