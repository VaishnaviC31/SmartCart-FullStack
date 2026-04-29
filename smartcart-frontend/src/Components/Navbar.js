import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ cartCount }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">SmartCart</div>
      <div className="nav-links">
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/login" className="nav-item">Login</Link> {/* Inga dhaan login button irukku */}
        <div className="cart-container">
           🛒 <b>Cart ({cartCount})</b>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;