from django.urls import path
from base.views import order_views as views
from base.views.order_views import paypalConfigView


urlpatterns = [
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='user-orders'),
    
    path('<str:pk>/', views.getOrderById, name='user-order'),
    path('<str:pk>/pay/', views.updateOrderToPaid, name='order-pay'),
    path('config/paypal/', paypalConfigView, name='paypal-config'),
]