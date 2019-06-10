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
	populate(step) {
		var channel = this.props.channel;
		var track = channel.state;
		step = {};
		step.pitch = track.rootPitch;
		step.bar = this.props.bar; 
		step.beat = this.props.beat; 
		step.tick = this.props.tick; 
		for (var listKey in channel.state.filterList) {
			var filterKey = channel.state.filterList[listKey];
			step[filterKey] = {}
		}
		return step;
	}
	toggle() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		var track = channel.state;
		const steps = track.steps.slice();
		if (!steps[i]) {
			steps[i] = this.populate(steps[i]);
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
			steps[i] = this.populate(steps[i]);
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
