from django.db import models
from django.contrib.auth.models import User 


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    Price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, default='General')
    stock = models.IntegerField(default=0)
    image_url = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.name



class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # Oru user-ku oru cart dhaan
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"



class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"



class Order(models.Model):
    user = models.ForeignKey(User , on_delete = models.CASCADE)
    total_price = models.DecimalField(max_digits = 10,decimal_places=2)
    created_at = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

        

class OrderItem(models.Model):
    order = models.ForeignKey(Order , related_name = 'items', on_delete = models.CASCADE)
    product = models.ForeignKey(Product,on_delete = models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10,decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_On = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product') 