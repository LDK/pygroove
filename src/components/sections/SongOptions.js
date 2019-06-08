import React, { Component } from 'react';
import Range from '../Range.js';

class SongOptions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.updateSwing = this.updateSwing.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateBPM = this.updateBPM.bind(this);
	}
	updateBPM(event) {
		var song = this.props.parentObj;
		song.setState({bpm: event.target.value});
	}
	updateTitle(event) {
		var song = this.props.parentObj;
		song.setState({title: event.target.value});
	}
	updateSwing(value) {
		var song = this.props.parentObj;
		song.setState({swing: value});
	}
	render() {
		var song = this.props.parentObj;
		return (
			<div className="status row">
				<div className="col-10">
					<label>Title:</label><input type="text" value={song.state.title} onChange={this.updateTitle} tabIndex="-1" /><br />
					<label>BPM:</label><input type="text" value={song.state.bpm} onChange={this.updateBPM} tabIndex="-1" /><br />
				</div>
				<div className="col-2">
					Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={song.state.swing} />
				</div>
			</div>
		)
	}
}

export default SongOptions;
