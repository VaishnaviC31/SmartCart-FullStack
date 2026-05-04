from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem, Order, OrderItem, Wishlist 
from .serializers import (
    ProductSerializer, UserSerializer, CartSerializer, 
    WishlistSerializer, OrderSerializer # OrderSerializer add pannirukken
)

from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
import razorpay
from django.conf import settings

# --- PRODUCT LIST (Search & Filter Ready) ---
class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['Price']

# --- AUTHENTICATION ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny] 
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# --- CART LOGIC ---
class CartView(APIView):
    permission_classes = [IsAuthenticated] # 'vaishu' nu hardcode pannama request.user use pannuvom

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity_val = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            cart_item.quantity = quantity_val if created else cart_item.quantity + quantity_val
            cart_item.save()
            return Response({"message": "Item added to cart"}, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

# --- WISHLIST LOGIC (Pending Feature ✅) ---
class WishlistView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlist, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            wish_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
            if not created:
                return Response({"message": "Already in wishlist"}, status=status.HTTP_200_OK)
            return Response({"message": "Added to wishlist"}, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

class WishlistDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        try:
            wish_item = Wishlist.objects.get(id=pk, user=request.user)
            wish_item.delete()
            return Response({"message": "Removed from wishlist"}, status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

# --- ORDER HISTORY (Pending Feature ✅) ---
class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

# --- PROFILE MANAGEMENT (Pending Feature ✅) ---
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- PAYMENT (Razorpay) ---
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            amount_from_react = request.data.get('amount')
            if not amount_from_react or float(amount_from_react) <= 0:
                return Response({"error": "Amount invalid!"}, status=status.HTTP_400_BAD_REQUEST)

            razorpay_order = client.order.create({
                "amount": int(float(amount_from_react) * 100),
                "currency": "INR",
                "payment_capture": "1"
            })
            return Response({"payment": razorpay_order}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PaymentSuccessView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        return Response({"message": "Payment Verified!"})