#!/usr/bin/env python
 
from os import curdir, rename
from os.path import join as pjoin
from cgi import parse_header, parse_multipart
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
sqlite_file = './pygroove.sqlite'
import groove
import waveform
import json
import simplejson
import sqlite3
import random
import string

# HTTPRequestHandler class
class HTTPServer_RequestHandler(BaseHTTPRequestHandler):
  def randomString(self,stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))
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

  def respond(self, value):
    self.send_response(value)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.end_headers()

  def saveSongData(self, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `song` SET title='{title}',user_id='{uid}',bpm='{bpm}',swing='{swing}' WHERE id = '{id}'".\
            format(title=data['title'], uid=data['user_id'], bpm=data['bpm'], swing=data['swing'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `song` (title,user_id,bpm,swing) VALUES ('{title}','{uid}','{bpm}','{swing}')".\
            format(title=data['title'], uid=data['user_id'], bpm=data['bpm'], swing=data['swing'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def getSongData(self, id):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    selectSql = "SELECT title, user_id, bpm, swing FROM `song` WHERE id = '{id}'".format(id=id)
    c.execute(selectSql)
    songData = c.fetchone()
    postRes = {}
    postRes['title'] = songData[0]
    postRes['user_id'] = songData[1]
    postRes['bpm'] = songData[2]
    postRes['swing'] = songData[3]
    conn.commit()
    conn.close()
    return postRes

  def savePattern(self, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `pattern` SET name='{name}',song_id='{sid}',bars='{bars}',position='{position}' WHERE id = '{id}'".\
            format(name=data['name'], sid=data['song_id'], bars=data['bars'], position=data['position'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `pattern` (name,song_id,bars,position) VALUES ('{name}','{sid}','{bars}','{position}')".\
            format(name=data['name'], sid=data['song_id'], bars=data['bars'], position=data['position'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def saveStepSequence(self, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `stepSequence` SET pattern_id='{pid}',channel_id='{cid}',steps='{steps}' WHERE id = '{id}'".\
            format(pid=data['pattern_id'], cid=data['channel_id'], steps=data['steps'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `stepSequence` (pattern_id,channel_id,steps) VALUES ('{pid}','{cid}',\"{steps}\")".\
            format(pid=data['pattern_id'], cid=data['channel_id'], steps=data['steps'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def saveSongChannel(self, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `channel` SET "\
        "name='{name}',song_id='{sid}',pan='{pan}',volume='{volume}',transpose='{transpose}',disabled='{disabled}',sample_id='{spid}' WHERE id = '{id}'".\
            format(name=data['name'], sid=data['song_id'], pan=data['pan'], volume=data['amp']['volume'], transpose=data['transpose'], disabled=data['disabled'], spid=data['sample_id'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `channel` (name,song_id,pan,volume,transpose,disabled,sample_id)"\
            " VALUES ('{name}','{sid}','{pan}','{volume}','{transpose}','{disabled}','{spid}')".\
            format(name=data['name'], sid=data['song_id'], pan=data['pan'], volume=data['amp']['volume'], transpose=data['transpose'], disabled=data['disabled'], spid=data['sample_id'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def getSongPatterns(self, songId):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    selectSql = """
        SELECT p.id, p.position as patternPosition, p.name as patternName, p.bars, c.id as chanId, c.position as chanPosition, c.name as chanName, ss.steps
        FROM song s
        LEFT JOIN pattern p
        ON p.song_id = s.id
        LEFT JOIN stepSequence ss
        ON ss.pattern_id = p.id
        LEFT JOIN channel c
        ON c.id = ss.channel_id
        WHERE s.id = {sid};
    """.format(sid=songId)
    c.execute(selectSql)
    patterns = c.fetchall()
    conn.close()
    postRes = {}
    for pattern in patterns:
        if not (pattern[1] in postRes):
            postRes[pattern[1]] = {'chanSequences': {}}
        postRes[pattern[1]]['id'] = pattern[0]
        postRes[pattern[1]]['position'] = pattern[1]
        postRes[pattern[1]]['name'] = pattern[2]
        postRes[pattern[1]]['bars'] = pattern[3]
        postRes[pattern[1]]['chanSequences'][pattern[5]] = pattern[7]
    return postRes

  def getSongChannels(self, songId):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()

    selectSql = """SELECT c.id as channel_id, s.filename, s.reverse, s.trim, s.normalize, c.sample_id, c.volume, c.pan, c.transpose, c.disabled,
        f1.`on` as filterOn, f1.frequency as filterFrequency, f1.type as filterType, f2.`on` as filter2On,
        f2.frequency as filter2Frequency, f2.type as filter2Type,
        c.name
        FROM channel c
        LEFT JOIN sample s
        ON c.sample_id = s.id
        LEFT JOIN filterSection f1
        ON f1.channel_id = c.id
        LEFT JOIN filterSection f2
        ON f2.channel_id = c.id
        WHERE c.song_id = {sid}
        AND f1.position = 1
        AND f2.position = 2""".format(sid=songId)

    c.execute(selectSql)
    channels = c.fetchall()
    conn.close()
    postRes = {}
    key = 0
    for channel in channels:
        key = key + 1
        postRes[channel[16]] = {
            'id': channel[0],
            'position': key,
            'name': channel[16],
            'wav': channel[1],
            'reverse': channel[2],
            'trim': channel[3],
            'normalize': channel[4],
            'sampleId': channel[5],
            'amp': {
                'volume': channel[6],
            },
            'pan': channel[7],
            'transpose': channel[8],
            'disabled': channel[9],
            'filter': {
                'on': channel[10],
                'frequency': channel[11],
                'type': channel[12],
            },
            'filter2': {
                'on': channel[13],
                'frequency': channel[14],
                'type': channel[15],
            }
        }
    return postRes

  def saveSample(self, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `sample` SET filename='{filename}',normalize='{normalize}',reverse='{reverse}',trim='{trim}') WHERE id = '{id}'".\
            format(filename=data['filename'], normalize=data['normalize'], reverse=data['reverse'], trim=data['trim'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `sample` (filename,normalize,reverse,trim) VALUES ('{filename}','{normalize}','{reverse}','{trim}')".\
            format(filename=data['filename'], normalize=data['normalize'], reverse=data['reverse'], trim=data['trim'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def saveFilterSection(self, position, channelId, data):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    if ('id' in data):
        updateSql = "UPDATE `filterSection` SET "\
        "position='{position}',channel_id='{cid}',`on`='{on}',type='{type}',frequency='{frequency}' WHERE id = '{id}'".\
            format(position=position, cid=channelId, on=data['on'], type=data['type'], frequency=data['frequency'], id=data['id'])
        c.execute(updateSql)
        savedId = data['id']
    else:
        insertSql = "REPLACE INTO `filterSection` (position,channel_id,`on`,type,frequency)"\
            " VALUES ('{position}','{cid}','{on}','{type}','{frequency}')".\
            format(position=position, cid=channelId, on=data['on'], type=data['type'], frequency=data['frequency'])
        c.execute(insertSql)
        savedId = c.lastrowid
    conn.commit()
    conn.close()
    return savedId

  def checkCreds(self,user_id,pyKey):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    c.execute("SELECT id FROM `user` WHERE `id` = '{uid}' AND `pyKey` = '{pyKey}'".\
        format(uid=user_id, pyKey=pyKey))
    user_match = c.fetchone()
    conn.close()
    return user_match

  def do_POST(self):
    conn = sqlite3.connect(sqlite_file)
    c = conn.cursor()
    
    if (self.path == '/login'):
        postvars = self.parse_POST()
        uName = postvars['username'][0]
        uPass = postvars['password'][0]
        c.execute("SELECT id, pyKey FROM `user` WHERE `username` = '{username}' AND `password` = '{password}'".\
            format(username=uName, password=uPass))
        user_match = c.fetchone()
        if not user_match:
            self.respond(401)
            c.execute("SELECT id FROM `user` WHERE `username` = '{username}'".format(username=uName))
            username_found = c.fetchone()
            if username_found:
                postRes = {
                    "error": 'wrong-password'
                }
            else:
                postRes = {
                    "error": 'no-user'
                }
        else:
            self.respond(200)
            postRes = {}
            postRes['user_id'] = user_match[0]
            postRes['pyKey'] = user_match[1]
            postRes['username'] = uName
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/register'):
        postvars = self.parse_POST()
        uName = postvars['username'][0]
        uPass = postvars['password'][0]
        uEmail = postvars['email'][0]
        c.execute("SELECT id, pyKey FROM `user` WHERE `username` = '{username}'".format(username=uName))
        user_match = c.fetchone()
        if user_match:
            self.respond(401)
            postRes = {
                "error": 'username-taken'
            }
        else:
            c.execute("SELECT id, pyKey FROM `user` WHERE `email` = '{email}'".format(email=uEmail))
            email_match = c.fetchone()
            if email_match:
                self.respond(401)
                postRes = {
                    "error": 'email-taken'
                }
            else:
                uKey = self.randomString(32)
                insertSql = "INSERT INTO `user` (username,email,password,pyKey) VALUES ('{un}','{em}','{pw}','{pk}')"\
                .format(un=uName, em=uEmail, pw=uPass, pk=uKey)
                c.execute(insertSql)
                conn.commit()
                self.respond(200)
                postRes = {
                    "username" : uName,
                    "email" : uEmail,
                    "pyKey" : uKey
                }
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/upload'):
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
        self.respond(200)
        postRes = {
          "wav": fName,
          "img": imgLoc
        }
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/song'):
        postvars = self.parse_POST()
        pyKey = postvars['pyKey'][0]
        uid = postvars['user_id'][0]
        sid = postvars['song_id'][0]
        authorized = self.checkCreds(uid,pyKey)
        if not authorized:
            self.respond(401)
            return
        self.respond(200)
        postRes = self.getSongData(sid)
        postRes['id'] = sid
        postRes['channels'] = self.getSongChannels(sid)
        postRes['patterns'] = self.getSongPatterns(sid)
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/channels'):
        postvars = self.parse_POST()
        pyKey = postvars['pyKey'][0]
        uid = postvars['user_id'][0]
        sid = postvars['song_id'][0]
        authorized = self.checkCreds(uid,pyKey)
        if not authorized:
            self.respond(401)
            return
        self.respond(200)
        postRes = self.getSongChannels(sid)
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/patterns'):
        postvars = self.parse_POST()
        pyKey = postvars['pyKey'][0]
        uid = postvars['user_id'][0]
        sid = postvars['song_id'][0]
        authorized = self.checkCreds(uid,pyKey)
        if not authorized:
            self.respond(401)
            return
        self.respond(200)
        postRes = self.getSongPatterns(sid)
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    elif (self.path == '/upload-splitter'):
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
        self.respond(200)
        postRes = {
          "wav": fName,
          "img": imgLoc,
          "slices": groove.split(fName,16)
        }
        self.wfile.write(json.dumps(postRes).encode("utf-8"))
        conn.close()
        return
        
    else:
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        data = simplejson.loads(self.data_string)
        fName = groove.renderJSON(self.data_string);
        pyKey = data['currentUser']['pyKey']
        # TODO HERE: checkUserKey(pyKey,data['currentUser']['user_id']) ... if fail, return
        if ('id' in data):
            songId = data['id']
            self.saveSongData({
                "user_id": data['currentUser']['user_id'],
                "title": data['title'],
                "bpm": int(data['bpm']),
                "swing": data['swing'],
                "id": songId
            })
        else:
            songId = self.saveSongData({
                "user_id": data['currentUser']['user_id'],
                "title": data['title'],
                "bpm": int(data['bpm']),
                "swing": data['swing']
            })
        trackPos=0
        for key, track in data['tracks'].items():
            sampleId = self.saveSample({
                "filename": track['wav'],
                "reverse": track['reverse'],
                "normalize": track['normalize'],
                "trim": track['trim'],
            })
            track['sample_id'] = sampleId
            track['song_id'] = songId
            track['name'] = key
            channelId = self.saveSongChannel(track)
            track['channel_id'] = channelId
            filterSectionId = self.saveFilterSection(1,channelId,track['filter'])
            filterSection2Id = self.saveFilterSection(2,channelId,track['filter2'])
            track['filter_id'] = filterSectionId
            track['filter2_id'] = filterSection2Id
        # NOTE: We don't have multiple patterns yet so this will get a little more complex
        position = 1
        patternId = self.savePattern({
            "bars": data['bars'],
            "song_id": songId,
            "position": position,
            "name": data['title'] + " Pattern  " + str(position)
        })    
        for key, track in data['tracks'].items():
            self.saveStepSequence({
                "pattern_id": patternId,
                "channel_id": track['channel_id'],
                "steps": track['notes']
            })
        self.respond(200)
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
