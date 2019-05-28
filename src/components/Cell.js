import React, { Component } from 'react';

class Cell extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			highlight: false
		};
		this.toggle = this.toggle.bind(this);
		this.fill = this.fill.bind(this);
		this.empty = this.empty.bind(this);
	}
	toggle() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		var track = channel.state;
		const steps = track.steps.slice();
		if (!steps[i]) {
			steps[i] = {};
			steps[i].pitch = track.rootPitch;
			steps[i].bar = this.props.bar; 
			steps[i].beat = this.props.beat; 
			steps[i].tick = this.props.tick; 
		}
		else {
			steps[i] = false;
		}
		channel.setState({steps: steps, selectedStep: i});
		track.steps = steps;
		channel.props.updateTrack(track.trackName,track);
	}
	fill() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		var track = channel.state;
		const steps = track.steps.slice();
		if (!steps[i]) {
			steps[i] = {};
			steps[i].pitch = track.rootPitch;
			steps[i].bar = this.props.bar; 
			steps[i].beat = this.props.beat; 
			steps[i].tick = this.props.tick; 
		}
		channel.setState({steps: steps});
		track.steps = steps;
		channel.props.updateTrack(track.trackName,track);
	}
	empty() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		var track = channel.state;
		const steps = track.steps.slice();
		steps[i] = false;
		channel.setState({steps: steps});
		track.steps = steps;
		channel.props.updateTrack(track.trackName,track);
	}
	render() {
		var label = this.props.label || 'Upload File';
		return (
			<div className={"cell " + this.props.cellKey + (this.props.channel.state.selectedStep == this.props.cellKey ? ' highlight' : '') } onClick={this.toggle}>
				{this.props.indicator}
			</div>
		)
	}
}

export default Cell;
