import React from 'react';
import { useContext } from 'react';
import { UserContext } from '../contexts/userContext';

function Loading(Component) {
  return function LoadingComponent(props) {
	const {appState} = useContext(UserContext);

    if (!appState.loading) return <Component {...props}/>;
    return (
      <p style={{ textAlign: 'center', fontSize: '30px' }}>
        Hold on, fetching data may take some time :)
      </p>
    );
  };
}
export default Loading;
