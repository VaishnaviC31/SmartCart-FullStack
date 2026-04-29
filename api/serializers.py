from rest_framework import serializers
from .models import Product, Cart, CartItem,Wishlist
from django.contrib.auth.models import User

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Intha code dhaan ippo unga error-ku kaaranam!
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product'
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at']

    def get_total_price(self, obj):
        # Cart-la irukkura ellatheyum calculate pannum
        return sum(item.product.Price * item.quantity for item in obj.items.all())


class WishlistSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source = 'product',read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id','product','product_details','added_on']
