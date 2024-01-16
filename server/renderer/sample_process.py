# This is a modification of https://gist.github.com/mixxorz/abb8a2f22adbdb6d387f
# Thank you mixxorz.
#
# Requires pydub (with ffmpeg) and Pillow
# 
import io
import sys

from pydub import AudioSegment
from pydub.silence import detect_leading_silence
from PIL import Image, ImageDraw
import soundfile as sf

import librosa

from renderer.groove import librosaToPydub
from renderer.custom_effects import resonant_high_pass_filter, resonant_low_pass_filter

class SampleProcess(object):
    def __init__(self, filename: str, options: dict = None):
        self.filename = filename

        audio_file:AudioSegment = AudioSegment.from_file(
            self.filename, self.filename.split('.')[-1])

        trim_leading_silence = lambda x: x[detect_leading_silence(x) :]
        trim_trailing_silence = lambda x: trim_leading_silence(x.reverse()).reverse()
        strip_silence = lambda x: trim_trailing_silence(trim_leading_silence(x))
        
        if options:
            if options['transpose'] or options['pitchShift']:
                # audio_file = audio_file.transpose(options['transpose'])
                y, sr = sf.read(self.filename)

                shiftSteps = 0

                if options['transpose']:
                    shiftSteps = options['transpose'] * 100
                if options['pitchShift']:
                    shiftSteps += options['pitchShift']
                
                y_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=shiftSteps, bins_per_octave=1200)
                audio_file = librosaToPydub((y_pitch, sr))

            if options['normalize']:
                audio_file = audio_file.normalize()
            if options['trim']:
                audio_file = strip_silence(audio_file)
            if options['reverse']:
                audio_file = audio_file.reverse()
            if options['pan']:
                audio_file = audio_file.pan(options['pan'] / 100)
            if options['volume']:
                audio_file = audio_file + options['volume']

            if options['filter1On']:
                if options['filter1Type'] == 'lp':
                    audio_file = audio_file.resonant_low_pass_filter(cutoff_freq=options['filter1Freq'], order=5, q=options['filter1Q'])
                if options['filter1Type'] == 'hp':
                    audio_file = audio_file.resonant_high_pass_filter(cutoff_freq=options['filter1Freq'], order=5, q=options['filter1Q'])
            
            if options['filter2On']:
                if options['filter2Type'] == 'lp':
                    audio_file = audio_file.resonant_low_pass_filter(cutoff_freq=options['filter2Freq'], order=5, q=options['filter2Q'])
                if options['filter2Type'] == 'hp':
                    audio_file = audio_file.resonant_high_pass_filter(cutoff_freq=options['filter2Freq'], order=5, q=options['filter2Q'])

        self.audio_file = audio_file

    def audio(self):
        return self.audio_file

    def export(self):
        print("sample_process.save")
        """ Save the processed sample as an mp3 file """

        buffer = io.BytesIO()
        self.audio_file.export(buffer, format='mp3')
        mp3_data = buffer.getvalue()

        return mp3_data

        


if __name__ == '__main__':
    filename = sys.argv[1]

    processed = SampleProcess(filename)
    processed.export()