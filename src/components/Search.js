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
        setNewSearch(newValue)
        setNewSearchResult("")
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
			const data = response.data.items
            (response.data.items[0] ?
			(setNewSearchResult(response.data.items),
            setNoUser(false))
            :
            setNoUser(true),
            )
		  }).catch((error) => {
			if (error.response) {
			//   if (error.response.status === 404){
			// 	setNewSearchResult("")
			//   }
			  }
		  })
        setNewSearch("")
        event.preventDefault()
    }
	
    function Display(props) {
		const profile = "/user/" + props.username
        return (
            <Link to={profile} className="nav-link">
                    <h1>{props.username}</h1>
                    <h1>{props.f_name}</h1>
                    <h1>{props.l_name}</h1>
			</Link> 
		)
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
				{searchresult[0] ? searchresult.map(search => <Display key={search.id} f_name={search.firstname} 
                                                              l_name={search.lastname} username={search.username} />)
                                                    :
                                    (noUser ? <UserNotFound/> : null )
                }
            </div>
        );
}

export default Search;
