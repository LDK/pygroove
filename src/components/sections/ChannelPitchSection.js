import React, { Component } from 'react';
import Incrementer from '../Incrementer.js';

// This const is a modification of an excerpt of https://raw.githubusercontent.com/kevinsqi/react-piano/master/src/MidiNumbers.js
const PITCH_INDEXES = {
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

function pitchValue(noteName) {
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

function pitchDiff(fromNote,toNote) {
	return pitchValue(toNote) - pitchValue(fromNote);
}

class ChannelPitchSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		var parentObj = this.props.parentObj;
		var props = this.props;
		return (
			<div className={props.containerClass}>
				<Incrementer label="Transpose" parentObj={parentObj} settingsMode={parentObj.state.settingsMode} callback={parentObj.handleTranspose} inputClass="transpose col-8 px-0 mx-auto" disabled={parentObj.state.settingsMode == 'step' && (!parentObj.state.selectedStep || !parentObj.state.steps[parentObj.state.selectedStep])} min="-48" max="48"
					value={
						parentObj.state.settingsMode == 'step' 
						? (parentObj.state.selectedStep && parentObj.state.steps[parentObj.state.selectedStep]
							? parentObj.state.steps[parentObj.state.selectedStep].transpose 
							: "0")
						: (parentObj.state.transpose || "0")
					} 
				/>
				<hr className="my-1" />
				<Incrementer label="Root Note" parentObj={parentObj} settingsMode={parentObj.state.settingsMode} callback={parentObj.handleTranspose} inputClass="transpose col-8 px-0 mx-auto" disabled={parentObj.state.settingsMode == 'step' && (!parentObj.state.selectedStep || !parentObj.state.steps[parentObj.state.selectedStep])} min="-48" max="48"
					value={
						parentObj.state.settingsMode == 'step' 
						? (parentObj.state.selectedStep && parentObj.state.steps[parentObj.state.selectedStep]
							? parentObj.state.steps[parentObj.state.selectedStep].transpose 
							: "0")
						: (parentObj.state.transpose || "0")
					} 
				/>
			</div>

		)
	}
}

export default ChannelPitchSection;
