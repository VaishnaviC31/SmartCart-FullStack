from django.urls import path
from .views import (
    ProductList, 
    RegisterView, 
    CartView, 
    CheckoutView, 
    PaymentSuccessView, # Idhu thaan romba mukkiyam!
    WishlistView, 
    UserProfileView, 
    OrderHistoryView
)

urlpatterns = [
    # Products
    path('products/', ProductList.as_view(), name='product-list'),
    
    # Auth & Profile
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Cart & Wishlist
    path('cart/', CartView.as_view(), name='cart'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    
    # Payment & Orders
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('payment-success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('orders/', OrderHistoryView.as_view(), name='order-history'),
]