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
		this.newPattern = this.newPattern.bind(this);
		this.deletePattern = this.deletePattern.bind(this);
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
		for (var chanPos in song.channels) {
			var channel = song.channels[chanPos];
			channel.clearCells();
			var steps = JSON.parse(song.patterns[position].chanSequences[chanPos].replace(/'/g, '"').toLowerCase());
			for (var i in steps) {
				var step = cellFormat(steps[i]);
				song.channels[chanPos].fillCell(step,steps[i]);
			}
		}
		song.setState({ activePatternIndex: position });
		song.render();
	}
	deletePattern(event) {
		
	}
	newPattern(event) {
		var song = this.props.song;
		console.log('new pattern in addition to',song.patterns);
		var position = Object.keys(song.patterns).length + 1;
		song.setState({ activePatternIndex: position });
		for (var chanPos in song.channels) {
			var channel = song.channels[chanPos];
			channel.clearCells();
		}
		var patternObj = { 
			name: "Pattern " + position,
			position: position,
			bars: 2,
			id: null,
			chanSequences: {}
		};
		this.props.song.registerPattern(position,patternObj);
	}
	render() {
		var song = this.props.song;
		var patternKeys = Object.keys(song.patterns);
		const patternOptions = patternKeys.map((index,i) =>
		<option className="contextMenu-option" key={i} value={song.patterns[index].position}>{song.patterns[index].position}: {song.patterns[index].name}</option>
		);
		for (var i in patternOptions) {
			if (patternOptions[i] == song.state.activePatternIndex) {
				patternOptions[i].props.selected = true;
			}
		}
		return (
			<div className="status row">
				<div className="col-6">
					<label>Title:</label><input type="text" value={song.state.title} onChange={this.updateTitle} tabIndex="-1" /><br />
					<label>BPM:</label><input type="text" value={song.state.bpm} onChange={this.updateBPM} tabIndex="-1" /><br />
				</div>
				<div className="col-4 text-left">
					<select name="activePattern" onChange={this.selectPattern} value={song.state.activePatternIndex}>
						{patternOptions}
					</select>
					<a href="javascript:;" className="d-block" onClick={this.newPattern}>New Pattern</a>
					<a href="javascript:;" className="d-block" onClick={this.deletePattern}>Delete Pattern</a>
				</div>
				<div className="col-2">
					Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={song.state.swing} />
				</div>
			</div>
		)
	}
}

export default SongOptions;
