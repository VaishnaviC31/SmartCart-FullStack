import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Profile from './Components/Profile';
import Wishlist from './Components/Wishlist';
import Cart from './Components/Cart';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));

  const BACKEND_URL = "https://smartcart-fullstack-6.onrender.com";
  
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/products/`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Backend connect aagala:", err));

    const token = localStorage.getItem('access');
    if (token) setIsLoggedIn(true);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  const toggleWishlist = (product) => {
    axios.post(`${BACKEND_URL}/api/wishlist/`, { product_id: product.id })
      .then(res => {
        setWishlist([...wishlist, product]);
        alert("Added to Wishlist! ❤️");
      })
      .catch(err => {
        console.error("Save aagala:", err);
        alert("Database-la save pannumbodhu error varudhu!");
      });
  };

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cart.length} isLoggedIn={isLoggedIn} />
        
        <Routes>
          <Route path="/" element={
            <div className="container">
              <div className="hero-section">
                <h1 className="hero-title">SmartCart - Biggest Sale</h1>
                <div className="search-container">
                  <input 
                    type="text" 
                    placeholder="Search products by name..." 
                    className="main-search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>

              <div className="product-grid">
                {products
                  .filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(product => (
                    <div key={product.id} className="product-card">
                      <div className="wishlist-icon-overlay" onClick={() => toggleWishlist(product)}>
                         {wishlist.some(item => item.id === product.id) ? "❤️" : "❤️"}
                      </div>
                      
                      <img src={product.image_url} alt={product.name} className="product-image" />
                      <h3>{product.name}</h3>
                      <p className="price">₹{product.Price}</p>
                      <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                  ))}
              </div>
            </div>
          } />

          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} BACKEND_URL={BACKEND_URL} />} />
          <Route path="/profile" element={<Profile BACKEND_URL={BACKEND_URL} />} />
          <Route path="/wishlist" element={<Wishlist wishlistItems={wishlist} />} />
          
          <Route path="/cart" element={
            <Cart 
              cartItems={cart} 
              setCart={setCart} 
              BACKEND_URL={BACKEND_URL} 
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;