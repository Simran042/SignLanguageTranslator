import json
import cv2
import os
from preprocess import get_message
import ffmpeg

def create_gloss_to_video_mapping(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    gloss_to_video = {}
    for entry in data:
        gloss = entry['gloss']
        video_ids = [instance['video_id'] for instance in entry['instances']]
        gloss_to_video[gloss] = video_ids
    
    return gloss_to_video

def get_video_ids_for_sentence(sentence, gloss_to_video):
    words = sentence.split()
    video_ids = []
    video_dir = os.path.join(os.path.dirname(__file__),  '../dataset/WLASL2000')
    for word in words:
        if word in gloss_to_video:
            for id in gloss_to_video[word]:
                if os.path.exists( os.path.join(video_dir, f"{id}.mp4")):
                    video_ids.append(id)
                    break  # Get the first video ID for simplicity
        else:
            print(f"Word '{word}' not found in the mapping.")
            for letter in word:
                if letter in gloss_to_video:
                    for id in gloss_to_video[letter]:
                        if os.path.exists( os.path.join(video_dir, f"{id}.mp4")):
                            video_ids.append(id)
                            print(id)
                            break  # Get the first video ID for simplicity  
                else:
                    uppercase_letter = letter.upper()
                    if uppercase_letter in gloss_to_video:
                        video_ids.extend(gloss_to_video[uppercase_letter][0])
                    else:
                        print(f"Letter '{letter}' not found in the mapping.")
    print(video_ids)
    return video_ids

def repair_video():
    input_file = os.path.join(os.path.dirname(__file__),  '../output/concatenated_video.mp4')  # Path to your corrupted video
    output_file = os.path.join(os.path.dirname(__file__),  '../frontend/public/new_video.mp4')
    
    if os.path.exists(output_file):
        try:
            os.remove(output_file)
            print(f"Existing video at {output_file} deleted.")
        except Exception as e:
            print(f"Error deleting old video: {e}")
            return False
    
    try:
        # Perform a simple re-encode to repair the video
        ffmpeg.input(input_file).output(output_file).run()
        print(f"Video repaired and saved to {output_file}")
        return True
    except ffmpeg.Error as e:
        print(f"Error repairing video: {e}")
        return False


def concatenate_videos(video_ids, video_dir, output_path):
    video_clips = []
    frame_size = None
    fps = None
    
    for video_id in video_ids:
        video_path = os.path.join(video_dir, f"{video_id}.mp4")
        
        if not os.path.exists(video_path):
            print(f"Video file {video_path} not found. Skipping.")
            continue
        
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Error opening video file {video_path}. Skipping.")
            continue

        if frame_size is None or fps is None:
            frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
            fps = cap.get(cv2.CAP_PROP_FPS)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if frame_size is not None and (frame.shape[1], frame.shape[0]) != frame_size:
                frame = cv2.resize(frame, frame_size)
            video_clips.append(frame)
        
        cap.release()
    
    if not video_clips:
        print("No video clips to concatenate.")
        return
    
    # Get properties from the first video clip
    # height, width, layers = video_clips[0].shape
    # size = (width, height)
    # fps = 25  # Assuming a default frame rate of 25 FPS
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, frame_size)
    
    for clip in video_clips:
        out.write(clip)
    
    out.release()
    print(f"Output video saved to {output_path}")
    repair_video()
    # Initialize VideoWriter

if __name__ == '__main__':
    json_file =  os.path.join(os.path.dirname(__file__), '../dataset/WLASL_v0.3.json')

    video_dir =os.path.join(os.path.dirname(__file__),  '../dataset/WLASL2000')
    sentence = get_message()
    print("sentence : ",sentence)
    output_path = os.path.join(os.path.dirname(__file__),  '../output/concatenated_video.mp4')
    gloss_to_video = create_gloss_to_video_mapping(json_file)
    # print(gloss_to_video)
    video_ids = get_video_ids_for_sentence(sentence, gloss_to_video)
    # print("videos",video_ids)
    concatenate_videos(video_ids, video_dir, output_path)