import React, { Component } from 'react';
import {pitchDiff} from '../Helpers.js';
import {pitchValue} from '../Helpers.js';
import {PITCH_INDEXES} from '../Helpers.js';

class PitchSelector extends React.Component {
	constructor(props) {
		super(props);
		this.keyClick = this.keyClick.bind(this);
	}
	keyClick(event) {
		event.preventDefault();
	}
	render() {
		var parentObj = this.props.parentObj;
		return (
			<div
				className={`pitchSelector ${parentObj.selectedPitch ? "pitch-selected" : ""}`}
				>
				Pitch Selector!
			</div>
		)
	}
}

export default PitchSelector;
