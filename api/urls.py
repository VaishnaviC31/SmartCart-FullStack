from django.urls import path
from .views import ProductList, RegisterView, CartView, CheckoutView, PaymentSuccessView 

urlpatterns = [
    path('products/', ProductList.as_view(), name='product-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('cart/', CartView.as_view(), name='cart'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('payment-success/', PaymentSuccessView.as_view(), name='payment-success'),
]