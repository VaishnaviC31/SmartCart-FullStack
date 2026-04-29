from rest_framework import generics, status , filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem, Order, OrderItem ,Wishlist 
from .serializers import ProductSerializer, UserSerializer, CartSerializer, WishlistSerializer


from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

import razorpay
from django.conf import settings

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ProductSerializer

    filter_backends = [DjangoFilterBackend,filters.SearchFilter , filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name','description']
    Ordering_fields = ['Price']

# 1. RegisterView-la dhaan Token logic irukanum
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny] 
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Inga dhaan token generate aagudhu
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

# 2. CartView-la item add panra logic mattum irukanum
class CartView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        user = User.objects.get(username='vaishu') 
        cart, created = Cart.objects.get_or_create(user=user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request): # Cart-ku POST method dhaan use pannanum
        user = User.objects.get(username='vaishu')
        cart, created = Cart.objects.get_or_create(user=user)
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



client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))



class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Data from React:", request.data) 
        try:
            amount_from_react = request.data.get('amount')
            
            if not amount_from_react or float(amount_from_react) <= 0:
                return Response({"error": "Amount zero-ah irukku!"}, status=status.HTTP_400_BAD_REQUEST)

            razorpay_order = client.order.create({
                "amount": int(float(amount_from_react) * 100),
                "currency": "INR",
                "payment_capture": "1"
            })
            print("Order Created Successfully:", razorpay_order['id'])
            return Response({"payment": razorpay_order}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print("Checkout Error Trace:", str(e)) 
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            
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

    def delete(self, request, pk):
        wish_item = Wishlist.objects.get(id=pk, user=request.user)
        wish_item.delete()
        return Response({"message": "Removed from wishlist"}, status=status.HTTP_204_NO_CONTENT)


      

class PaymentSuccessView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Razorpay anuppura data-vah inga verify pannuvom
        return Response({"message": "Payment Verified!"})