from django.http import JsonResponse
from django.views import View
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from .whisper_util import transcribe_audio

# Define the AudioTranscriptionView class which inherits from Django's View class
class AudioTranscriptionView(View): 
    def post(self, request):
        # Handle file upload
        if 'audio_file' not in request.FILES: 
            return JsonResponse({'error': 'No audio file provided'}, status=400)
        
        audio_file = request.FILES['audio_file'] # Get the uploaded file
        fs = FileSystemStorage() # Create a FileSystemStorage object
        file_path = fs.save(audio_file.name, audio_file) # Save the file to disk

        # Transcribe audio to text
        text = transcribe_audio(fs.url(file_path))

        return JsonResponse({'transcription': text})
