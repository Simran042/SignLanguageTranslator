import json
import cv2
import os
from .preprocess import preprocess_text
import ffmpeg
import sys

def log_text(text,message=""):
    log_file=os.path.join(os.path.dirname(__file__),  '../../log.txt')
    with open(log_file, "a") as f:
            f.write(str(text)+str(message)+"\n")

def create_gloss_to_video_mapping(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    gloss_to_video = {}
    for entry in data:
        gloss = entry['gloss']
        video_ids = [instance['video_id'] for instance in entry['instances']]
        gloss_to_video[gloss] = video_ids
    
    return gloss_to_video

def create_text_mapping(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)

    ms_text_mapping=[entry['clean_text'] for entry in data]
   
    return ms_text_mapping


def get_video_ids_for_sentence(sentence, gloss_to_video,ms_text_mapping):
    words = sentence.split()
    video_ids = []
    video_dir = os.path.join(os.path.dirname(__file__),  '../../dataset/WLASL2000')
    video_dir_for_msasl= os.path.join(os.path.dirname(__file__),  '../../dataset/MSASL')
    for word in words:
        if word in gloss_to_video:
            for id in gloss_to_video[word]:
                if os.path.exists( os.path.join(video_dir, f"{id}.mp4")):
                    video_ids.append(id)
                    break  # Get the first video ID for simplicity
        else:
            if word in ms_text_mapping:
                video_ids.append("$"+word)
            else:
                for letter in word:
                    video_ids.append("/"+letter.upper())
                   
    log_text("video_ids : ",video_ids)
    return video_ids

async def repair_video():
    input_file = os.path.join(os.path.dirname(__file__),  '../../frontend/public/concatenated_video.mp4')  # Path to your corrupted video
    output_file = os.path.join(os.path.dirname(__file__),  '../../frontend/public/fixed_video.mp4')
    
    if os.path.exists(output_file):
        try:
            os.remove(output_file)
            log_text(f"Existing video at {output_file} deleted.")
        except Exception as e:
            log_text(f"Error deleting old video: {e}")
            return False
    
    try:
        # Perform a simple re-encode to repair the video
        ffmpeg.input(input_file).output(output_file).run()
        log_text(f"Video repaired and saved to {output_file}")
        print("donnnneeeee   ttjgosngbgsl")
        return True
    except ffmpeg.Error as e:
        log_text(f"Error repairing video: {e}")
        return False


def concatenate_videos(video_ids, video_dir, output_path):
    video_clips = []
    clip_durations=[]
    frame_size = None
    fps = None
    video_dir =os.path.join(os.path.dirname(__file__),  '../../dataset/WLASL2000')
    video_dir_for_ms=os.path.join(os.path.dirname(__file__),  '../../dataset/MSASL')
    
    for video_id in video_ids:

        if video_id.startswith("/"):
            image_path=os.path.join(os.path.dirname(__file__), "../../dataset/letters/",f"{video_id[1:]}_test.jpg")
            log_text("image_path : ",image_path)
            default_image=cv2.imread(image_path)
            log_text(f"Video file not found. Using default image.{image_path}")
            fps = 25
            if default_image is None:
                log_text(f"Default image {image_path} not found or cannot be read. Skipping.")
                continue
            if fps is None:
                fps = 25 
            if frame_size is None:
                frame_size = (default_image.shape[1], default_image.shape[0])
            if (default_image.shape[1], default_image.shape[0]) != frame_size:
                default_image = cv2.resize(default_image, frame_size)
            for _ in range(int(fps*1.5)): 
                # log_text("adding")
                video_clips.append(default_image)
            clip_durations.append(1.5)

        else:
            if video_id.startswith("$"):
                video_path = os.path.join(video_dir_for_ms, f"{video_id[1:]}.mp4")
            else:
                video_path=os.path.join(video_dir,f"{video_id}.mp4")

            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                log_text(f"Error opening video file {video_path}. Skipping.")
                continue

            if frame_size is None or fps is None:
                frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
                fps = cap.get(cv2.CAP_PROP_FPS)
            
            frame_count=0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                if frame_size is not None and (frame.shape[1], frame.shape[0]) != frame_size:
                    frame = cv2.resize(frame, frame_size)
                video_clips.append(frame)
                frame_count+=1
            
            cap.release()
            duration=frame_count/fps
            clip_durations.append(duration)

    if not video_clips:
        log_text("No video clips to concatenate.")
        return
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, frame_size)
    
    for clip in video_clips:
        out.write(clip)
    log_text(len(video_clips))
    out.release()
    log_text(f"Output video saved to {output_path}")
    return clip_durations
    # Initialize VideoWriter

async def convert_text_to_sign(text):
    
    json_file =  os.path.join(os.path.dirname(__file__), '../../dataset/WLASL_v0.3.json')

    video_dir =os.path.join(os.path.dirname(__file__),  '../../dataset/WLASL2000')
    sentence = preprocess_text(text)
    log_text("sentence : ",sentence)
    output_path = os.path.join(os.path.dirname(__file__),  '../../frontend/public/concatenated_video.mp4')
    gloss_to_video = create_gloss_to_video_mapping(json_file)
    ms_json=os.path.join(os.path.dirname(__file__), '../../dataset/MSASL.json')
    ms_text_mapping=create_text_mapping(ms_json)
    # log_text(gloss_to_video)
    video_ids = get_video_ids_for_sentence(sentence, gloss_to_video,ms_text_mapping)
    # log_text("videos",video_ids)
    duration=concatenate_videos(video_ids, video_dir, output_path)
    await repair_video()
    video_path= os.path.join(os.path.dirname(__file__),  '../../frontend/public/fixed_video.mp4')
    
    log_text(duration)
    return sentence,duration

if __name__ == '__main__':
    text="Will you come to market with me"
    convert_text_to_sign(text)

