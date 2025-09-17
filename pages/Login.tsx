import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Log in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      // Force refresh the ID token to get the latest claims
      await user.getIdToken(true);
      const idTokenResult = await user.getIdTokenResult();
      console.log("User claims:", idTokenResult.claims); // Debugging

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        setError("User data not found.");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      
      // Check admin status from both Auth claims and Firestore
      const isAdmin = userData.isAdmin;
      
      if (isAdmin) {
        navigate("/admin"); // Redirect to admin page
      } else {
        navigate("/home", { state: { user: userData } });
      }

    } catch (error: any) {
      setLoading(false);
      console.error("Login error:", error);
      
      switch (error.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="form-title">Login</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          className="button" 
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="form-footer">
        <p>
          <a href="/forgot-password" className="link">
            Forgot Password?
          </a>
        </p>
        <p>
          Don't have an account?{" "}
          <a href="/signup" className="link">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;