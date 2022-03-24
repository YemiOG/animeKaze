import { ReactComponent as Post } from '../../images/svg/post.svg'

function CommentForm(props) {
	return (
		<>
			<p>Add a comment</p>
			<form className="comment-form" onSubmit={props.commentform}>
					<div className='profile-image'>
						<img src={props.avatar} alt="profile logo"/>
					</div>
					<textarea
						className=""
						type="text"
						name="content"
						placeholder="Add a comment..."
						onFocus={props.focus}
						onBlur={props.focus}
						rows={props.row}
						value={props.new}
						onChange={props.change} 
						required
						/>

					<button className="comment-btn" disabled={props.poss}>
						<Post />
					</button>
			</form>
		</>
	);
  }
  
  export default CommentForm;
