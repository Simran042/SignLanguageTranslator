from django.contrib import admin
from django.urls import path, include
from . import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # This includes the urls defined in api/urls.py
    path('upload-audio/', views.upload_audio, name='upload_audio'),
    path('process-audio/', views.process_audio, name='process_audio'),  # New endpoint for processing audio and text
    path('get-video/', views.get_video, name='get_video'),
]


