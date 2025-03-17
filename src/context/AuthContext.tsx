import { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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
      } else {
        localStorage.removeItem("token");//else remove token from localstorage
        setIsLoggedIn(false);//and set state to not logged in
      }
    } catch (err) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);//save token in localstorage when loggin in
    setIsLoggedIn(true); //update state to logged in
  };

  const logout = () => {
    localStorage.removeItem("token");//remove token when logging out
    setIsLoggedIn(false); //update state when logged out
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
