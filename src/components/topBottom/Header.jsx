import { useContext } from 'react'
import { UserContext } from '../contexts/userContext'
import { useNavigate } from 'react-router';
import Search from "../search/Search"
import logo from '../../images/logo.png'

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
        <div className="logo">
          <img src={logo} alt=""/>
          <p>BANKAI</p>
        </div>
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
