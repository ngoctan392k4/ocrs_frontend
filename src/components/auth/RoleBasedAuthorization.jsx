import React, {useContext} from 'react'
import { AuthContext } from './AuthSession'
import { Navigate } from 'react-router-dom';

function RoleBasedAuthorization({allowRole, children}) {
    const { user } = useContext(AuthContext);
    if(!user  || !allowRole.includes(user.role)){
        return <Navigate to="/"/>
    }
    return children;
}

export default RoleBasedAuthorization
