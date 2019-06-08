import React, { Component } from 'react';
import PowerButton from '../PowerButton.js';
import ContextMenu from '../ContextMenu.js';

const channelActions = {
	fill: function(channel) {
		for (var i=1;i<channel.state.steps.length;i++) {
			channel.fillCell(i);
		}
	},
	fill2: function(channel) {
		for (var i=1;i<channel.state.steps.length;i=i+2) {
			channel.fillCell(i);
		}
	},
	fill4: function(channel) {
		for (var i=1;i<channel.state.steps.length;i=i+4) {
			channel.fillCell(i);
		}
	},
	fill8: function(channel) {
		for (var i=1;i<channel.state.steps.length;i=i+8) {
			channel.fillCell(i);
		}
	},
	clear: function(channel) {
		for (var i=1;i<channel.state.steps.length;i++) {
			channel.emptyCell(i);
		}
	},
	copy: function(channel) {
		channel.state.pattern.addToClipboard('steps',channel.state.steps);
	},
	cut: function(channel) {
		channel.state.pattern.addToClipboard('steps',channel.state.steps);
		this.clear(channel);
	},
	paste: function(channel) {
		if (channel.state.pattern.state.clipboard.steps) {
			channel.setState({ steps: channel.state.pattern.state.clipboard.steps });
		}
	}
}

class ChannelControls extends React.Component {
	constructor(props) {
		super(props);
		this.updateActive = this.updateActive.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.runChannelAction = this.runChannelAction.bind(this);
	}
	updateActive(value) {
		var channel = this.props.parentObj;
		channel.setState({ disabled: !value, disabledClass: !value ? 'disabled' : '' }, 
			function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			}
		);
	}
	runChannelAction(event) {
		if (event.currentTarget.value) {
			channelActions[event.currentTarget.value](this.props.parentObj);
		}
	}
	toggleSettings(value) {
		var channel = this.props.parentObj;
		var opn = channel.state.settingsOpen;
		opn = !opn;
		channel.setState({ settingsOpen: opn, settingsClass: opn ? '' : ' d-none' });
	}
	render() {
		var channel = this.props.parentObj;
		return (
			<div className={this.props.containerClass}>
				<PowerButton switchedOn={true} className="d-inline-block" callback={this.updateActive} />
				<PowerButton switchedOn={false} className="d-inline-block gearIcon" callback={this.toggleSettings} />
				<ContextMenu open={false} className="d-inline-block channelActions"
					callback={this.runChannelAction}
				 	items={[
						{value: 'fill', label: 'Fill All Notes'},
						{value: 'fill2', label: 'Fill Every 2 Notes'},
						{value: 'fill4', label: 'Fill Every 4 Notes'},
						{value: 'fill8', label: 'Fill Every 8 Notes'},
						{value: 'clear', label: 'Clear All Notes', prompt: 'Are you Sure?'},
						{value: 'copy', label: 'Copy Pattern'},
						{value: 'cut', label: 'Cut Pattern'},
						{value: 'paste', label: 'Paste Pattern'},
					]} />
			</div>
		)
	}
}

export default ChannelControls;