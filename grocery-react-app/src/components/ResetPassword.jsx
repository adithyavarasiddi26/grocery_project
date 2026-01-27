import Button from "@mui/material/Button";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api';
import "./ResetPassword.css";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!password || !confirmPassword) {
      alert("All fields are required");
      return;
    }
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to reset password");
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.removeItem('token');
        alert("Password reset successful! Please login with your new password.");
        window.location.href = '/login';
      } else {
        alert(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-password-container">
      <button type="button" className="btn" onClick={() => window.history.back()} aria-label="Back">
        &#8592;
      </button>
      <h2>Reset Password</h2>
      <form className="reset-password-form">
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="reset-password-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: "40px" }}
          />
          <span
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#52796F", fontSize: "20px" }}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#52796F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#52796F" strokeWidth="2"/></svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.97 10.97 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M9.53 4.53A10.97 10.97 0 0 1 12 5c7 0 11 7 11 7a21.77 21.77 0 0 1-3.17 4.13M1 1l22 22" stroke="#52796F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            className="reset-password-input"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ paddingRight: "40px" }}
          />
          <span
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#52796F", fontSize: "20px" }}
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="#52796F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#52796F" strokeWidth="2"/></svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.97 10.97 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06M9.53 4.53A10.97 10.97 0 0 1 12 5c7 0 11 7 11 7a21.77 21.77 0 0 1-3.17 4.13M1 1l22 22" stroke="#52796F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
        </div>
        <button type="submit" onClick={handlePasswordReset} className="btn reset-password-button" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;