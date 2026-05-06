from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem, Order, OrderItem, Wishlist 
from .serializers import (
    ProductSerializer, UserSerializer, CartSerializer, 
    WishlistSerializer, OrderSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
import razorpay
from django.conf import settings


class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['Price']


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


class UserProfileView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartView(APIView):
    permission_classes = [AllowAny]

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


class WishlistView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny] 

    def get(self, request):
        # Database-la irukura ella wishlist items-aiyum fetch pannum
        wishlist = Wishlist.objects.all()
        serializer = WishlistSerializer(wishlist, many=True)
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=400)
            
        try:
            product = Product.objects.get(id=product_id)
            # Database-la irukura mudhal user-ai default-ah assign pannuvom
            user_obj = User.objects.first() 
            
            # get_or_create use pannunaa repeat aagaadhu, refresh pannunaalum data irukkum
            wish_item, created = Wishlist.objects.get_or_create(user=user_obj, product=product)
            return Response({"message": "Successfully added to database"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))     

class CheckoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            amount = request.data.get('amount')
            if not amount:
                return Response({"error": "Amount is required"}, status=400)
            
            # Razorpay Order Create
            razorpay_order = client.order.create({
                "amount": int(float(amount) * 100), # Paisa convertion
                "currency": "INR",
                "payment_capture": "1"
            })
            return Response({"payment": razorpay_order})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class PaymentSuccessView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("RECEIVED DATA:", request.data) 
        
        try:
            # 1. User-ai safe-ah edukkurom
            user_obj = User.objects.first()
            items_data = request.data.get('items', [])

            # 2. Total calculation (Backend validation)
            total_val = sum(float(item.get('Price', 0)) for item in items_data)

            # 3. Order create
            order = Order.objects.create(
                user=user_obj,
                total_price=total_val
            )

            # 4. OrderItems-ai loop panni create pannuvom
            for item in items_data:
                p_id = item.get('id')
                
                p_price = item.get('Price', 0)
                
                try:
                    product_obj = Product.objects.get(id=p_id)
                    OrderItem.objects.create(
                        order=order,
                        product=product_obj,
                        quantity=1,
                        price=p_price
                    )
                except Exception as e:
                    print(f"Item error skip pannidalam: {e}")
                    continue

            return Response({"status": "success"}, status=200)

        except Exception as e:
            print("BACKEND ERROR MESSAGE:", str(e)) 
            return Response({"error": str(e)}, status=400)
class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)