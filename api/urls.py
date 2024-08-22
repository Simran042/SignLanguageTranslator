from django.urls import path
from .views import main, test1, RoomView

urlpatterns = [
    path('', main),
    path('home', test1),
    path('room', RoomView.as_view()),
]