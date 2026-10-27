
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import os
import time

BASE_DIR = Path(__file__).resolve().parent


class TestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(
            *args,
            directory=str(BASE_DIR),
            **kwargs
        )

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path.startswith("/slow/"):
            filename = parsed.path.removeprefix("/slow/")
            delay = float(params.get("delay", ["3"])[0])
            delay = max(0, min(delay, 10))

            file_path = BASE_DIR / "assets" / filename

            if not file_path.is_file() or filename not in {
                "track-a.wav",
                "track-b.wav",
                "track-c.wav"
            }:
                self.send_error(404, "Audio file not found")
                return

            print(f"START {filename} — waiting {delay}s")
            time.sleep(delay)

            content = file_path.read_bytes()

            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()

            try:
                self.wfile.write(content)
                print(f"DONE  {filename}")
            except (BrokenPipeError, ConnectionResetError):
                print(f"CANCELLED {filename}")

            return

        if parsed.path == "/slow-error":
            time.sleep(2)
            self.send_error(500, "Simulated server error")
            return

        super().do_GET()


if __name__ == "__main__":
    os.chdir(BASE_DIR)

    server = ThreadingHTTPServer(
        ("127.0.0.1", 8766),
        TestHandler
    )

    print("Test server running at http://127.0.0.1:8766")
    server.serve_forever()
