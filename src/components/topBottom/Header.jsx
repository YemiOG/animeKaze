import { useContext } from 'react'
import { UserContext } from '../contexts/userContext'
import { useNavigate } from 'react-router';
import Search from "../search/Search"

function Header(props) {
  let navigate = useNavigate();
  const {token}= useContext(UserContext);
  
    function logMeIn(){
      navigate("/login")
    }

    function registerMe(){
      navigate("/register")
    }

  return (
    <header>
      <div className="topHeader">
        <Search />
      </div>
      {(!token && token !== "" && token !== undefined) ? 
        <>
          <button onClick={logMeIn}> Login </button> 
          <button onClick={registerMe}> Sign Up </button>
        </>
       :
        null
      }
    </header>
  );
}

export default Header;
