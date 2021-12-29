import React, { useContext } from "react";
import { Link} from 'react-router-dom'

function FollowList(props){
    return (
        <div className="note">
            <h1 >  Welcome to followers page </h1>
            {props.followers && props.followers.map(lists => lists.username)}
        </div>
    )
}

export default FollowList;
