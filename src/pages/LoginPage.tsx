import './LoginPage.css';

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';

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

    try {
      const response = await axios.post("https://bookify-api-nk6g.onrender.com/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        auth?.login(token); //Update AuthContext state
        navigate("/");
      }
    } catch (err: any) {
      setError("Wrong email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Log in</h2>

      {/* Loading message with better visibility */}
      {loading && <p className="loading-text">Loading...</p>}

      {/* Error message */}
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleLogin}>
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
            required
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
            required
          />
        </div>

        <button type="submit" disabled={loading}>Log in</button>
      </form>
    </div>
  );
};

export default LoginPage;
