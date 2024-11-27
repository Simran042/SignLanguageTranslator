The GestureBridge system follows a structured pipeline for translating spoken language into sign language. The process begins with the Speech to Text phase, where audio is re-encoded, chunked into smaller segments, and transcribed into text using advanced speech recognition tools.
Next, the text undergoes Preprocessing, which includes several steps:
Tokenization: Breaking the text into individual words.
Stopword Removal: Eliminating common, unnecessary words.
Lemmatization: Reducing words to their base forms.
Named Entity Recognition (NER): Identifying key entities in the text.
Synonym Matching: Ensuring consistency with the dataset.
Basic grammar rules are then applied to structure the text accurately. In the final phase, Text to Sign, the processed text is mapped to video IDs, where corresponding video clips are concatenated to form complete sentences. Any corrupted or incomplete video clips are repaired to ensure smooth and accurate sign language translation

Dataset used -> 
WLASL: A large-scale dataset for Word-Level American Sign Language (WACV 20' Best Paper Honourable Mention).
 MLASL : The MLASL dataset is a large-scale collection of annotated videos showcasing over 1,000 ASL signs, designed for multilingual sign language recognition and gesture analysis.
ASL Alphabet : The dataset contains labeled images of static hand gestures representing the 26 letters of the American Sign Language alphabet, designed for gesture recognition tasks.

DataSet Description ->
WLASL->
gloss: str, data file is structured/categorised based on sign gloss, or namely, labels.
bbox: [int], bounding box detected using YOLOv3 of (xmin, ymin, xmax, ymax) convention. Following OpenCV convention, (0, 0) is the up-left corner.
fps: int, frame rate (=25) used to decode the video as in the paper.
frame_start: int, the starting frame of the gloss in the video (decoding with FPS=25), indexed from 1.
frame_end: int, the ending frame of the gloss in the video (decoding with FPS=25). -1 indicates the gloss ends at the last frame of the video.
instance_id: int, id of the instance in the same class/gloss.
signer_id: int, id of the signer.
source: str, a string identifier for the source site.
split: str, indicates sample belongs to which subset.
url: str, used for video downloading.
variation_id: int, id for dialect (indexed from 0).
video_id: str, a unique video identifier.

2.MLASL->
gloss: str, sign gloss or labels representing specific ASL signs.
bbox: [int], bounding box detected using models like YOLOv3 in the (xmin, ymin, xmax, ymax) format, where (0, 0) is the upper-left corner.
fps: int, frame rate at which the videos are processed, typically 25 frames per second.
frame_start: int, the starting frame of the gesture in the video. Indexed from 1.
frame_end: int, the ending frame of the gesture in the video. -1 indicates the gesture ends at the last frame.
instance_id: int, unique identifier for each instance of a particular gloss.
signer_id: int, identifier for the signer performing the gesture.
source: str, identifier for the source site where the data was collected.
split: str, indicates the data subset (e.g., train, validation, test).
url: str, link to download the video.
variation_id: int, identifier for dialect variations of the same gloss.
video_id: str, a unique identifier for each video in the dataset.


3. ASL Alphabet->
alphabet: str, label representing a specific English alphabet (A-Z) in ASL gestures.
image_path: str, file path or URL to the image representing the gesture.
signer_id: int, unique identifier for the individual performing the gesture.
lighting_condition: str, descriptor for the lighting setup (e.g., natural, artificial, shadowed).
background: str, details about the image background (e.g., plain, complex).
variation_id: int, identifier for variations in gesture style (indexed from 0).
split: str, indicates the data subset (e.g., train, validation, test).
image_resolution: [int, int], dimensions of the image (width, height) in pixels.


How to run the project?
Terminal 1:
To get frontend up and running,
1. cd frontend
2. npm i
3. npm start

Terminal 2:
To run backend,
1. cd backend
2. pip install -r requirements.txt
3. cd..
4. python manage.py runserver
