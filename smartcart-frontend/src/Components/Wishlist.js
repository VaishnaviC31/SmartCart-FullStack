import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    

    const BACKEND_URL = "http://127.0.0.1:8000"; 

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;

            const response = await axios.get(`${BACKEND_URL}/api/wishlist/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistItems(response.data);
        } catch (error) {
            console.error("Wishlist fetch error!", error.response?.data || error.message);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            const token = localStorage.getItem('access');
            await axios.delete(`${BACKEND_URL}/api/wishlist/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
           
            fetchWishlist(); 
        } catch (error) {
            alert("Remove failed! Please check login.");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="profile-title">My Wishlist ❤️</h2>
            {wishlistItems.length === 0 ? (
                <p className="loading">Your wishlist is empty!</p>
            ) : (
                <div className="product-grid">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="product-card">
                            {/* Product details rendering fix */}
                            <img 
                                src={item.product_details?.image_url || item.image_url} 
                                className="product-image" 
                                alt="product" 
                            />
                            <h3>{item.product_details?.name || item.name}</h3>
                            <p className="price">₹{item.product_details?.Price || item.Price}</p>
                            <button 
                                onClick={() => removeFromWishlist(item.id)} 
                                className="btn-danger"
                                style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '5px'}}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;