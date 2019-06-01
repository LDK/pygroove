# GOAL: Create a simple groovebox using pydub to render JSON sequences created via web
import copy
import pyaudio
import wave
import sys
import json
import simplejson
from pydub import AudioSegment
import pydub.scipy_effects
import cgitb
from os import curdir, rename
from os.path import join as pjoin

cgitb.enable()

channels = {}

# Beats per minute
bpm = 102

# Beats per bar
beatDiv = 4
# Ticks per beat
tickDiv = 32
# Pattern length in bars
patternLength = 1

# Amount of swing to apply to patterns
# Starts getting crazy above 1, reasonably groovy at like .25.  Default to none.
swingAmount = 0;
# swingUp is an iterator that gets toggled with each note, to alternate the swing direction
# i.e., it swings up and then down, or back and then forth.  You get it.
swingUp = False

# Default channel volume and pan
channelDefaults = {'volume': -12.0, 'pan': 0}

# Start with an empty dictionary of tracks
tracks = {}

def detect_leading_silence(sound, silence_threshold=-50.0, chunk_size=10):
    trim_ms = 0 # ms

    assert chunk_size > 0 # to avoid infinite loop
    while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
        trim_ms += chunk_size

    return trim_ms

def trim(sound, silence_threshold=-50.0, chunk_size=10):
    start_trim = detect_leading_silence(sound, silence_threshold, chunk_size)
    end_trim = detect_leading_silence(sound.reverse(), silence_threshold, chunk_size)
    duration = len(sound)    
    trimmed_sound = sound[start_trim:duration-end_trim]
    return trimmed_sound

def newTrack(name = ''):
    trackLength = 0
    # Length of the track is equal to number of bars times beats-per-bar times beat length
    trackLength += (patternLength * beatDiv) * beatLen()
    track = AudioSegment.silent(trackLength)
    if name:
        global tracks
        tracks[name] = track
    else:
        return track
    return 

def addChannel():
    global channels
    newName = input()
    if len(newName):
        newChannel = channelDefaults
        newChannel['name'] = newName
        channels[len(channels)+1] = copy.copy(newChannel)
        listChannels()
    else:
        # do nothing, just end the process
        return()

def reindexChannels():
    global channels
    newChannels = {}
    for key, channel in channels.items():
        newChannels[len(newChannels)+1] = copy.copy(channel)
    channels = newChannels

def deleteChannel():
    global channels
    listChannels('Select a channel to delete:')
    selection = input()
    try:
        selection = int(selection)
        if selection not in channels:
            print("Invalid selection.")
        else:
            del channels[selection]
            reindexChannels()
    except ValueError:
        print("Invalid selection.")

def menuPrompt(menuName):
    menu = menuItems[menuName];
    for key, item in menu.items():
        skip = False
        if ('condition' in item and item['condition'] == 'hasChannels' and len(channels) < 1):
            skip = True
        if not skip:
            print("{key}. {label}".format(key=key, label=item['label']))
    selection = input()
    try:
        selection = int(selection)
        if selection not in menu:
            print("Invalid selection.")
            menuPrompt(menuName)
        else:
            print("OK then we should do {operation}".format(operation=menu[selection]['operation']))
            exec(menu[selection]['operation']+'()')
    except ValueError:
        print("Invalid selection.")
        menuPrompt(menuName)

def dashLine(length):
    lineStr = ''
    count = 1
    while count <= length:
        lineStr += '-'
        count += 1
    return lineStr

def panDisplay(pan):
    if pan == 0:
        return 'C'
    if pan > 0:
        return "{}R".format(pan)
    if pan < 0:
        return "{}L".format(abs(pan))

def listChannels(prompt = 'Available channels:'):
    if (len(channels)):
        print(prompt)
    else:
        print("No channels have been added.")
    for index, channel in channels.items():
        print("{index}. {name} (Vol: {vol}, Pan: {pan})".format(index=index,name=channel['name'], vol=channel['volume'], pan=channel['pan']))

def channelSelect(prompt):
    print(prompt)
    selection = input()
    try:
       return int(selection)
    except ValueError:
       return None;

# Length of a bar in milliseconds
def barLen():
    return (60/bpm) * 1000 * beatDiv

# Length of a beat in milliseconds
def beatLen():
    return (60/bpm) * 1000

# Length of a tick in milliseconds
def tickLen():
    return (60/bpm) * 1000 / tickDiv

# Add an instance of a sound at a location determined by bpm-based placement
def addNote(trackName,sound,bar,beat,tick,options = {}):
    global swingUp
    global tracks
    if tracks[trackName]:
        track = tracks[trackName]
    else:
        return
    # If swing is active and we are not on the very first tick of the pattern, apply swing
    if (swingAmount and (tick > 1 or beat > 1 or bar > 1)):
        if (swingUp):
            tick += swingAmount
        else:
            tick -= swingAmount
        swingUp = not swingUp
    loc = 0
    loc += tickLen() * (tick - 1)
    loc += beatLen() * (beat - 1)
    loc += barLen() * (bar - 1)
    loc = int(loc)
    track = track.overlay(sound,int(loc),0)
    tracks[trackName] = track
    # print("Added sound at {loc}".format(loc=loc))

def split(wavFile,pieces):
    sound = AudioSegment.from_wav('./audio/uploaded/'+wavFile)
    slices = []
    sliceLen = int(len(sound) / pieces);
    for i, chunk in enumerate(sound[::sliceLen]):
        if (i >= pieces):
            break;
        sliceName = "./audio/uploaded/split/{fileName}-{num}.wav".format(fileName=wavFile.replace('.wav',''),num=i+1)
        with open(sliceName, "wb") as f:
            chunk.export(f, format="wav")
            slices.append(sliceName)
    return slices

def transpose(sound,st):
    octaves = float(st) / 12
    new_sample_rate = int(sound.frame_rate * (2.0 ** octaves))
    return sound._spawn(sound.raw_data, overrides={'frame_rate': new_sample_rate})

def renderJSON(json):
    global channels, bpm, beatDiv, tickDiv, patternLength, swingAmount, swingUp, channelDefaults, tracks
    data = simplejson.loads(json)

    bpm = int(data['bpm'])
    beatDiv = int(data['beatDiv'])
    tickDiv = int(data['tickDiv'])
    patternLength = int(data['bars'])
    swingAmount = float(data['swing'])
    swingUp = False

    tracks = {}

    title = data['title']
    channels = data['tracks']
    if ('repeat' in data):
        repeat = data['repeat']

    # Create the master track
    master = newTrack()
    print("Rendering")
    print(dashLine(9))
    print("Title:  {}".format(title))
    print("Tempo:  {} BPM".format(bpm))
    print("Length: {} bars".format(patternLength))
    print(" ")
    print("Tracks")
    print(dashLine(6))
    # For each listed channel, add a track, add the notes, apply any filters, set the volume, set the pan and overlay onto master
    # TODO: Split all these steps into functions for neatness' sake
    for trackName, channel in channels.items():
        # Add a track
        newTrack(trackName)
        # Add the notes
        trackNotes = channel['notes']
        trackWav = channel['wav']
        trackSound = AudioSegment.from_wav('./audio/'+trackWav)
        trackTranspose = 0
        if 'trim' in channel:
            if (channel['trim'] == True):
                trackSound = trim(trackSound)
        if 'reverse' in channel:
            if (channel['reverse'] == True):
                trackSound = trackSound.reverse()
        # Handle transposition.  trackTranspose is the transposition value in semitones
        if 'transpose' in channel:
            trackTranspose = channel['transpose']
            trackSound = transpose(trackSound,trackTranspose)
        amp = False
        if 'amp' in channel:
            amp = channel['amp']
            if 'attack' in amp:
                peak = 0.0
                if 'peak' in amp:
                    peak += float(amp['peak'])
                trackSound = trackSound.fade(from_gain=-120.0, to_gain = peak, start=0, duration=200)

        for note in trackNotes:
            # Parse note location, volume and any other settings
            noteData = note['loc'].split('.')
            noteBar = int(noteData[0])
            noteBeat = int(noteData[1])
            noteTick = int(noteData[2])
            addSound = copy.copy(trackSound)
            # Transpose
            if ('transpose' in note):
                addSound = transpose(addSound,int(note['transpose']))
            # Apply the volume
            if ('volume' in note):
                addSound = addSound + int(note['volume'])
            # Apply the pan
            if ('pan' in note):
                addSound = addSound.pan(int(note['pan'])/100)
            # Add note
            out_f = open(pjoin("rendered/tmp","processed-{}.wav".format(trackName)), 'wb')
            addSound.export(out_f, format='wav')
            addNote(trackName,addSound,noteBar,noteBeat,noteTick)
            out_f = open(pjoin("rendered/tmp","layer-{}.wav".format(trackName)), 'wb')
            tracks[trackName].export(out_f, format='wav')
        # Apply filter1
        if ('filterOn' in channel and channel['filterOn'] == True):
            if (channel['filter']['type'] == 'hp' and channel['filter']['frequency']):
                tracks[trackName] = tracks[trackName].high_pass_filter(cutoff_freq=int(channel['filter']['frequency']), order=3)
            if (channel['filter']['type'] == 'lp' and channel['filter']['frequency']):
                tracks[trackName] = tracks[trackName].low_pass_filter(cutoff_freq=int(channel['filter']['frequency']), order=3)
            if (channel['filter']['type'] == 'bp' and channel['filter']['frequency'] and channel['filter']['frequency2']):
                tracks[trackName] = tracks[trackName].band_pass_filter(low_cutoff_freq=int(channel['filter']['frequency']), high_cutoff_freq=int(['filter']['frequency2']), order=3)
        # Apply the volume
        if amp:
            trackVol = float(amp['volume'])
            tracks[trackName] += trackVol
        # Apply the pan
        if ('pan' in channel):
            trackPan = int(channel['pan'])
            tracks[trackName] = tracks[trackName].pan(trackPan/100)
        # Overlay onto master
        master = master.overlay(tracks[trackName],0,0)
        print("{name}: {vol}db, Pan: {pan} ".format(name=trackName,vol=trackVol,pan=panDisplay(trackPan)))

    renderFilename = pjoin("rendered","{}.mp3".format(title))
    print(" ")
    print("Rendered to {}".format(renderFilename))
    print(" ")
    out_f = open(renderFilename, 'wb')
    master *= repeat
    master.normalize().export(out_f, format='mp3')
    return renderFilename
