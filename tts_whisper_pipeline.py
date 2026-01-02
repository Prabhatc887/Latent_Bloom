import sys
import os
import torch
import soundfile as sf
import subprocess
import traceback
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from transformers.utils import logging

# Whisper import
try:
    import whisper
except ImportError:
    print("[ERROR] Whisper is not installed. Run:")
    print("& 'C:/Program Files/Python311/python.exe' -m pip install openai-whisper")
    sys.exit(1)

logging.set_verbosity_error()

def text_to_speech(text: str, output_wav: str, device: torch.device):
    print("[INFO] Loading SpeechT5 models...")
    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(device)
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(device)
    print("[INFO] Models loaded successfully.")

    speaker_embeddings = torch.randn(1, 512).to(device)
    inputs = processor(text=text, return_tensors="pt").to(device)

    with torch.no_grad():
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)

    sf.write(output_wav, speech.cpu().numpy(), samplerate=16000)
    print(f"[INFO] Audio saved to: {output_wav}")

    if os.name == "nt":
        subprocess.run(["start", "", output_wav], shell=True)

def transcribe_audio(audio_path: str, model_size: str = "base"):
    print(f"[INFO] Loading Whisper model ({model_size})...")
    model = whisper.load_model(model_size)
    print(f"[INFO] Transcribing {audio_path} ...")
    result = model.transcribe(audio_path)
    transcript = result["text"]
    print("\n" + "="*40)
    print("[INFO] TRANSCRIPTION RESULT:")
    print("="*40)
    print(transcript)
    txt_file = os.path.splitext(audio_path)[0] + "_transcript.txt"
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(transcript)
    print(f"[INFO] Transcript saved to: {txt_file}")
    return transcript

def main():
    if len(sys.argv) < 2:
        print("Usage: python tts_whisper_pipeline.py <text to synthesize>")
        sys.exit(1)

    text = " ".join(sys.argv[1:])
    folder = os.path.dirname(os.path.abspath(__file__))
    output_wav = os.path.join(folder, "output_audio.wav")
    device = torch.device("cpu")

    print("[INFO] Starting TTS...")
    text_to_speech(text, output_wav, device)

    print("[INFO] Starting transcription of generated audio...")
    transcribe_audio(output_wav, model_size="base")

if __name__ == "__main__":
    main()
