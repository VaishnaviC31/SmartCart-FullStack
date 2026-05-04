import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState({ username: '', email: '', first_name: '', last_name: '' });

    useEffect(() => {
        const token = localStorage.getItem('access');
        axios.get('http://127.0.0.1:8000/api/profile/', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setProfile(res.data))
        .catch(err => console.log(err));
    }, []);

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow">
                <h3>User Profile </h3>
                <hr />
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>First Name:</strong> {profile.first_name || 'Update pannala'}</p>
                <p><strong>Last Name:</strong> {profile.last_name || 'Update pannala'}</p>
                <button className="btn btn-primary w-25">Edit Profile</button>
            </div>
        </div>
    );
};

export default Profile;