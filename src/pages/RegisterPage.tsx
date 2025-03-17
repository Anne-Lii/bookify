import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const RegisterPage = () => {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    //validate
    if (username.length < 3) {
      setError("Username must be 3 characters or more.");
      setLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("Provide a valid email.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be atleast 6 characters or more.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://bookify-api-nk6g.onrender.com/register", {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        navigate("/login"); //send user to loginpage after successful registration
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed, try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h2>Registrera dig</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Register..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage
