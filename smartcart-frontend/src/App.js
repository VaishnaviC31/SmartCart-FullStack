import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Wishlist from './Components/Wishlist'; // NEW
import Profile from './Components/Profile';   // NEW
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('access') ? true : false); 
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);

  const BACKEND_URL = "https://smartcart-fullstack-5.onrender.com";

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/products/`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  // --- WISHLIST LOGIC ---
  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        alert("Please login to add items to wishlist!");
        return;
      }
      await axios.post(`${BACKEND_URL}/api/wishlist/`, 
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to Wishlist ");
    } catch (err) {
      alert("Already in wishlist or error occurred!");
    }
  };

  const handlePayment = () => {
    // ... unga current handlePayment logic ...
    alert("Order Placed Successfully!");
    // Logic goes here
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );   

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cart.length} setSearchTerm={setSearchTerm} isLoggedIn={isLoggedIn} />
        
        <Routes>
          <Route path="/" element={
            <div className="container">
              {/* Hero Section & Search Bar */}
              <div className="hero-section">
                <h1 className="title">SmartCart - Biggest Sale</h1>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="main-search-bar"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Product Grid */}
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="wishlist-icon" onClick={() => addToWishlist(product.id)}>❤️</div>
                    <img src={product.image_url} alt={product.name} className="product-image" />
                    <h3>{product.name}</h3>
                    <p className="product-price">₹{product.Price}</p>
                    <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          } />
          
          {/* NEW ROUTES */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/admin-panel" element={() => {
            window.location.replace(`${BACKEND_URL}/admin`);
            return null;
          }} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;