import './LoginPage.css';

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/apiService';

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext); // Get AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    //Validate input
    if (!email.trim() || !password.trim()) {
      setError("You need to enter a valid email and password.");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      auth?.login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <h1>Log in</h1>

      <form onSubmit={handleLogin} noValidate>{/* inactivate browsers validation */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Loading message */}
        {loading && <p className="loading-text">Loading...</p>}

        {/* Error message */}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>Log in</button>
      </form>
    </div>
  );
};

export default LoginPage;
