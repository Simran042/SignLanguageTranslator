from pydub import AudioSegment
import speech_recognition as sr

def process_audio(audioPath):
    audio = AudioSegment.from_wav(audioPath + '/audio/intro.wav')
    n = len(audio)

    # Variable to count the number of sliced chunks
    counter = 1

    # Text file to write the recognized audio
    fh = open("recognized.txt", "w+")

    # Interval length at which to slice the audio file.
    interval = 15 * 1000

    # Length of audio to overlap.
    overlap = 0.2 * 1000

    # Initialize start and end seconds to 0
    start = 0
    end = 0

    # Flag to keep track of end of file.
    flag = 0

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
        filename = 'chunk' + str(counter) + '.wav'

        # Store the sliced audio file to the defined path
        chunk.export(filename, format="wav")
        # Print information about the current chunk
        print("Processing chunk " + str(counter) + ". Start = "
              + str(start) + " end = " + str(end))

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

            # If recognized, write into the file.
            fh.write(rec + " ")

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
            fh.close()
            break

    msg = open('recognized.txt', 'r').read()
    print(msg)
    return msg
