#!/usr/bin/env python
 
from os import curdir, rename
from os.path import join as pjoin
from cgi import parse_header, parse_multipart
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import groove
import waveform
import json

# HTTPRequestHandler class
class HTTPServer_RequestHandler(BaseHTTPRequestHandler):
  def parse_POST(self):
    ctype, pdict = parse_header(self.headers.get('Content-Type'))
    pdict['boundary'] = bytes(pdict['boundary'], "utf-8")
    content_len = int(self.headers.get('Content-length'))
    pdict['CONTENT-LENGTH'] = content_len
    if ctype == 'multipart/form-data':
        postvars = parse_multipart(self.rfile, pdict)
    elif ctype == 'application/x-www-form-urlencoded':
        length = int(self.headers['content-length'])
        postvars = parse_qs(
        self.rfile.read(length), 
        keep_blank_values=1)
    else:
        postvars = {}
    return postvars
  # GET
  def do_GET(self):
    # Send response status code
    self.send_response(200)
 
    # Send headers
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Content-type','text/html')
    self.end_headers()
 
    # Send message back to client
    message = "Hello world!"
    # Write content as utf-8 data
    self.wfile.write(bytes(message, "utf8"))
    return

  def do_POST(self):
    # Send headers
    self.send_response(200)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.end_headers()

    if (self.path == '/upload'):
        postvars = self.parse_POST()
        fName = postvars['filename'][0]
        fData = postvars['file'][0]
        fLoc = pjoin(curdir, "audio/uploaded", fName)
        with open(fLoc, 'wb') as fh:
            fh.write(fData)
        imgLoc = pjoin(curdir, "img/waveform/uploaded", fName.replace('.wav','.png'))
        waveImg = waveform.Waveform(fLoc)
        imgInitLoc = waveImg.save()
        rename(imgInitLoc,imgLoc)
        self.send_response(200)
        postRes = {
          "wav": fName,
          "img": imgLoc
        }
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        return;
        
    if (self.path == '/upload-splitter'):
        postvars = self.parse_POST()
        fName = postvars['filename'][0]
        fData = postvars['file'][0]
        fLoc = pjoin(curdir, "audio/uploaded", fName)
        with open(fLoc, 'wb') as fh:
            fh.write(fData)
        imgLoc = pjoin(curdir, "img/waveform/uploaded", fName.replace('.wav','.png'))
        waveImg = waveform.Waveform(fLoc)
        imgInitLoc = waveImg.save()
        rename(imgInitLoc,imgLoc)
        self.send_response(200)
        postRes = {
          "wav": fName,
          "img": imgLoc,
          "slices": groove.split(fName,16)
        }
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        return;
        
    self.data_string = self.rfile.read(int(self.headers['Content-Length']))
    fName = groove.renderJSON(self.data_string);
    self.wfile.write(bytes(fName, "utf8"))

    return

def run():
    print('starting server...')
 
    # Server settings
    # Choose port 8080, for port 80, which is normally used for a http server, you need root access
    server_address = ('127.0.0.1', 8081)
    httpd = HTTPServer(server_address, HTTPServer_RequestHandler)
    print('running server...')
    httpd.serve_forever()
 
 
run()
