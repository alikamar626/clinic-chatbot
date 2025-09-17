import React, { useState } from "react";
import { useAuth } from "./AuthContext"; // Use the updated AuthContext
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { FaUserCircle } from "react-icons/fa"; // Import a profile icon
import { CustomUser } from "../types"; // Import the custom user type

const Header: React.FC = () => {
  const user = useAuth(); // Get the user from the AuthContext
  const navigate = useNavigate(); // Initialize the navigate function
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu visibility on mobile

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/login"); // Redirect to the login page after signing out
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu visibility on mobile
  };

  return (
    <header className="header">
      <div className="logo">My Clinic App</div>

      {/* Hamburger Icon */}
      <div className="hamburger-icon" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
        {/* Navigation Links */}
        <a href="/" className="nav-link">
          Home
        </a>
        <a href="/about" className="nav-link">
          About Us
        </a>
        <a href="/appointment" className="nav-link">
          Take Appointment
        </a>

        {user ? (
          <>
            {/* Show user profile info if user is logged in */}
            <div className="profile-section">
              <FaUserCircle className="profile-icon" />
              <div className="profile-info">
                {user.name && <span className="user-name">{user.name}</span>}
                {user.phone && <span className="user-phone">{user.phone}</span>}
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Show login and signup links if user is not logged in */}
            <a href="/login" className="nav-link">
              Login
            </a>
            <a href="/signup" className="nav-link">
              Sign Up
            </a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
