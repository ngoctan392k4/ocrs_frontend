import React, { useContext } from 'react'
import { AuthContext } from './AuthSession'
import { Navigate } from 'react-router-dom';

function EnsureLoggedToRoutes({children}) {
  const {loggedIn, isLoading} = useContext(AuthContext);

  if(isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  if(!loggedIn){
    return <Navigate to="/" replace/>
  }

  return children;
}

export default EnsureLoggedToRoutes
