import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ cartCount, isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">SmartCart</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
        <li><Link to="/cart">Cart <span className="cart-badge">{cartCount}</span></Link></li>
        {isLoggedIn ? (
          <li><Link to="/profile">Profile</Link></li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;