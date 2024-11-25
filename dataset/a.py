import json
import os
from yt_dlp import YoutubeDL, DownloadError

# Load the MSASL dataset
msasl_file_path = './MSASL.json'
with open(msasl_file_path, 'r') as f:
    msasl_data = json.load(f)

# Directory to save the downloaded videos
download_dir = './MSASL'
os.makedirs(download_dir, exist_ok=True)

# Function to download a video
def download_video(url, output_path):
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best'
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

# Download videos
for entry in msasl_data:
    url = entry['url']
    video_name = entry['clean_text']
    output_path = os.path.join(download_dir, f"{video_name}.mp4")
    print(f"Downloading {video_name} from {url}...")
    try:
        download_video(url, output_path)
        print(f"Downloaded {video_name} to {output_path}")
    except DownloadError as e:
        print(f"Failed to download {video_name} from {url}: {e}")
        continue

print("All videos downloaded.")
