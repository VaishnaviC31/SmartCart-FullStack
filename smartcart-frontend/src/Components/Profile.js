import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ BACKEND_URL }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = () => {
      const token = localStorage.getItem('access');
      if (!token) {
        setError("No token found. Please login.");
        return;
      }

      axios.get(`${BACKEND_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUserData(res.data);
        setFormData({ username: res.data.username, email: res.data.email });
        setError("");
      })
      .catch(err => {
        console.error("Profile Fetch Error:", err.response?.data || err.message);
        // Oru vela 401 vandha token-ai clear panni logout panna solrom
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem('access');
        } else {
          setError("Failed to load profile. Please check backend connection.");
        }
      });
    };

    fetchProfile();
  }, [BACKEND_URL]);

  const handleUpdate = () => {
    const token = localStorage.getItem('access');
    if (isEditing) {
      axios.put(`${BACKEND_URL}/api/profile/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUserData(res.data);
        setIsEditing(false);
        alert("Profile updated successfully! ❤️"); // Heart emoji ingayum sethuten
      })
      .catch(err => alert("Update failed! Please check your connection."));
    } else {
      setIsEditing(true);
    }
  };

  if (error) return (
    <div className="error-msg" style={{padding: '20px', color: 'red'}}>
      {error} <br/>
      <button onClick={() => window.location.href='/login'} className="login-btn">Go to Login</button>
    </div>
  );
  
  if (!userData) return <p className="loading">Loading profile details...</p>;

  return (
    <div className="profile-card">
      <h2 className="profile-title">My Profile</h2>
      <div className="profile-info">
        {isEditing ? (
          <div className="edit-form">
            <input 
              className="edit-input"
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              placeholder="Username"
            />
            <input 
              className="edit-input"
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="Email"
            />
          </div>
        ) : (
          <div className="display-info">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Status:</strong> <span style={{color: 'green'}}>● Active User</span></p>
          </div>
        )}
      </div>
      
      <div className="profile-actions">
        <button className="edit-btn" onClick={handleUpdate}>
          {isEditing ? "💾 Save Changes" : "✏️ Edit Profile"}
        </button>
        {isEditing && (
          <button className="cancel-btn" onClick={() => setIsEditing(false)} style={{marginLeft: '10px'}}>
            Cancel
          </button>
        )}
      </div>

      <div className="wishlist-preview" style={{marginTop: '20px'}}>
        <h3>Your Wishlist Items ❤️</h3>
        <p>Check out your favorite items in the wishlist page.</p>
      </div>
    </div>
  );
}

export default Profile;