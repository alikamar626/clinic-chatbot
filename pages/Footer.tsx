import React from "react";
import "./Footer.css"; // Import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2023 My Clinic App. All rights reserved.</p>
      <div className="social-links">
        <a href="https://facebook.com" className="social-link">Facebook</a>
        <a href="https://twitter.com" className="social-link">Twitter</a>
        <a href="https://instagram.com" className="social-link">Instagram</a>
      </div>
    </footer>
  );
};

export default Footer;
