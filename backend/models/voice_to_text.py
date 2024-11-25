import whisper
import os
from pydub import AudioSegment
import speech_recognition as sr

def get_text_using_whisper():
    model = whisper.load_model("base")
    audio_file_path = os.path.join(os.path.dirname(__file__), '../audio/audio_file.wav')
    result = model.transcribe(audio_file_path)
    with open(os.path.join(os.path.dirname(__file__), "./output.txt"), "a") as fh:
        fh.write("Text using whisper library : ")
        fh.write(result['text'])
        fh.write("\n")

def convert_voice_to_text():
    print("Preprocessing audio file")
    audio_file_path = os.path.join(os.path.dirname(__file__), '../../audio/audio_file.wav')
    
    print("Looking for audio file at:", audio_file_path)

    if not os.path.exists(audio_file_path):
        print("The audio file was not found.")
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    
    # Try to load the audio file
    try:
        audio = AudioSegment.from_wav(audio_file_path)
    except FileNotFoundError:
        print(f"FileNotFoundError: The file {audio_file_path} does not exist.")
        raise
    except Exception as e:
        print(f"An error occurred while loading the audio: {e}")
        raise
    n = len(audio)

    counter = 1
    fh = open("backend/models/output.txt", "a")

    # Interval length at which to slice the audio file.
    interval = 15 * 1000

    # Length of audio to overlap.
    overlap = 1 * 1000

    # Initialize start and end seconds to 0
    start = 0
    end = 0

    # Flag to keep track of end of file.
    flag = 0

    fh.write("Text using SpeechRecognition Library : ")

    transcriptions = []

    # Iterate from 0 to end of the file,
    # with increment = interval
    for i in range(0, 2 * n, interval):

        # During first iteration,
        # start is 0, end is the interval
        if i == 0:
            start = 0
            end = interval

        # All other iterations,
        # start is the previous end - overlap
        # end becomes end + interval
        else:
            start = end - overlap
            end = start + interval

        # When end becomes greater than the file length,
        # end is set to the file length
        # flag is set to 1 to indicate break.
        if end >= n:
            end = n
            flag = 1

        # Storing audio file from the defined start to end
        chunk = audio[start:end]

        # Filename / Path to store the sliced audio
        filename = 'backend/models/chunk' + str(counter) + '.wav'

        # Store the sliced audio file to the defined path
        chunk.export(filename, format="wav")
        # Print information about the current chunk
        # print("Processing chunk " + str(counter) + ". Start = "
        #       + str(start) + " end = " + str(end))

        # Increment counter for the next chunk
        counter = counter + 1

        # Here, Google Speech Recognition is used
        # to take each chunk and recognize the text in it.

        # Specify the audio file to recognize
        AUDIO_FILE = filename

        # Initialize the recognizer
        r = sr.Recognizer()

        # Traverse the audio file and listen to the audio
        with sr.AudioFile(AUDIO_FILE) as source:
            audio_listened = r.listen(source)

        # Try to recognize the listened audio
        # And catch exceptions.
        try:
            rec = r.recognize_google(audio_listened)
            transcriptions.append(rec + " ")
            # If recognized, write into the file.
            # fh.write(rec + " ")

        # If google could not understand the audio
        except sr.UnknownValueError:
            print("Could not understand audio")

        # If the results cannot be requested from Google.
        # Probably an internet connection error.
        except sr.RequestError as e:
            print("Could not request results.")

        # Check for flag.
        # If flag is 1, end of the whole audio reached.
        # Close the file and break.
        if flag == 1:
            # fh.close()
            break
    
    final_transcription = ""
    previous_transcription = ""
    for t in transcriptions:
        overlap_found = False
        for i in range(1, min(len(previous_transcription), len(t)) + 1):  # Check overlapping lengths from 1 to max possible
            # Compare the last `i` characters of `previous_transcription` with the first `i` characters of `t`
            if previous_transcription[-i:] == t[:i]:
                t = t[i:]  # Remove the overlapping part from `t`
                overlap_found = True
                break
    
        final_transcription += t
        previous_transcription = t if overlap_found else previous_transcription + t

    fh.write(final_transcription + " ")
    fh.write("\n")
    fh.close()
    # msg = open('models/recognized.txt', 'r').read()
    print(final_transcription)
    return final_transcription
    


