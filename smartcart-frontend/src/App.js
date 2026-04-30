import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);

  // UPDATE: Ippo namma deploy panna pudhu Render URL
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

  const handlePayment = async () => {
    if (!isLoggedIn) {
      alert("Please login first");
      return;
    }
    if (cart.length === 0) {
      alert("Cart empty-ah irukku!");
      return;
    }
    if (address.length < 10) {
      alert("Please enter a valid shipping address!"); 
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + Number(item.Price), 0);

    try {
      // Step 1: Backend-la order create pandrom
      const res = await axios.post(`${BACKEND_URL}/api/checkout/`, { amount: totalAmount });
      
      const options = {
        key: "rzp_test_Sg7ZatwEe5Dyu1", // Unga current Razorpay Key
        amount: res.data.payment.amount,
        currency: "INR",
        name: "SmartCart",
        description: "Order Payment",
        order_id: res.data.payment.id, 
        handler: async function (response) {
          alert("Payment Success! ID: " + response.razorpay_payment_id);
          
          const newOrder = {
            id: response.razorpay_payment_id,
            items: [...cart],
            total: totalAmount,
            status: "Shipped",
            date: new Date().toLocaleDateString()
          };
          
          setOrders(prevOrders => [newOrder, ...prevOrders]);

          // Step 2: Backend-ku success info anupuroam
          await axios.post(`${BACKEND_URL}/api/payment-success/`, {
            razorpay_payment_id: response.razorpay_payment_id,
            cart_items: cart,
            address: address
          });
          
          setCart([]); 
        },
        prefill: { name: "Vaishnavi", email: "vaishu123@gmail.com" },
        theme: { color: "#2874f0" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Checkout failed! Render Dashboard-la logs check pannunga.");
    }
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
              <div className="hero-section">
                <h1 className="title">SmartCart - Biggest Sale</h1>
                <input 
                  type="text" 
                  placeholder="Search products, brands and more..." 
                  className="main-search-bar"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="address-container">
                <h3>Delivery Address</h3>
                <textarea 
                  className="address-input"
                  placeholder="Enter Full Address (Door No, Street, City, Pin)..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="action-bar">
                <button className="checkout-btn" onClick={handlePayment}>
                  Place Order (₹{cart.reduce((sum, item) => sum + Number(item.Price), 0)})
                </button>
              </div>

              <div className="product-grid">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.image_url} alt={product.name} className="product-image" />
                      <h3>{product.name}</h3>
                      <p className="product-price">₹{product.Price}</p>
                      <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No products found for "{searchTerm}"</div>
                )}
              </div>

              {orders.length > 0 && (
                <div className="orders-section">
                  <hr className="divider" />
                  <h2 className="section-title">My Orders (Live Tracking)</h2>
                  {orders.map(order => (
                    <div key={order.id} className="order-box">
                      <div className="order-details">
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Status:</strong> <span className="status-badge">{order.status}</span></p>
                        <p><strong>Date:</strong> {order.date}</p>
                      </div>
                      <div className="order-items-list">
                        <strong>Items:</strong>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>{item.name} - ₹{item.Price}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="order-total-price"><strong>Total Paid: ₹{order.total}</strong></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />
          
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
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