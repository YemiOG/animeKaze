import { useContext, useState } from 'react'
import { UserContext } from '../contexts/userContext'
import { useNavigate } from 'react-router';
import Search from "../search/Search"
import Trend from "../trendingAnime/trendingHeader"
import logo from '../../images/logo.png'
import Modal from 'react-bootstrap/Modal'

import { ReactComponent as TrendIcon } from '../../images/svg/trending.svg'
import { ReactComponent as Close } from '../../images/svg/closeButton.svg'

function Header(props) {
  let navigate = useNavigate();
  const {token}= useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  
    function logMeIn(){
      navigate("/login")
    }

    function registerMe(){
      navigate("/register")
    }

  return (
    <>
      <header>
        <div className="top-header">
            <div className="logo">
                <img src={logo} alt=""/>
                <p>BANKAI</p>
            </div>
            <div className="trend-icon" onClick={() => setShowModal(true)}>
              <TrendIcon />
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

      <Modal 
				show={showModal} 
				onHide={() => setShowModal(false)} >

				<Modal.Header>
          <div className="modal-title-cover">
            <Modal.Title>
            <p>Trending Animes</p>
            <div className="close-modal-button">
							<Close onClick = {() => setShowModal(false)}/>
						</div>
            </Modal.Title>
          </div>
				</Modal.Header>

				<Modal.Body>
          <Trend />
				</Modal.Body>

				<Modal.Footer>
				</Modal.Footer>
			</Modal>
    </>
  );
}

export default Header;
