#!/usr/bin/env python3
"""
Simple HTTP server for testing the Kula Browser game.
Serves files with proper MIME types for ES modules.
"""

import http.server
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for module loading
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Ensure JavaScript modules are served with correct MIME type
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.mjs'):
            self.send_header('Content-Type', 'application/javascript')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        # Ensure .js files are served as JavaScript modules
        if path.endswith('.js'):
            return ('application/javascript', None)
        return mimetype

PORT = 8081
Handler = MyHTTPRequestHandler

print(f"Starting server at http://localhost:{PORT}")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")