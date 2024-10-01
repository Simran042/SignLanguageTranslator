from rest_framework import serializers
from .models import AudioRecording

class AudioRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioRecording
        fields = '__all__'
