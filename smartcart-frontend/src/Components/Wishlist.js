import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('access'); // Login token
            const response = await axios.get('http://127.0.0.1:8000/api/wishlist/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistItems(response.data);
        } catch (error) {
            console.error("Wishlist fetch panna mudiyala!", error);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            const token = localStorage.getItem('access');
            await axios.delete(`http://127.0.0.1:8000/api/wishlist/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWishlist(); // Refresh the list
        } catch (error) {
            alert("Remove panna mudiyaala!");
        }
    };

    return (
        <div className="container mt-5">
            <h2>My Wishlist </h2>
            {wishlistItems.length === 0 ? <p>Unga wishlist empty-ah irukku!</p> : (
                <div className="row">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="col-md-4 mb-4">
                            <div className="card">
                                <img src={item.product_details.image} className="card-img-top" alt="..." />
                                <div className="card-body">
                                    <h5 className="card-title">{item.product_details.name}</h5>
                                    <p className="card-text">₹{item.product_details.Price}</p>
                                    <button onClick={() => removeFromWishlist(item.id)} className="btn btn-danger">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;