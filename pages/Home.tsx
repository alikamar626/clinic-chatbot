import React from "react";
import "./Home.css";
import { FaClinicMedical, FaHandHoldingHeart, FaProcedures, FaCalendarCheck, FaClipboardList, FaUserMd, FaBell } from "react-icons/fa";
import Header from "./Header"; // Import the Header component

const Home = () => {
  return (
    <div className="home-container">
      {/* Include the Header component */}
      <Header />

      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome to My Clinic App</h1>
        <p>
          Your heart health is our priority. We provide comprehensive care with
          state-of-the-art technology and expert doctors.
        </p>
        <button className="appointment-button">
          <FaCalendarCheck className="button-icon" />
          Make an Appointment
        </button>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="service-card">
            <FaClinicMedical className="service-icon" />
            <h3>General Supporters</h3>
            <p>Your Accountants and other clients.</p>
          </div>
          <div className="service-card">
            <FaHandHoldingHeart className="service-icon" />
            <h3>Rehabilitation</h3>
            <p>Innovation and rehabilitation programs.</p>
          </div>
          <div className="service-card">
            <FaProcedures className="service-icon" />
            <h3>Heart Surgery</h3>
            <p>Awarded by the International Medical Systems.</p>
          </div>
        </div>
      </div>

    

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="how-it-works-cards">
          <div className="how-it-works-card">
            <FaClipboardList className="how-icon" />
            <h3>Book Appointment</h3>
            <p>Schedule an appointment with our expert doctors.</p>
          </div>
          <div className="how-it-works-card">
            <FaUserMd className="how-icon" />
            <h3>Get Services</h3>
            <p>Receive top-quality medical care from our specialists.</p>
          </div>
          <div className="how-it-works-card">
            <FaBell className="how-icon" />
            <h3>Medication Reminders</h3>
            <p>We will remind you when it's time to take your medication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
