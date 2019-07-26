import React, { Component } from 'react';
import Range from '../widgets/Range.js';
import {cellFormat} from '../Helpers.js';

class SongOptions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.updateSwing = this.updateSwing.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateBPM = this.updateBPM.bind(this);
		this.selectPattern = this.selectPattern.bind(this);
	}
	updateBPM(event) {
		var song = this.props.song;
		song.setState({bpm: event.target.value});
	}
	updateTitle(event) {
		var song = this.props.song;
		song.setState({title: event.target.value});
	}
	updateSwing(value) {
		var song = this.props.song;
		song.setState({swing: value});
	}
	selectPattern(event) {
		var song = this.props.song;
		var position = event.target.value;
		song.setState({ activePatternIndex: position });
		for (var chanPos in song.channels) {
			var channel = song.channels[chanPos];
			channel.clearCells();
			var steps = JSON.parse(song.patterns[position].chanSequences[chanPos].replace(/'/g, '"').toLowerCase());
			for (var i in steps) {
				var step = cellFormat(steps[i]);
				song.channels[chanPos].fillCell(step,steps[i]);
			}
		}
		song.render();
	}
	render() {
		var song = this.props.song;
		var patternKeys = Object.keys(song.patterns);
		const patternOptions = patternKeys.map((index,i) =>
		<option className="contextMenu-option" key={i} value={song.patterns[index].position}>{song.patterns[index].position}: {song.patterns[index].name}</option>
		);
		return (
			<div className="status row">
				<div className="col-6">
					<label>Title:</label><input type="text" value={song.state.title} onChange={this.updateTitle} tabIndex="-1" /><br />
					<label>BPM:</label><input type="text" value={song.state.bpm} onChange={this.updateBPM} tabIndex="-1" /><br />
				</div>
				<div className="col-4 text-left">
					<select name="activePattern" onChange={this.selectPattern}>
						{patternOptions}
					</select>
				</div>
				<div className="col-2">
					Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={song.state.swing} />
				</div>
			</div>
		)
	}
}

export default SongOptions;
