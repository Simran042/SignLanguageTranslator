import json
import cv2
import os
from .preprocess import preprocess_text
import ffmpeg
import sys
import json


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


def get_video_ids_for_sentence(sentence, gloss_to_video, ms_text_mapping):
    words = sentence.split()
    grouped_video_ids = []
    video_dir = os.path.join(os.path.dirname(__file__), '../../dataset/WLASL2000')
    video_dir_for_msasl = os.path.join(os.path.dirname(__file__), '../../dataset/MSASL')

    for word in words:
        word_video_ids = []  # Grouped video IDs for the current word

        if word in gloss_to_video:
            for vid in gloss_to_video[word]:
                if os.path.exists(os.path.join(video_dir, f"{vid}.mp4")):
                    word_video_ids.append(vid)
                    break  # Use the first available video for simplicity

        elif word in ms_text_mapping:
            word_video_ids.append(f"${word}")  # Prefix for MSASL dataset

        else:  # Word not found in mappings, fallback to letter mapping
            for letter in word:
                word_video_ids.append(f"/{letter.upper()}")  # Use letter images

        grouped_video_ids.append(word_video_ids)  # Add this word's group to the main list

    log_text("Grouped video IDs: ", grouped_video_ids)
    return grouped_video_ids


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
    clip_durations = []
    frame_size = None
    fps = 25  # Default FPS
    video_dir = os.path.join(os.path.dirname(__file__), '../../dataset/WLASL2000')
    video_dir_for_ms = os.path.join(os.path.dirname(__file__), '../../dataset/MSASL')
    letters_dir = os.path.join(os.path.dirname(__file__), "../../dataset/letters/")

    for word_video_ids in video_ids:
        word_clips = []  # Clips for the current word
        word_duration = 0  # Duration accumulator for the current word

        for video_id in word_video_ids:
            if video_id.startswith("/"):  # Letter image case
                letter_path = os.path.join(letters_dir, f"{video_id[1:]}_test.jpg")
                letter_image = cv2.imread(letter_path)

                if letter_image is None:
                    log_text(f"Letter image {letter_path} not found. Skipping.")
                    continue

                if frame_size is None:
                    frame_size = (letter_image.shape[1], letter_image.shape[0])
                elif (letter_image.shape[1], letter_image.shape[0]) != frame_size:
                    letter_image = cv2.resize(letter_image, frame_size)

                # Add frames for 1.5 seconds
                for _ in range(int(fps * 1.5)):
                    word_clips.append(letter_image)

                word_duration += 1.50

            else:  # Video case
                if video_id.startswith("$"):  # MSASL dataset
                    video_path = os.path.join(video_dir_for_ms, f"{video_id[1:]}.mp4")
                else:  # WLASL2000 dataset
                    video_path = os.path.join(video_dir, f"{video_id}.mp4")

                cap = cv2.VideoCapture(video_path)

                if not cap.isOpened():
                    log_text(f"Error opening video file {video_path}. Skipping.")
                    continue

                if frame_size is None:
                    frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
                frame_count = 0

                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    if frame_size is not None and (frame.shape[1], frame.shape[0]) != frame_size:
                        frame = cv2.resize(frame, frame_size)
                    word_clips.append(frame)
                    frame_count += 1

                cap.release()
                word_duration += frame_count / fps
                word_duration-= 0.01
                

        # Add word clips to main video
        video_clips.extend(word_clips)
        clip_durations.append(word_duration*0.9)

    if not video_clips:
        log_text("No video clips to concatenate.")
        return []

    # Write video clips to file
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, frame_size)
    for clip in video_clips:
        out.write(clip)
    out.release()

    log_text(f"Output video saved to {output_path}")
    return clip_durations

async def convert_text_to_sign(text):
    
    json_file =  os.path.join(os.path.dirname(__file__), '../../dataset/WLASL_v0.3.json')

    video_dir =os.path.join(os.path.dirname(__file__),  '../../dataset/WLASL2000')
    sentence,ner,text_description = preprocess_text(text)

    print("nkjnk",ner)
    # log_text(ner,text_description)
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

    words = sentence.split()
    if len(words) != len(duration):
        log_text(f"Length mismatch - words: {len(words)}, durations: {len(duration)}. Padding durations.")
        duration.extend([0] * (len(words) - len(duration)))  # Pad durations if needed

    word_duration_pairs = [
        {"word": word, "duration": duration[i]} for i, word in enumerate(words)
    ]
    # Write to JSON file
    output_json_path = os.path.join(os.path.dirname(__file__), '../../frontend/public/word_duration.json')
    with open(output_json_path, 'w') as json_file:
        json.dump(word_duration_pairs, json_file, indent=4)

    log_text("Word-Duration pairs written to JSON:", word_duration_pairs)

    

    return sentence,duration,ner,text_description

if __name__ == '__main__':
    text="Will you come to market with me"
    convert_text_to_sign(text)

