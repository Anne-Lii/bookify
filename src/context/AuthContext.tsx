import { createContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const validateToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    //validate token
    try {
      const response = await axios.get("https://bookify-api-nk6g.onrender.com/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setIsLoggedIn(true);//if status ok set state to logged in
        setUser(response.data.user);
      } else {
        localStorage.removeItem("token");//else remove token from localstorage
        setIsLoggedIn(false);//and set state to not logged in
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);//save token in localstorage when loggin in
    setIsLoggedIn(true); //update state to logged in
    setUser(user); //save userinfo
  };

  const logout = () => {
    localStorage.removeItem("token");//removes token when logging out
    setIsLoggedIn(false);//change state Logged in to false
    setUser(null);//sets state User to 
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
