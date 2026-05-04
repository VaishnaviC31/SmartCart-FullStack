from django.urls import path
from .views import (
    ProductList, RegisterView, CartView, CheckoutView, 
    PaymentSuccessView, WishlistView, WishlistDeleteView, 
    UserProfileView, OrderHistoryView # Indha views-ai namma backend-la add panna porom
)

urlpatterns = [
    path('products/', ProductList.as_view(), name='product-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('cart/', CartView.as_view(), name='cart'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('payment-success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', WishlistDeleteView.as_view(), name='wishlist-delete'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('orders/', OrderHistoryView.as_view(), name='order-history'),
]