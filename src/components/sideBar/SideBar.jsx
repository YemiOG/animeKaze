import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/userContext'
import CreateButton from './sideButtons'

function Sidebar(props) {
  const {token}= useContext(UserContext);
  const avatar = window.localStorage.getItem('avatar')
  const username = window.localStorage.getItem('username')
  const { unAuthButtons, AuthButtons, isActive, setActive , iconColor} = CreateButton();
  const user = {username}
  const profile = "/user/" + user.username

  console.log(iconColor)
  return (
    <>
    <div className="side-bar">
      <div className="bar-content">
        {(!token && token !== "" && token !== undefined) ? 
          <>
          {unAuthButtons.map(item => <div key={item.id}>
                                <button  onClick={item.action}> 
                                        <item.icon className="icons" stroke={iconColor}/> 
                                        <p className="side-text">{item.text}</p>
                                </button> 
                              </div> 
                              )}
          <button className="bar-contents">
              <p>hello</p>
          </button>
          </>
        :
          <>

          {AuthButtons.map(item => <div key={item.id}>
                                <button className={isActive === item.id ? 'active-button' : ''} 
                                          onClick={() => item.action(item.id)}> 
                                        <item.icon className="icons" stroke= {isActive === item.id ? iconColor : '#546E7A'}/> 
                                        <p className="side-text">{item.text}</p>
                                </button> 
                              </div> 
                              )}
                               
          <Link to={profile} className="myProfile" onClick={() => setActive(5)}>
                <div className='profileImage'>
                  <img src={avatar} alt="profile logo"/>
                </div>
                <p className="user-name">{username}</p>
          </Link> 

          </>
        }
      </div>
    </div>
    </>
  );
}

export default Sidebar;
