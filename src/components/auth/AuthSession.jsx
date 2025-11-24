import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthSession = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch("http://localhost:3001/api/check-session", {
        credentials: "include",
      });

      const data = await response.json();
      setLoggedIn(data.loggedIn);
      setUser(data.user || null);
    };

    checkSession();
  }, []);
  const logout = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setLoggedIn(false);
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
