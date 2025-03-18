import './RegisterPage.css'

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../services/apiService';


const RegisterPage = () => {
  //states
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //states for errormessage
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setLoading(true);

    let isValid = true;

    //Validate input
    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      isValid = false;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Provide a valid email address.");
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!isValid) {
      setLoading(false);
      return; //if not valid stop and return
    }

    try {
      const success = await registerUser(username, email, password);
      if (success) navigate("/login");
  } catch (err) {
    setGeneralError("Registration failed. Try again."); 
  } finally {
      setLoading(false);
  }
  };

  return (
    <div className='register-container'>
      <h1>Register new account</h1>
      {generalError && <p className="register-error-message">{generalError}</p>}
      <form onSubmit={handleRegister} noValidate> {/* 👈 Stänger av webbläsarens inbyggda validering */}
        
        {/* USERNAME */}
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {usernameError && <p className="register-error-message">{usernameError}</p>}

        {/* EMAIL */}
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="register-error-message">{emailError}</p>}

        {/* PASSWORD */}
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <p className="register-error-message">{passwordError}</p>}

        {/* REGISTER BUTTON */}
        <button type="submit" disabled={loading}>
          {loading ? "Register..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage

