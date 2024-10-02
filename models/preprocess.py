import os
import pandas as pd
import string
import nltk
from nltk.corpus import stopwords
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import spacy
from pydub import AudioSegment
import speech_recognition as sr
import json

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

# Load the spacy model for Named Entity Recognition (NER)
nlp = spacy.load("en_core_web_sm")

with open('../dataset/WLASL_v0.3.json', 'r') as f:
    wlasl_data = json.load(f)

# Extract glosses from the JSON data
glosses = {entry['gloss'] for entry in wlasl_data}

lemmatizer = WordNetLemmatizer()

def process_audio():
    print("Preprocessing audio file")
    audio_file_path = os.path.join(os.path.dirname(__file__), '../audio/Tentacle_00001.wav')

    # Print the audio file path for debugging
    print("Looking for audio file at:", audio_file_path)

    # Check if the audio file exists
    if not os.path.exists(audio_file_path):
        print("Oopsie! The audio file was not found.")
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    # audio = AudioSegment.from_wav(audio_file_path)
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
    # return "HI"


# Function to get the synonym of a word
def get_synonym(word):
    synonyms = wordnet.synsets(word)
    if synonyms:
        return [lemma.name() for lemma in synonyms[0].lemmas()]  # Return the first synonym
    return [word]

def get_synonym_matching_gloss(word, glosses):
    synonyms = get_synonym(word)
    print(f"Word: {word}, Synonyms: {synonyms}")
    for synonym in synonyms:
        if synonym in glosses:
            print(f"Matched Synonym: {synonym}")
            return synonym
    return word

# print(glosses)

# A placeholder function for checking Sign Language grammar.
# You'll need to implement real logic based on your rules of ASL grammar.
def check_sign_language_grammar(tokens):
    # Simplified - In real life, ASL has its own grammar rules

    asl_tokens = []

    # Rule 1: Remove articles ('a', 'an', 'the')
    tokens = [word for word in tokens if word not in ['a', 'an', 'the']]

    # Rule 2: Convert to topic-comment structure (optional, simplified here)
    # In a more advanced implementation, you would need to identify subjects (topics)
    # and move them to the front of the sentence. For now, just apply word order.

    # Rule 3: Remove 'be' verbs ('is', 'am', 'are', 'was', 'were')
    tokens = [word for word in tokens if word not in ['is', 'am', 'are', 'was', 'were']]

    # Rule 4: Simplify verbs (lemmatize to base form)
    tokens = [lemmatizer.lemmatize(word) for word in tokens]

    # Rule 5: Time indicators first (for simplicity, we'll just identify time words manually)
    time_indicators = ['yesterday', 'today', 'tomorrow']
    time_tokens = [word for word in tokens if word in time_indicators]
    tokens = [word for word in tokens if word not in time_indicators]

    # Rebuild the sentence with time first
    asl_tokens = time_tokens + tokens

    return asl_tokens

def text_process(msg):
    # Step 1: Remove punctuation
    no_punc = [char for char in msg if char not in string.punctuation]
    no_punc = ''.join(no_punc)

    # Step 2: Tokenize and Convert to Lowercase
    words = no_punc.split()
    words = [word.lower() for word in words]

    # Step 3: Remove Stop Words
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]

    # Step 4: Lemmatize Words
    lemmatized_words = [lemmatizer.lemmatize(word) for word in words]

    # Step 5: Named Entity Recognition (NER) using spaCy
    doc = nlp(' '.join(lemmatized_words))
    ner_tokens = [(ent.text, ent.label_) for ent in doc.ents]

    # Step 6: Check for Synonyms
    # synonyms = [get_synonym(word) for word in lemmatized_words]

    synonyms = [get_synonym_matching_gloss(word, glosses) for word in lemmatized_words]
    # Step 7: Check Sign Language Grammar (dummy function for now)
    asl_grammar_checked = check_sign_language_grammar(synonyms)

    # Step 8: Join Words back to form the processed sentence
    processed_message = " ".join(asl_grammar_checked)

    return {
        "processed_message": processed_message,
        "ner_tokens": ner_tokens
    }

# Example Usage
msg = process_audio()
result = text_process(msg)
print("Processed Message:", result['processed_message'])
print("NER Tokens:", result['ner_tokens'])

def get_message():
    msg=process_audio()
    result = text_process(msg)
    print("Processed Message:", result['processed_message'])
    print("NER Tokens:", result['ner_tokens'])
    return result['processed_message']

if __name__ == '__main__':
    get_message()
