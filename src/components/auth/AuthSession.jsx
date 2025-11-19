import { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext();

export const AuthSession = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            const response = await fetch('http://localhost:3001/api/check-session', {
                credentials: "include"
            });

            const data = await response.json();
            setLoggedIn(data.loggedIn);
            setUser(data.user || null);
        }

        checkSession();
    }, [])

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
