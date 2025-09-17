import React from "react";
import "./aboutus.css";
import { FaHeartbeat, FaMicroscope, FaUserMd, FaHandsHelping, FaHospitalUser, FaBriefcaseMedical } from "react-icons/fa"; 

const AboutUs = () => {
  return (
    <div className="about-us-container">
      {/* Hero Section */}
      <div className="about-hero-section">
        <h1>About Us</h1>
        <p>
          We are committed to excellence in cardiovascular care, offering cutting-edge treatments and a patient-centered approach to ensure the best outcomes.
        </p>
      </div>

      {/* Mission and Vision Section */}
      <div className="mission-vision-section">
        <div className="mission-card">
          <FaHeartbeat className="about-icon" />
          <h2>Our Mission</h2>
          <p>
            To deliver world-class cardiac care by integrating innovation, expertise, and compassionate patient support.
          </p>
        </div>
        <div className="vision-card">
          <FaMicroscope className="about-icon" />
          <h2>Our Vision</h2>
          <p>
            To be a global leader in cardiovascular health, advancing medical research and providing state-of-the-art treatments.
          </p>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-cards">
          <div className="value-card">
            <FaHandsHelping className="value-icon" />
            <h3>Compassion</h3>
            <p>We prioritize patient well-being and provide empathetic, personalized care.</p>
          </div>
          <div className="value-card">
            <FaBriefcaseMedical className="value-icon" />
            <h3>Innovation</h3>
            <p>We embrace the latest medical advancements to improve cardiac treatments.</p>
          </div>
          <div className="value-card">
            <FaHospitalUser className="value-icon" />
            <h3>Excellence</h3>
            <p>We uphold the highest medical standards to ensure optimal patient outcomes.</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-cards">
          <div className="team-card">
            <FaUserMd className="team-icon" />
            <h3>Renowned Cardiologists</h3>
            <p>Our experienced cardiologists are leaders in the field, committed to exceptional patient care.</p>
          </div>
          <div className="team-card">
            <FaHospitalUser className="team-icon" />
            <h3>Dedicated Medical Staff</h3>
            <p>Our professional healthcare team ensures seamless and high-quality patient care at every stage.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
