#!/bin/sh
set -eu

cd "$(dirname "$0")"
PORT="${PS4_HOST_PORT:-8000}"

exec python3 - "$PORT" <<'PY'
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".css": "text/css",
        ".bin": "application/octet-stream",
        ".appcache": "text/cache-manifest",
    }

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if path.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico")):
            self.send_header("Cache-Control", "public, max-age=604800")
        else:
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

port = int(sys.argv[1])
server = ThreadingHTTPServer(("0.0.0.0", port), partial(Handler, directory="."))
print("Unified PS4 host on http://0.0.0.0:%d/" % port, flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
PY
