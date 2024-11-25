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
import ffmpeg
from .voice_to_text import convert_voice_to_text


nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

# Load the spacy model for Named Entity Recognition (NER)
nlp = spacy.load("en_core_web_sm")


# -----------------------------------------------------------------------
# Re-encode faulty file
def reencode_wav(input_file_path, output_file_path):
    try:
        # Re-encode the WAV file using ffmpeg
        ffmpeg.input(input_file_path).output(output_file_path, acodec='pcm_s16le', ar=44100).run(overwrite_output=True)
        print(f"File re-encoded successfully to {output_file_path}")
    except ffmpeg.Error as e:
        print(f"An error occurred during re-encoding: {e.stderr.decode()}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

input_file = os.path.join(os.path.dirname(__file__), '../../audio/Tentacle_00001.wav') # Replace with your input file path
output_file = os.path.join(os.path.dirname(__file__), '../../audio/audio_file.wav')  # Replace with your desired output file path
reencode_wav(input_file, output_file)

# Get all the objects in dataset to match synonym words
with open(os.path.join(os.path.dirname(__file__), '../../dataset/WLASL_v0.3.json'), 'r') as f:
    wlasl_data = json.load(f)
glosses = {entry['gloss'] for entry in wlasl_data}

lemmatizer = WordNetLemmatizer()




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
    synonyms = [get_synonym_matching_gloss(word, glosses) for word in lemmatized_words]
    # Step 7: Check Sign Language Grammar (dummy function for now)
    asl_grammar_checked = check_sign_language_grammar(synonyms)
    # Step 8: Join Words back to form the processed sentence
    processed_message = " ".join(asl_grammar_checked)

    return {
        "processed_message": processed_message,
        "ner_tokens": ner_tokens
    }

def preprocess_text(text=""):

    if not text:
        text=convert_voice_to_text()
    
    result = text_process(text)
    print("Processed Message:", result['processed_message'])
    print("NER Tokens:", result['ner_tokens'])
    return result['processed_message']

if __name__ == '__main__':
    preprocess_text()
