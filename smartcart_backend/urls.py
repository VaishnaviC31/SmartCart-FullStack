from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model

# Superuser create panra logic (Oru vela illaina create pannum)
User = get_user_model()
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Admin account created successfully!")
except Exception as e:
    pass

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), # API app connection

    # Idhu vandha dhaan api-auth/login vela seiyum
    path('api-auth/', include('rest_framework.urls')), 

    # JWT Authentication paths
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]