
import pyttsx3
import sys
engine = pyttsx3.init()
message = sys.argv[1] if len(sys.argv) > 1 else "Hello sir, how may I help you?"
engine.say(message)
engine.runAndWait()
