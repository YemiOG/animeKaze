import React, {useState, useContext} from "react";
import { UserContext } from '../contexts/userContext';
import axios from "axios";
import InputEmoji from "react-input-emoji";

import photo from '../../images/photoIcon.png'
import emoji from '../../images/emoji.png'

function CreatePost(props){

	const [content, setContent] = useState("")
	const [textArea, setTextArea] = useState(false)
	const avatar = window.localStorage.getItem('avatar')
	const userId = JSON.parse(window.localStorage.getItem("cuid"))
	const {token, removeToken}= useContext(UserContext)

	// function handleChange(event) { 
	// 	const post = event.target.value
	// 	setContent(post)
	// }

	function expandTextArea(){
		setTextArea(true)
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

	// chosenEmoji && (content+=chosenEmoji)
	// console.log(content)
	// console.log(chosenEmoji)

	return (
		<>
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
					rows='3'
					required
				/>
				:
				<input onClick={expandTextArea} className='text' type="text" required/>
				}
				
			</div>
			<div className="formBottom">
				<label htmlFor="image"> <img src={photo} alt=""/> <p>Photo/Video</p> </label>
				<input type="file" id="image" name="file" accept="image/*" className="file-custom" required/>
				<input  name="uid" value={userId} hidden readOnly={true}/>
				<button
					className="sub-btn btn-lg btn-primary pull-xs-right"
					type="submit">
					Post
				</button>
			</div>
		</form>
		</>
	)
}

export default CreatePost;
