function EditProfile(props){
  console.log(props)
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
        <div>
          <div className="note">
              <h1 >  {props.content} </h1>
				      <img alt={""} src={props.image} />
              <p> {props.likeCount} </p>
              <button onClick={handleClick}> Like </button>
              {props.report && <button onClick={handleReport}> Report </button>}
              {props.interested && <button onClick={handleInterest}> Not interested </button>}
          </div>
        </div>
    )
}

export default EditProfile;
