import {useContext} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/userContext';

function AuthedRoute( {children}) {
        let location = useLocation();
        const {token} = useContext(UserContext);
        if(!token && token!=="" && token !== undefined)
        {
            return <Navigate to="/login" state={{from: location}} />
        }
        return children
    }

export default AuthedRoute;

// :{children : Component}
