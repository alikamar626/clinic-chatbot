import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

interface UserData {
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  isAdmin: boolean; // Explicitly set to false for all new users
}

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      // Prepare user data for Firestore - explicitly set isAdmin to false
      const userData: UserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date(),
        isAdmin: false // All new users are non-admin
      };

      // Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Send verification email
      await sendEmailVerification(user);

      setMessage("✅ Account created! A verification email has been sent.");
      setLoading(false);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setLoading(false);
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("Email is already in use. Please use a different email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("❌ Error during signup: " + error.message);
      }
      console.error("Error during signup:", error);
    }
  };

  const resendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage("✅ Verification email has been resent.");
      } catch (error: any) {
        setError("Failed to resend verification email: " + error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2 className="form-title">Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleSignup}>
          {/* Name Field */}
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Email Field */}
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password Field */}
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input-field"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className="input-field"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Phone Number Field */}
          <input
            type="tel"
            name="phone"
            className="input-field"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {/* Sign Up Button */}
          <button 
            type="submit" 
            className="button" 
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Resend Verification Email Button */}
        {message && (
          <button
            type="button"
            className="button secondary"
            onClick={resendVerificationEmail}
            disabled={loading}
          >
            Resend Verification Email
          </button>
        )}

        <p className="form-footer">
          Already have an account? <a href="/login" className="link">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;