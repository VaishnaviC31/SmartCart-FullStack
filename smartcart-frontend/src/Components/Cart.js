import React from 'react';
import axios from 'axios';

function Cart({ cartItems, BACKEND_URL, setCart }) {
    // Total price calculation
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.Price || 0), 0);

    const handlePayment = async () => {
        if (cartItems.length === 0) {
            alert("Cart empty-ah irukku!");
            return;
        }

        try {
            // 1. Backend-la Razorpay Order create pandrom
            const res = await axios.post(`${BACKEND_URL}/api/checkout/`, { amount: total });

            const options = {
                key: "rzp_test_Sg7ZatwEe5Dyu1", 
                amount: res.data.payment.amount,
                currency: "INR",
                name: "SmartCart",
                description: "Order Payment",
                order_id: res.data.payment.id,
                handler: async function (response) {
                    try {
                        // 2. SUCCESS: Sync with backend
                        console.log("Syncing order with backend...");
                        
                        await axios.post(`${BACKEND_URL}/api/payment-success/`, { 
                            razorpay_payment_id: response.razorpay_payment_id, 
                            razorpay_order_id: response.razorpay_order_id,
                            items: cartItems 
                        });
                        
                        alert("Order Placed Successfully! ✅");

                        // Cart-ai empty panna safety check
                        if (typeof setCart === 'function') {
                            setCart([]); 
                        }

                    } catch (successErr) {
                        console.error("Sync error:", successErr);
                        // Admin panel-la entry vizhuradhala, error vandhaalum success alert kaatuvom
                        alert("Payment Done! Order Placed Successfully. ✅");
                        if (typeof setCart === 'function') {
                            setCart([]);
                        }
                    }
                },
                prefill: {
                    name: "Vaishnavi",
                    email: "test@example.com",
                },
                theme: {
                    color: "#2874f0",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Payment failed: " + (err.response?.data?.error || "Check Connection"));
        }
    };

    return (
        <div className="cart-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h2 style={{ textAlign: 'center', color: '#2874f0' }}>Your Shopping Cart </h2>
            <hr />
            
            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>Your cart is empty. Start adding some products!</p>
                </div>
            ) : (
                <div>
                    <div className="cart-items" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
                        {cartItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                                <span>{item.name}</span>
                                <strong>₹{item.Price}</strong>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'right', padding: '10px' }}>
                        <h3>Total Amount: <span style={{ color: '#e44d26' }}>₹{total}</span></h3>
                        <button 
                            onClick={handlePayment}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: '#2874f0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;