import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

import "./Login.css";  // استايلات منفصلة لهذه الصفحة

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("✅ A password reset link has been sent to your email.");
        } catch (error) {
            setError("❌ Failed to send reset email. Please check your email.");
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <h2 className="form-title">Reset Password</h2>
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <form onSubmit={handleResetPassword}>
                    <div>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>

                    <button type="submit" className="button">Send Reset Link</button>
                </form>

                <p className="form-footer">
                    <a href="/login" className="link">Back to Login</a>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
