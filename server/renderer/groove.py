# GOAL: Create a simple groovebox using pydub to render JSON sequences created via web
import copy
import datetime
import io
import librosa
import soundfile as sf

import numpy as np
from pydub import AudioSegment
from .custom_effects import *
import cgitb
from os import curdir, rename
from os.path import join as pjoin

cgitb.enable()

# Beats per minute
bpm = 102

# Beats per bar
beatDiv = 4
# Ticks per beat
tickDiv = 16
# Song length in bars
songBars = 0
# List of patterns to play, in order
songPatterns = []
# Dict of patterns, keyed by position
patternIndex = {}
# # Dict of tracks, keyed by name
# trackIndex = {}

filterMaxFreq = 22000

# Amount of swing to apply to patterns
# Starts getting crazy above 1, reasonably groovy at like .25.  Default to none.
swingAmount = 0;
# swingUp is an iterator that gets toggled with each note, to alternate the swing direction
# i.e., it swings up and then down, or back and then forth.  You get it.
swingUp = False

# Default channel volume and pan
channelDefaults = {'volume': -12.0, 'pan': 0}

# channels begins as an empty dictionary, later to hold AudioSegments
# channels = {}

current_offset_ms = 0  # Start at 0 ms

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
    
# Takes a librosa-formatted (float32) audiofile and returns a pydub (int16) AudioSegment
# Adapted from https://stackoverflow.com/posts/68151661/revisions
def librosaToPydub(audiofile):
    y, sr = audiofile
    
    # convert from float to uint16
    y = np.array(y * (1<<15), dtype=np.int16)
    audio_segment = AudioSegment(
        y.tobytes(), 
        frame_rate=sr,
        sample_width=y.dtype.itemsize, 
        channels=1
    )
    return audio_segment

# Takes a pydub (int16) AudioSegment and returns a librosa-formatted (float32) audiofile
# Adapted from https://stackoverflow.com/posts/68151661/revisions

def pydubToLibrosa(audio_segment:AudioSegment):
    samples = audio_segment.get_array_of_samples()
    y = np.array(samples).astype(np.float32)/32768 # 16 bit 
    y = librosa.core.resample(y, audio_segment.frame_rate, 44100, res_type='kaiser_best')
    sr = audio_segment.frame_rate
    
    # y = np.frombuffer(audio_segment._data, dtype=np.int16)
    # y = y.astype(np.float32) / (1<<15)
    return y, sr

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

    # Length of the track is equal to number of bars times beats-per-bar times beat length times number of patterns
    trackLength = songBars * barLen()

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

    # master = master.overlay(channels[trackName], position=current_offset_ms)
    soundLoc = float(int(loc) + int(current_offset_ms))
    channel = channel.overlay(sound, position=soundLoc, gain_during_overlay=-12.0)

    # print ("Adding note to track {} at {}".format(trackName,soundLoc))

    channels[trackName] = channel

def split(wavFile,pieces):
    soundLoc = './audio/uploaded/'+wavFile
    sound = AudioSegment.from_wav(soundLoc)
    slices = []
    sliceLen = int(len(sound) / pieces)
    for i, chunk in enumerate(sound[::sliceLen]):
        if (i >= pieces):
            break;
        sliceName = "./audio/uploaded/split/{fileName}-{num}.wav".format(fileName=wavFile.replace('.wav',''),num=i+1)
        sliceInfo = {'filename': sliceName, 'parent': soundLoc, 'start': i*sliceLen, 'end': (i+1)*sliceLen, 'len': len(chunk)}
        with open(sliceName, "wb") as f:
            chunk.export(f, format="wav")
            slices.append(sliceInfo)
    return slices

def getTrackSound(track):
    trackWav = './audio/' + track['sample']['filename']
    trackSound = AudioSegment.from_wav(trackWav) - 12

    if 'transpose' in track:
        transpose = int(track['transpose'])
        y, sr = sf.read(trackWav)
        y_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=transpose)

        trackSound = librosaToPydub((y_pitch, sr))

    if 'normalize' in track:
        if (track['normalize'] == True):
            trackSound = trackSound.normalize()

    if 'trim' in track:
        if (track['trim'] == True):
            trackSound = trim(trackSound)

    if 'reverse' in track:
        if (track['reverse'] == True):
            trackSound = trackSound.reverse()

    if 'pan' in track:
        # print ("Panning track {} to {}".format(track['name'],track['pan'] / 100))
        trackSound = trackSound.pan(track['pan']/100)

    # Apply the volume
    if 'volume' in track:
        trackVol = float(track['volume'])
        trackSound += trackVol
        # print ("Applying volume of {} to track {}".format(trackVol,track['name']))

    if 'filters' in track:
        for filter in track['filters']:
            if filter['on'] == True:
                if filter['filter_type'] == 'hp':
                    trackSound = trackSound.resonant_high_pass_filter(cutoff_freq=int(filter['frequency'] * filterMaxFreq), order=3)
                if filter['filter_type'] == 'lp':
                    trackSound = trackSound.resonant_low_pass_filter(cutoff_freq=int(filter['frequency'] * filterMaxFreq), order=5, q=filter['q'])
                # if filter['filter_type'] == 'bp':
                #     trackSound = trackSound.band_pass_filter(low_cutoff_freq=int(filter['frequency']), high_cutoff_freq=int(filter['frequency2']), order=3)

    # if 'amp' in track:
    #     amp = track['amp']            

    #     if 'attack' in amp:
    #         peak = 0.0
    #         if 'peak' in amp:
    #             peak += float(amp['peak'])
    #         trackSound = trackSound.fade(from_gain=-120.0, to_gain = peak, start=0, duration=200)

    return trackSound

def getStepSound(step, track):
    trackWav = './audio/' + track['sample']['filename']
    stepSound = AudioSegment.from_wav(trackWav) - 12

    shiftSteps = 0
    transposeSteps = 0

    if 'pitch' in step:
        transposeSteps += pitch_diff(track['rootPitch'],step['pitch'])
        shiftSteps = transposeSteps * 100
    if 'transpose' in track:
        transposeSteps += int(track['transpose'])
        shiftSteps = transposeSteps * 100
    if 'pitchShift' in track:
        shiftSteps += int(track['pitchShift'])

    if shiftSteps != 0:
        y, sr = sf.read(trackWav)
        y_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=shiftSteps, bins_per_octave=1200)

        stepSound = librosaToPydub((y_pitch, sr))

    if 'normalize' in track:
        if (track['normalize'] == True):
            stepSound = stepSound.normalize()

    if 'trim' in track:
        if (track['trim'] == True):
            stepSound = trim(stepSound)

    if 'reverse' in track:
        if (track['reverse'] == True):
            stepSound = stepSound.reverse()

    if 'pan' in track:
        # print ("Panning track {} to {}".format(track['name'],track['pan'] / 100))
        stepSound = stepSound.pan(track['pan']/100)

    # Apply the volume
    if 'volume' in track:
        trackVol = float(track['volume'])
        stepSound += trackVol
        # print ("Applying volume of {} to track {}".format(trackVol,track['name']))

    if 'filters' in track:
        for filter in track['filters']:
            if filter['on'] == True:
                if filter['filter_type'] == 'hp':
                    stepSound = stepSound.high_pass_filter(cutoff_freq=int(filter['frequency'] * filterMaxFreq), order=3)
                if filter['filter_type'] == 'lp':
                    stepSound = stepSound.resonant_low_pass_filter(cutoff_freq=int(filter['frequency'] * filterMaxFreq), order=5, q=filter['q'])
                # if filter['filter_type'] == 'bp':
                #     trackSound = trackSound.band_pass_filter(low_cutoff_freq=int(filter['frequency']), high_cutoff_freq=int(filter['frequency2']), order=3)

    return stepSound

def renderStep(track, trackSound, step):
    trackName = track['name']
    loc = step['loc'].split('.')
    bar = int(loc[0])
    beat = int(loc[1])
    tick = int(loc[2])
    
    if trackSound == None:
        return

    sound = copy.copy(trackSound)
    
    # Apply the volume
    if ('velocity' in step):
        velocityOffset = float((step['velocity'] - 80) / 127)
        volumeDiff = velocityOffset * abs(track['volume']) if 'volume' in track else velocityOffset

        if volumeDiff:
            # print ("Applying velocity of {} to track {}".format(step['velocity'],track['name']))
            # print ("Velocity offset is {}".format(velocityOffset))
            # print ("Track volume is {}".format(track['volume']))
            # print ("Volume diff is {}".format(volumeDiff))

            sound = sound + volumeDiff
    
    # Apply the pan
    if ('pan' in step):
        sound = sound.pan(int(step['pan'])/100)
    
    # Add note
    addNote(trackName,sound,bar,beat,tick)

def renderJSON(data):
    global channels, bpm, beatDiv, tickDiv, songBars, swingAmount, swingUp, channelDefaults, songPatterns, patternIndex, trackIndex, current_offset_ms

    # Reset all the globals
    trackIndex = {}
    channels = {}

    current_offset_ms = 0

    bpm = int(data['bpm'])
    # beatDiv = int(data['beatDiv']), defaulting to 4 if beatDiv key is not present on data
    beatDiv = int(data['beatDiv']) if 'beatDiv' in data else beatDiv
    tickDiv = int(data['tickDiv']) if 'tickDiv' in data else tickDiv
    swingAmount = float(data['swing']) if 'swing' in data else swingAmount
    swingUp = False

    songPatterns = data['patternSequence'] if 'patternSequence' in data else []
    songPatterns = [1,1,1]
    songBars = 0

    # For each pattern in songPatterns, add it to patternIndex
    for pattern in data['patterns']:
        patternIndex[pattern['position']] = pattern

    for patternPosition in songPatterns:
        pattern = patternIndex[patternPosition]

        if 'bars' in pattern:
            songBars += int(pattern['bars'])


    title = data['title']

    # Create the master track
    master = newChannel()

    # For each track in the json data, add a channel
    for track in data['tracks']:
        if 'disabled' in track and track['disabled'] == True:
            if track['name'] in trackIndex:
                # print ("Removing track {}".format(track['name']))
                del trackIndex[track['name']]
                del channels[track['name']]
            continue

        trackName = track['name']

        # print ("Adding track {}".format(trackName))

        # Add a channel
        newChannel(trackName)

        # Add to track index
        trackIndex[trackName] = track

    # For each pattern in songPatterns, for each track, add the notes, apply any filters, set the volume, set the pan and overlay onto master
    for position in songPatterns:
        pattern = patternIndex[position]

        for trackName, steps in pattern['steps'].items():
            if trackName in trackIndex:
                track = trackIndex[trackName]
                # print ("Rendering pattern {} track {}".format(position,trackName))
            else:
                continue

            for step in steps:
                stepSound = getStepSound(step, track)
                renderStep(track, stepSound, step)

            # # Apply the volume
            # if 'volume' in track:
            #     trackVol = float(track['volume'])
            #     channels[trackName] += trackVol
            # Apply the pan
            # if ('pan' in track):
            #     trackPan = int(track['pan'])
            #     channels[trackName] = channels[trackName].pan(trackPan/100)


        patternLength = int(pattern['bars']) if 'bars' in pattern else 2
        # Calculate duration of one pattern in milliseconds
        one_pattern_duration_ms = patternLength * beatDiv * (60000 / bpm)

        # Move to the next pattern's start
        current_offset_ms += one_pattern_duration_ms

    for trackName, track in channels.items():
        master = master.overlay(track, position=0, gain_during_overlay=-6)
        # print ("Overlaying track {}".format(trackName))

    # Create an in-memory buffer
    buffer = io.BytesIO()

    master.normalize().export(buffer, format='mp3', bitrate="320k")

    # Get the MP3 data from the buffer
    mp3_data = buffer.getvalue()


    # Write to file

    # get date string formatted like 20231231235959
    datestring = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    renderFilename = "{}".format(title)

    out_f = open("{}.mp3".format(renderFilename), 'wb')
    out_f.write(mp3_data)

    master.normalize().export(buffer, format='mp3', bitrate="320k")

    # Load the new mp3 with librosa
    audiofile = librosa.load(buffer, mono=False, sr=44100)
    testSegment = librosaToPydub(audiofile)

    # Write the testSegment to file
    testSegment.normalize().export("{}-2.mp3".format(renderFilename), format="mp3")

    out_f = open("{}-3.mp3".format(renderFilename), 'wb')
    out_f.write(mp3_data)

    # Close the buffer
    buffer.close()


    return mp3_data
