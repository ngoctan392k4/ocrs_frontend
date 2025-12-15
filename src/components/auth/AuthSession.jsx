import { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext();

export const AuthSession = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        setLoggedIn(false);
        setUser(null);
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/check-session', {
                    credentials: "include"
                });

                const data = await response.json();
                setLoggedIn(data.loggedIn);
                setUser(data.user || null);
            } catch (error) {
                console.error('Session check error:', error);
                setLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkSession();
    }, [])

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
