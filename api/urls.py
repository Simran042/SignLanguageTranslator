from django.urls import path
from .views import AudioTranscriptionView

urlpatterns = [
    path('transcribe/', AudioTranscriptionView.as_view(), name='audio-transcribe'),  # Your new endpoint
    #path('audio-recordings/', AudioRecordingViewSet.as_view({'get': 'list', 'post': 'create'}), name='audio-recordings'),  # ViewSet routing
]
