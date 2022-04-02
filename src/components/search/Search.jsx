import React,{useState,useEffect, useRef} from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";
import UserNotFound from '../error/userNotFound'
import IconSearch from '../../images/search.png'

function Search() {
    const [searchs , setNewSearch] = useState("")
    const [searchresult , setNewSearchResult] = useState("")
	const [noUser, setNoUser] = useState(false)

    function removeDiv(){
        console.log("here")
        setNewSearchResult(null)
        setNoUser(false)
    }
    
    const notFoundDiv = useRef(null);
    
    useEffect(()=>{
        notFoundDiv.current && notFoundDiv.current.focus();
      }, []);

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
            console.log(data)
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
            <div className="user-list">
            	<div className='profile-image'>
					<img src={props.avatar} alt="profile logo"/>
				</div>
                <Link to={profile} className="navr-link">
                    <div className="fullname">
                        <span>{props.fname} </span> <span> {props.lname}</span>
                    </div>
                    <h1>@{props.username}</h1>
                </Link> 
            </div>
		)
    }
    
        return (
            <div className="search-form">
                <form onSubmit={submitSearch} className="searchForm">
                        <input
                            className="form-control form-control-lg"
                            type="text"
                            name="searchy"
                            placeholder="Search for anything here"
                            value={searchs}
                            onChange={handleChange}
                            onFocus= {removeDiv}/>
                        <button
                            className="pull-xs-right search-btn"
                            type="submit">
                            <img src={IconSearch} alt=""/>
                        </button>
                </form>         
                    {searchresult && <div className="container-page" tabIndex={1} onBlur= {removeDiv} ref={notFoundDiv} autoFocus>
                        {searchresult[0] && searchresult.map(search => <Display key={search.id} f_name={search.firstname} 
                                                                            l_name={search.lastname} username={search.username} 
                                                                            avatar={search.avatar} fname={search.firstname} 
                                                                            lname={search.lastname}
                                                                            />)}

                    </div>}
                    {noUser ? <UserNotFound notFound={setNoUser}/> : null}
            </div>
        );
}

export default Search;
