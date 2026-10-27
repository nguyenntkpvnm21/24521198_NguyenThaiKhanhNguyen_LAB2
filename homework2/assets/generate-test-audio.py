
import math
import struct
import wave
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent

SAMPLE_RATE = 44100
DURATION = 8
AMPLITUDE = 0.35

TRACKS = {
    "track-a.wav": 220,
    "track-b.wav": 440,
    "track-c.wav": 880,
}


def generate_tone(filename, frequency):
    output_path = OUTPUT_DIR / filename
    frame_count = SAMPLE_RATE * DURATION

    with wave.open(str(output_path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(SAMPLE_RATE)

        frames = bytearray()

        for i in range(frame_count):
            time = i / SAMPLE_RATE

            fade_in = min(1.0, time / 0.05)
            fade_out = min(1.0, (DURATION - time) / 0.05)
            envelope = max(0.0, min(fade_in, fade_out))

            sample = AMPLITUDE * envelope * (
                0.65 * math.sin(2 * math.pi * frequency * time)
                + 0.25 * math.sin(2 * math.pi * frequency * 2 * time)
                + 0.10 * math.sin(2 * math.pi * frequency * 3 * time)
            )

            frames.extend(
                struct.pack("<h", int(sample * 32767))
            )

        audio.writeframes(frames)

    print(f"Created: {output_path.name}")


for filename, frequency in TRACKS.items():
    generate_tone(filename, frequency)

print("All test audio files generated successfully.")
