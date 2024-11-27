import os
import subprocess
from django.http import JsonResponse
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from django.http import FileResponse, HttpResponseNotFound
from django.http import StreamingHttpResponse
from .models.text_to_sign import convert_text_to_sign
from asgiref.sync import sync_to_async
from django.core.files.storage import FileSystemStorage
from .models.preprocess import reencode_wav 
import json

async def upload_audio(request):
    print("Received a request...")  # Debugging print to confirm request received

    if request.method == 'POST':
        print("Request method is POST.")  # Confirm the request method is POST
        
        if 'audio' in request.FILES:
            print("Audio file found in request.FILES.")  # Confirm the file is in the request

            audio_file = request.FILES['audio']  # Get the audio file from the request
            print(f"Audio file received: {audio_file.name}")  # Print the name of the file received

            try:
                # Define the path to save the file
                audio_folder = os.path.join(settings.BASE_DIR, 'audio')
                print(f"Saving file to: {audio_folder}")  # Print the save location

                # Wrap FileSystemStorage calls in sync_to_async
                fs = FileSystemStorage(location=audio_folder)
                filename = 'Tentacle_00001.wav'

                # Check if the file already exists and delete it asynchronously
                if await sync_to_async(fs.exists)(filename):
                    print(f"File {filename} already exists. Deleting old file.")
                    await sync_to_async(fs.delete)(filename)

                # Save the file with the exact name asynchronously
                saved_filename = await sync_to_async(fs.save)(filename, audio_file)
                print(f"File saved as: {saved_filename}")  # Print the saved filename

                file_url = fs.url(saved_filename)
                print(f"File URL: {file_url}")  # Print the file URL

               
                await  sync_to_async(reencode_wav)()

                return JsonResponse({'message': 'Audio uploaded successfully!', 'file_url': file_url})
            except Exception as e:
                print(f"Error occurred: {e}")  # Print any exceptions for debugging
                return JsonResponse({'error': f'Failed to save audio: {str(e)}'}, status=500)
        else:
            print("No audio file found in request.FILES.")  # File is missing in the request
            return JsonResponse({'error': 'No audio file provided'}, status=400)
    else:
        print("Invalid request method. Only POST is allowed.")  # Print if the method is not POST
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt  # Disable CSRF validation for this example
async def process_audio(request):
    print("Received a request...")  # Debugging print to confirm request received

    if request.method == 'POST':
        print("Request method is POST.")  # Confirm the request method is POST
        
        # Get text input from the request
        text_input = request.POST.get('text_input', '')
        print(f"Received text input: {text_input}")  # Print the received text input

        try:
            # Construct the path to the script
            sentence, duration, ner, description = await convert_text_to_sign(text_input)

            data_to_serialize = {
                'sentence': sentence,
                'duration':duration,
                'ner': list(ner), 
                'description':description
            }

            try:
                json_data = json.dumps(data_to_serialize)
                print(json_data)  # Output the JSON string
            except TypeError as e:
                print(f"An error occurred: {e}")


            public_folder_path = os.path.join(settings.BASE_DIR, 'frontend/public')

            # Define the output file path
            output_file_path = os.path.join(public_folder_path, 'data.json')

            # Write the data to the file
            
            with open(output_file_path, 'w') as json_file:
                json.dump(data_to_serialize, json_file, indent=4)
            # return JsonResponse({'status': 'success', 'message': 'Data saved successfully.'})
      
            
            return JsonResponse({'message': 'Processing completed successfully!', 'result': json_data})
            # script_path = os.path.join(settings.BASE_DIR, 'models', 'text_to_sign.py')
            # print(f"Script path: {script_path}")  # Print the script path

            # # Run the text_to_sign.py script using subprocess
            # result = subprocess.run(['python', script_path, text_input], capture_output=True, text=True)

            # print(f"Subprocess return code: {result.returncode}")  # Print the return code
            # print(f"Subprocess stdout: {result.stdout}")  # Print the standard output
            # print(f"Subprocess stderr: {result.stderr}")  # Print the standard error output

            # # Check the output or errors
            # if result.returncode == 0:
            #     return JsonResponse({'message': 'Processing completed successfully!', 'output': result.stdout})
            # else:
            #     return JsonResponse({'error': result.stderr}, status=500)

        except Exception as e:
            print(f"An error occurred: {str(e)}")  # Print any exceptions for debugging
            return JsonResponse({'error': str(e)}, status=500)

    print("Invalid request method. Only POST is allowed.")  # Print if the method is not POST
    return JsonResponse({'error': 'Invalid request method'}, status=405)



# def get_video(request):
#     video_path = os.path.join(os.path.dirname(__file__), '../output/fixed_video.mp4')
    
#     if os.path.exists(video_path):
#         # Send the relative or absolute path to the frontend
#         return JsonResponse({'video_path': video_path}, status=200)
#     else:
#         return JsonResponse({'error': 'Video not found'}, status=404)
