import React, { Component } from 'react';
import {pitchDiff} from '../Helpers.js';
import {pitchValue} from '../Helpers.js';
import {PITCH_INDEXES} from '../Helpers.js';

class PitchSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			note: this.props.note || 'C',
			octave: this.props.octave || 4,
			value: 'C4'
		};
		this.onPitchChange = this.onPitchChange.bind(this);
	}
	keyClick(event) {
		event.preventDefault();
	}
	onPitchChange(event) {
		if (!event.currentTarget) { return this.render(); }
		var selClass = event.currentTarget.className;
		var note = this.state.note;
		var octave = this.state.octave;
		var channel = this.props.parentObj;
		switch(selClass) {
			case 'noteSel':
				note = event.currentTarget.value;
				this.setState({ note: note });
			break;
			case 'octaveSel':
				octave = event.currentTarget.value;
				this.setState({ octave: octave });
			break;
		}
		var newValue = note + octave;
		this.setState({ value: newValue }, function(){
			channel.props.updateTrack(channel.state.trackName,channel.state);
			this.render();
		});
	}
	render() {
		var parentObj = this.props.parentObj;
		// const noteOptions = PITCH_INDEXES.map((val,noteName) =>
		// 	<option className="note-option" key={val} value={noteName}>{noteName}</option>
		// );
		return (
			<div
				className={`pitchSelector ${parentObj.selectedPitch ? "pitch-selected" : ""}`}
				>
				Pitch Selector! {this.state.value}
				<select className="noteSel" onChange={this.onPitchChange}>
					<option>C</option>
					<option>C#</option>
					<option>D</option>
					<option>D#</option>
					<option>E</option>
					<option>F</option>
					<option>F#</option>
					<option>G</option>
					<option>G#</option>
					<option>A</option>
					<option>A#</option>
					<option>B</option>
				</select>
				<select className="octaveSel" onChange={this.onPitchChange} value={this.state.octave}>
					<option>1</option>
					<option>2</option>
					<option>3</option>
					<option>4</option>
					<option>5</option>
					<option>6</option>
					<option>7</option>
				</select>
			</div>
		)
	}
}

export default PitchSelector;
