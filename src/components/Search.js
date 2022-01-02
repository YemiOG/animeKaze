import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";
import UserNotFound from './error/userNotFound'

function Search() {
    const [searchs , setNewSearch] = useState("")
    const [searchresult , setNewSearchResult] = useState("")
	const [noUser, setNoUser] = useState(false)

    function handleChange(event) {
        const newValue = event.target.value
        setNewSearch(newValue);
    }

    function submitSearch(event){
        const searched = event.target.searchy.value;
		axios({
			method: "POST",
			url: '/api/search',
			data:{
				username: searched,
			   }
		  }).then((response)=>{
			const data = response.data.username
			setNewSearchResult(data)
		  }).catch((error) => {
			if (error.response) {
			  if (error.response.status === 404){
				setNoUser(true)
				setNewSearchResult("")
			  }
			  }
		  })
        setNewSearch("")
        event.preventDefault()
      }
	
    function Display(props) {
		const user = {searchresult}
		const profile = "/user/" + user.searchresult
        if (props.lookup) {
            return (
			<Link to={profile}
        className="nav-link">
        {searchresult}
        </Link> 
		)}
        else {return ( (noUser ? <UserNotFound/> : null )
			)
			}
    }
    
        return (
            <div className="profile-page">
                <form onSubmit={submitSearch}>
                    <fieldset>
                        <fieldset className="form-group">
                            <input
                                className="form-control form-control-lg"
                                type="text"
                                name="searchy"
                                placeholder="Search for name or username"
                                value={searchs}
                                onChange={handleChange} />
                        </fieldset>
                        <button
                            className="btn btn-lg btn-primary pull-xs-right"
                            type="submit">
                            Search
                        </button>
                    </fieldset>
                </form>
					<Display lookup={searchresult}/>
            </div>
        );
}

export default Search;
