//Helpers.js

export const panFormat = (value) => {
	var num = Math.abs(value);
	var dir = 'C';
	if (value == 0) {
		return dir;
	}
	else if (value > 0) {
		dir = 'R';
	}
	else {
		dir = 'L';
	}
	return num + dir;
}

export const stepFormat = (step) => {
	var bar = (Math.floor((step-1) / 16)) + 1;
	var beat = (Math.floor((step-1) / 4) % 4) + 1;
	var tick = (1 + (step-1) * 8) % 32;
	return {
		bar: bar, 
		beat: beat, 
		tick: tick,
		loc: bar + "." + beat + "." + tick
	};
}

// This const is a modification of an excerpt of https://raw.githubusercontent.com/kevinsqi/react-piano/master/src/MidiNumbers.js
export const PITCH_INDEXES = {
	C: 0,
	'C#': 1,
	D: 2,
	'D#': 3,
	E: 4,
	'E#': 5,
	F: 5,
	'F#': 6,
	G: 7,
	'G#': 8,
	A: 9,
	'A#': 10,
	B: 11,
	'B#': 12
};

export const pitchValue = (noteName) => {
	noteName = noteName.trim();
	if (noteName.length == 3) {
		var pitchName = noteName.substring(0,2);
		var octave = parseInt(noteName.substring(2,3));
	}
	else if (noteName.length == 2) {
		var pitchName = noteName.substring(0,1);
		var octave = parseInt(noteName.substring(1,2));
	}
	var val = 12;
	val += octave * 12;
	val += PITCH_INDEXES[pitchName];
	return val;
}

export const pitchDiff = (fromNote,toNote) => {
	return pitchValue(toNote) - pitchValue(fromNote);
}
