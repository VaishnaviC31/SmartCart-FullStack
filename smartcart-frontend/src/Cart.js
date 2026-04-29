import React from 'react';

function Cart({ cartItems }) {
  // Total calculate pannalam
  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.Price), 0);

  return (
    <div className="container">
      <h2 className="title">Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Your cart is empty!</p>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {cartItems.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              borderBottom: '1px solid #ddd', 
              padding: '15px' 
            }}>
              <span>{item.name}</span>
              <span style={{ fontWeight: 'bold' }}>₹{item.Price}</span>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <h3>Total Amount: ₹{total}</h3>
            <button className="add-btn" style={{ width: '200px', backgroundColor: '#2874f0' }}>
              Checkout with Razorpay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;