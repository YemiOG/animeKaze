import React, {useState, useContext} from "react";
import { UserContext } from '../contexts/userContext';
import axios from "axios";
import InputEmoji from "react-input-emoji";

import photo from '../../images/photoIcon.png'
import emoji from '../../images/emoji.png'

function CreatePost(props){

	const [content, setContent] = useState("")
	const [image, setImage] = useState(null);
	const [textArea, setTextArea] = useState(false)
	const avatar = window.localStorage.getItem('avatar')
	const userId = JSON.parse(window.localStorage.getItem("cuid"))
	const {token, removeToken}= useContext(UserContext)
	
	function expandTextArea(){
		setTextArea(true)
	}
	
	function onChangeFile(event){
		(
			(event.target.files && (event.target.files[0] != null)) &&
			setImage(URL.createObjectURL(event.target.files[0]))
		)
	}

	function cancelPost(){
		setImage(null)
		setTextArea(false)
	}


	function submitForm (event){
		const formData = new FormData(event.target)
		axios({
			method: "POST",
			url: '/api/upload',
			data:formData,
			headers: {
						Authorization: 'Bearer ' + token
			  		}
			}).then((response)=>{
				props.post() // get posts upon successful post submission
			}).catch((error) => {
				if (error.response) {
				  console.log(error.response)
				  if (error.response.status === 401){
					removeToken()
					}
				  }
			  	})
		setContent("")
		event.target.reset()
		event.preventDefault()
	}

	return (
		<div className="createPost">
			{textArea && <div className="post-top">
					<p>Create a post</p>
					<div onClick={cancelPost}> X </div>
				</div>
			}
			<form onSubmit={submitForm} encType="multipart/form-data" className="post-form">
				<div className="formTop">
					<div className='profileImage'>
						<img src={avatar} alt="profile logo"/>
					</div>
					{textArea ? <InputEmoji
						className='text'
						value={content}
						onChange={setContent}
						placeholder="What's happening?"
						required
					/>
					:
					<input onClick={expandTextArea} className='text' type="text" required/>
					}
					
				</div>
				{image && <div className="picture-preview">
					<div className="top-image-preview">
						<img className="preview" src={image} alt="preview" />
					</div>
					<p onClick={cancelPost}> X </p>
					</div>}
				<div className="formBottom">
					<label onClick={expandTextArea} htmlFor="image"> <img src={photo} alt=""/> <p>Photo/Video</p>  </label>
					{!textArea ? <div className="emoji" onClick={expandTextArea}>  <img src={emoji} alt=""/> <p>Feeling</p> </div> : null}
					<input type="file" id="image" name="file" accept="image/*" className="file-custom" onChange={onChangeFile} required/>
					<input name="uid" value={userId} hidden readOnly={true}/>
					<button
						className="sub-btn btn-lg btn-primary pull-xs-right"
						type="submit">
						Post
					</button>
				</div>
			</form>
		</div>
	)
}

export default CreatePost;
