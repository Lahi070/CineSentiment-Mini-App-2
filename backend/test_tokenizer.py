import json
# pyrefly: ignore [missing-import]
import tensorflow as tf
# pyrefly: ignore [missing-import]
from tensorflow.keras.preprocessing.text import tokenizer_from_json

print(f"TensorFlow version: {tf.__version__}")
tokenizer_path = r"C:\Users\User\Desktop\CineSentiment-Mini-App 2\Model Data\tokenizer_v2.json"

try:
    with open(tokenizer_path, 'r', encoding='utf-8') as f:
        data = f.read()
        tokenizer_from_json(data)
        print("Success with f.read()")
except Exception as e:
    print(f"Failed with f.read(): {e}")

try:
    with open(tokenizer_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        tokenizer_from_json(data)
        print("Success with json.load()")
except Exception as e:
    print(f"Failed with json.load(): {e}")
