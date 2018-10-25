# GOAL: Create a simple groovebox using pydub to render JSON sequences created via web
import copy
import pyaudio
import wave
import sys
import json
from pydub import AudioSegment
import pydub.scipy_effects

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
    if (swingAmount and tick > 1 and beat > 1 and bar > 1):
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

def transpose(sound,st):
    octaves = float(st) / 12
    new_sample_rate = int(sound.frame_rate * (2.0 ** octaves))
    return sound._spawn(sound.raw_data, overrides={'frame_rate': new_sample_rate})

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

# Open the demo file and parse through its settings and data
with open("demo.json") as patternFile:
    repeat = 1
    response = json.load(patternFile)
    title = response['title']
    bpm = int(response['bpm'])
    patternLength = int(response['bars'])
    channels = response['tracks']
    if ('repeat' in response):
        repeat = response['repeat']
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
    for trackName, channel in channels.items():
        # Add a track
        newTrack(trackName)
        # Add the notes
        trackNotes = channel['notes']
        trackWav = channel['wav']
        trackSound = AudioSegment.from_wav('./'+trackWav)
        trackTranspose = 0
        # Handle transposition.  trackTranspose is the transposition value in semitones
        if 'transpose' in channel:
            trackTranspose = channel['transpose']
            trackSound = transpose(trackSound,trackTranspose)
        amp = False
        if 'amp' in channel:
            amp = channel['amp']
            print("amp")
            print(amp)
            if 'attack' in amp:
                peak = 0.0
                if 'peak' in amp:
                    peak += float(amp['peak'])
                    print("Fading to {peak}db in {attack}ms".format(peak=peak,attack=amp['attack']))
                trackSound = trackSound.fade(from_gain=-120.0, to_gain = peak, start=0, duration=200)
                # out_f = open("enveloped.mp3", 'wb')
                # trackSound.export(out_f, format='mp3')
#                trackSound = trackSound.fade(to_gain=peak, start=0, duration=int(amp['attack']))
#                trackSound = trackSound.fade(from_gain=-120.0, to_gain=peak, start=0, duration=3000)

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
            out_f = open("processed-{}.wav".format(trackName), 'wb')
            addSound.export(out_f, format='wav')
            addNote(trackName,addSound,noteBar,noteBeat,noteTick)
            out_f = open("layer-{}.wav".format(trackName), 'wb')
            tracks[trackName].export(out_f, format='wav')
        # Apply filters
        if 'filterType' in channel:
            if (channel['filterType'] == 'hpf' and channel['cutoff']):
                tracks[trackName] = tracks[trackName].high_pass_filter(cutoff_freq=int(channel['cutoff']), order=3)
            if (channel['filterType'] == 'lpf' and channel['cutoff']):
                tracks[trackName] = tracks[trackName].low_pass_filter(cutoff_freq=int(channel['cutoff']), order=3)
            if (channel['filterType'] == 'bpf' and channel['cutoff']):
                tracks[trackName] = tracks[trackName].band_pass_filter(low_cutoff_freq=int(channel['cutoff']), high_cutoff_freq=int(channel['cutoff2']), order=3)
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

    renderFilename = "{}.mp3".format(title)
    print(" ")
    print("Rendered to {}".format(renderFilename))
    print(" ")
    out_f = open(renderFilename, 'wb')
    master *= repeat
    master.normalize().export(out_f, format='mp3')
