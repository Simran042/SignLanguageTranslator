import subprocess
import os
import whisper
import logging

# Load the model once when the server starts
model = whisper.load_model("turbo")

def convert_audio_to_wav(file_path):
    """Convert audio file to WAV format using FFmpeg."""
    wav_file_path = file_path.rsplit('.', 1)[0] + '.wav'  # Change extension to .wav
    command = ['ffmpeg', '-i', file_path, wav_file_path]
    try:
        subprocess.run(command, check=True)
        logging.info(f"Converted {file_path} to {wav_file_path}")
        return wav_file_path
    except subprocess.CalledProcessError as e:
        logging.error(f"Error converting file: {e}")
        return None

def transcribe_audio(file_path):
    logging.info(f"Starting transcription for {file_path}")
    
    # Convert M4A file to WAV format
    wav_file_path = convert_audio_to_wav(file_path)
    if wav_file_path is None:
        return "Error converting audio file"

    # Perform transcription on the converted WAV file
    try:
        result = model.transcribe(wav_file_path)
        logging.info("Transcription complete")
        return result["text"]
    finally:
        # Clean up: Remove the WAV file after processing
        if os.path.exists(wav_file_path):
            os.remove(wav_file_path)
            logging.info(f"Removed temporary file: {wav_file_path}")
