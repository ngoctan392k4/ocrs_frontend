import React, { useContext } from 'react'
import { AuthContext } from './AuthSession'
import { Navigate } from 'react-router-dom';

function EnsureLoggedToRoutes({children}) {
  const {loggedIn} = useContext(AuthContext);

  if(!loggedIn){
    return <Navigate to="/" replace/>
  }

  return children;
}

export default EnsureLoggedToRoutes
