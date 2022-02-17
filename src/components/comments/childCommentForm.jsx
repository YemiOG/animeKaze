import { ReactComponent as Post } from '../../images/svg/post.svg'

function ChildCommentForm(props) {
	
	return (
		<form className="comment-form" onSubmit={props.commentform}>
				<div className='profileImage'>
					<img src={props.avatar} alt="profile logo"/>
				</div>
                <textarea
                    className=""
                    type="text"
                    name="content"
                    placeholder="Reply comment..."
					onFocus={props.focus}
					onBlur={props.focus}
					rows={props.row}
					value={props.new}
					onChange={props.change} />
				<div className="comment-btn">
					<Post />
				</div>
	</form>
	);
  }
  
  export default ChildCommentForm;
