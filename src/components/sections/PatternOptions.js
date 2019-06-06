import React, { Component } from 'react';
import Range from '../Range.js';
import FilterSection from './FilterSection.js';
import SampleSection from './SampleSection.js';
import ChannelPitchSection from './ChannelPitchSection.js';

class PatternOptions extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var pattern = this.props.pattern;
		return (
			<div className="status row">
				<div className="col-10">
					<label>Title:</label><input type="text" value={pattern.state.title} onChange={pattern.updateTitle} tabIndex="-1" /><br />
					<label>BPM:</label><input type="text" value={pattern.state.bpm} onChange={pattern.updateBPM} tabIndex="-1" /><br />
				</div>
				<div className="col-2">
					Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={pattern.updateSwing} min="0" max="1.25" step=".01" value={pattern.state.swing} />
				</div>
			</div>
		)
	}
}

export default PatternOptions;
