import { useContext } from 'react'
import { UserContext } from '../contexts/userContext'
import { useNavigate } from 'react-router';
import Search from "../search/Search"
import Trend from "../trendingAnime/trending"
import logo from '../../images/logo.png'

import { ReactComponent as TrendIcon } from '../../images/svg/trending.svg'

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
      <div className="top-header">
        <div className="header-top">
          <div className="logo">
              <img src={logo} alt=""/>
              <p>BANKAI</p>
          </div>
          <div className="trend-icon">
            <TrendIcon />
          </div>
        </div>
        <div className="top-search">
          <Search />
        </div>
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
