import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useToken() {

  const location = useLocation();
  let navigate = useNavigate();

  function getToken() {
	const userToken = localStorage.getItem('token');
	return userToken && userToken
  }

  const [token, setToken] = useState(getToken());

  function saveToken(userToken) {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };

  function removeToken() {
	localStorage.removeItem("token");
	localStorage.removeItem("cuid");
	localStorage.removeItem("username");
  setToken(null);
  navigate("/login",{state :{ from : location}})
  }

  return {
    setToken: saveToken,
    token,
	  removeToken
  }

}

export default useToken;
