from django.db import models

# Create your models here.
from django.db import models

class AudioRecording(models.Model):
    audio_file = models.FileField(upload_to='recordings/')
    created_at = models.DateTimeField(auto_now_add=True)
