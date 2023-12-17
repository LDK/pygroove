# GOAL: Create a simple groovebox using pydub to render JSON sequences created via web
import copy
import io
from pydub import AudioSegment
# import pydub.scipy_effects
import cgitb
from os import curdir, rename
from os.path import join as pjoin

cgitb.enable()

# Beats per minute
bpm = 102

# Beats per bar
beatDiv = 4
# Ticks per beat
tickDiv = 32
# Pattern length in bars
patternLength = 1
# List of patterns to play, in order
songPatterns = []
# Dict of patterns, keyed by position
patternIndex = {}
# Dict of tracks, keyed by name
trackIndex = {}

# Amount of swing to apply to patterns
# Starts getting crazy above 1, reasonably groovy at like .25.  Default to none.
swingAmount = 0;
# swingUp is an iterator that gets toggled with each note, to alternate the swing direction
# i.e., it swings up and then down, or back and then forth.  You get it.
swingUp = False

# Default channel volume and pan
channelDefaults = {'volume': -12.0, 'pan': 0}

# channels begins as an empty dictionary, later to hold AudioSegments
channels = {}

# Pitch indexes
pitchIndexes = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}

def pitch_diff(fromPitch, toPitch):
    for octave in range(9):
      if str(octave) in fromPitch:
          fromOctave = octave
          fromNote = fromPitch.replace(str(fromOctave),"")
      if str(octave) in toPitch:
          toOctave = octave
          toNote = toPitch.replace(str(toOctave),"")
    fromDiff = (toOctave - fromOctave) * 12
    fromNote = fromNote.upper()
    toNote = toNote.upper()
    fromDiff = fromDiff + (pitchIndexes[toNote] - pitchIndexes[fromNote])
    return fromDiff
    
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

def newChannel(name = ''):
    global songPatterns
    trackLength = 0
    patternCount = len(songPatterns)
    # Length of the track is equal to number of bars times beats-per-bar times beat length times number of patterns
    trackLength += (patternLength * beatDiv * patternCount) * beatLen()
    track = AudioSegment.silent(trackLength)
    if name:
        global channels
        channels[name] = track
    else:
        return track
    return 

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
    global channels
    if channels[trackName]:
        channel = channels[trackName]
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
    channel = channel.overlay(sound,int(loc),0)
    channels[trackName] = channel
    # print("Added sound at {loc}".format(loc=loc))

def split(wavFile,pieces):
    soundLoc = '../audio/uploaded/'+wavFile
    sound = AudioSegment.from_wav(soundLoc)
    slices = []
    sliceLen = int(len(sound) / pieces)
    for i, chunk in enumerate(sound[::sliceLen]):
        if (i >= pieces):
            break;
        sliceName = "../audio/uploaded/split/{fileName}-{num}.wav".format(fileName=wavFile.replace('.wav',''),num=i+1)
        sliceInfo = {'filename': sliceName, 'parent': soundLoc, 'start': i*sliceLen, 'end': (i+1)*sliceLen, 'len': len(chunk)}
        with open(sliceName, "wb") as f:
            chunk.export(f, format="wav")
            slices.append(sliceInfo)
    return slices

def transpose(sound,st):
    octaves = float(st) / 12
    new_sample_rate = int(sound.frame_rate * (2.0 ** octaves))
    return sound._spawn(sound.raw_data, overrides={'frame_rate': new_sample_rate})

def getTrackSound(track):
    trackWav = '../audio/' + track['sample']
    trackSound = AudioSegment.from_wav(trackWav)

    print(" ")
    print("Rendering track {}".format(track['name']))
    print(" ")
    print("trackSound:")
    print(trackSound)
    print(" ")
    print("trackWave:")
    print(trackWav)

    if 'trim' in track:
        if (track['trim'] == True):
            trackSound = trim(trackSound)

    if 'reverse' in track:
        if (track['reverse'] == True):
            trackSound = trackSound.reverse()

    # Handle transposition.  trackTranspose is the transposition value in semitones
    if 'transpose' in track:
        trackSound = transpose(trackSound,track['transpose'])

    if 'amp' in track:
        amp = track['amp']            

        if 'attack' in amp:
            peak = 0.0
            if 'peak' in amp:
                peak += float(amp['peak'])
            trackSound = trackSound.fade(from_gain=-120.0, to_gain = peak, start=0, duration=200)

def renderStep(track, trackSound, step):
    trackName = track['name']
    loc = step['loc'].split('.')
    bar = int(loc[0])
    beat = int(loc[1])
    tick = int(loc[2])
    
    if trackSound == None:
        print("No track sound for {}".format(trackName))
        print(trackSound)
        return

    sound = copy.copy(trackSound)

    # Transpose
    if ('transpose' in step):
        sound = transpose(sound,int(step['transpose']))
    
    # Pitch
    if ('pitch' in step):
        rootPitch = track['rootPitch'] if 'rootPitch' in track else 'C4'
        sound = transpose(sound,pitch_diff(rootPitch,step['pitch']))
    
    # Apply the volume
    if ('volume' in step):
        sound = sound + int(step['volume'])
    
    # Apply the pan
    if ('pan' in step):
        sound = sound.pan(int(step['pan'])/100)
    
    # Add note
    addNote(trackName,sound,bar,beat,tick)

def renderJSON(data):
    global channels, bpm, beatDiv, tickDiv, patternLength, swingAmount, swingUp, channelDefaults, songPatterns, patternIndex, trackIndex

    bpm = int(data['bpm'])
    # beatDiv = int(data['beatDiv']), defaulting to 4 if beatDiv key is not present on data
    beatDiv = int(data['beatDiv']) if 'beatDiv' in data else 4
    tickDiv = int(data['tickDiv']) if 'tickDiv' in data else 32
    patternLength = int(data['bars']) if 'bars' in data else 4
    swingAmount = float(data['swing']) if 'swing' in data else 0
    swingUp = False

    songPatterns = data['patternSequence'] if 'patternSequence' in data else []

    title = data['title']

    # Create the master track
    master = newChannel()

    # For each track in the json data, add a channel
    for track in data['tracks']:
        trackName = track['name']

        # Add a channel
        newChannel(trackName)

        # Add to track index
        trackIndex[trackName] = track

    # For each pattern in songPatterns, add it to patternIndex
    for pattern in data['patterns']:
        patternIndex[pattern['position']] = pattern

    # For each pattern in songPatterns, for each track, add the notes, apply any filters, set the volume, set the pan and overlay onto master
    for position in songPatterns:
        pattern = patternIndex[position]

        print("type of pattern['steps']:")
        print(type(pattern['steps']))
        print(" ")
        print("pattern['steps']:")
        print(pattern['steps'])
        print(" ")

        for trackName, steps in pattern['steps'].items():
            track = trackIndex[trackName]
            trackSound = getTrackSound(track)

            for step in steps:
                renderStep(track, trackSound, step)

            # Apply filter1
            if ('filterOn' in track and track['filterOn'] == True):
                if (track['filter']['type'] == 'hp' and track['filter']['frequency']):
                    channels[trackName] = channels[trackName].high_pass_filter(cutoff_freq=int(track['filter']['frequency']), order=3)
                if (track['filter']['type'] == 'lp' and track['filter']['frequency']):
                    channels[trackName] = channels[trackName].low_pass_filter(cutoff_freq=int(track['filter']['frequency']), order=3)
                if (track['filter']['type'] == 'bp' and track['filter']['frequency'] and track['filter']['frequency2']):
                    channels[trackName] = channels[trackName].band_pass_filter(low_cutoff_freq=int(track['filter']['frequency']), high_cutoff_freq=int(['filter']['frequency2']), order=3)
            # Apply the volume
            if 'amp' in track and 'volume' in track['amp']:
                trackVol = float(track['amp']['volume'])
                channels[trackName] += trackVol
            # Apply the pan
            if ('pan' in track):
                trackPan = int(track['pan'])
                channels[trackName] = channels[trackName].pan(trackPan/100)
            # Overlay onto master
            master = master.overlay(channels[trackName],0,0)

    # renderFilename = pjoin("rendered","{}.mp3".format(title))
    renderFilename = "{}.mp3".format(title)

    print(" ")
    print("Rendered to {}".format(renderFilename))
    print(" ")

    # Create an in-memory buffer
    buffer = io.BytesIO()

    master.normalize().export(buffer, format='mp3')

    # Get the MP3 data from the buffer
    mp3_data = buffer.getvalue()

    # Close the buffer
    buffer.close()

    # Write to file
    out_f = open(renderFilename, 'wb')
    out_f.write(mp3_data)

    print(" ")
    print("mp3_data:")
    print(mp3_data)
    print(" ")


    return mp3_data
