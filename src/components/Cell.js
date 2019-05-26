import React, { Component } from 'react';

class Cell extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			hightlight: false
		};
		this.toggle = this.toggle.bind(this);
		this.fill = this.fill.bind(this);
		this.empty = this.empty.bind(this);
	}
	toggle() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		const steps = channel.state.steps.slice();
		steps[i] = !steps[i];
		channel.setState({steps: steps, selectedStep: i});
		var track = channel.state;
		track.steps = steps;
		channel.props.updateTrack(track.trackName,track);
	}
	fill() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		const steps = channel.state.steps.slice();
		steps[i] = true;
		channel.setState({steps: steps});
		var track = channel.state;
		track.steps = steps;
		channel.props.updateTrack(track.trackName,track);
	}
	empty() {
		var i = this.props.cellKey;
		var channel = this.props.channel;
		const steps = channel.state.steps.slice();
		steps[i] = false;
		channel.setState({steps: steps});
		var track = channel.state;
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
