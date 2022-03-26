import React,{useState,useContext} from 'react';
import axios from "axios";
import { UserContext } from '../contexts/userContext';

function RequestPasswordChange() {

	const [email , setNewEmail] = useState("")
	const [noUser, setNoUser] = useState("")
	const [sent, setSent] = useState("")
	const {token} = useContext(UserContext);

	function handleChange(event) {
        const newValue = event.target.value
        setNewEmail(newValue);
    }

	function Recover(event) {
		axios({
			method: "POST",
			url:"/api/reset_password_request",
			data:{
			  email: email,
			  token:token,
			 }
		})
		.then((response) => {
			setNoUser("")
			setSent(response.data.confirmation)
		}).catch((error) => {
			if (error.response) {
				if (error.response.status === 400){
					setSent("")
					setNoUser(error.response.data.message)
				}
			}
		})
		setNewEmail("")
		event.preventDefault()
	}

    return (
		<div className="profile-page">
			<p>Trouble with logging in?</p>
			<p>Enter your email address and we'll send you a link to get back into your account.</p>
			<form className="login">
            <input onChange={handleChange} 
                type="email"
                text={email} 
                name="email" 
                placeholder="Email" 
                value={email} />
          	<button onClick={Recover}>Submit</button>
        	</form>
			{noUser && <p>{noUser}</p>}
			{sent && <p>{sent}</p>}
		</div>
    );
  };

export default RequestPasswordChange;

