import React, { Component } from 'react';
import PowerButton from '../PowerButton.js';
import ContextMenu from '../ContextMenu.js';
import Range from '../Range.js';
import {panFormat} from '../Helpers.js';

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
		this.updatePan = this.updatePan.bind(this);
		this.updateVolume = this.updateVolume.bind(this);
	}
	updateActive(value) {
		var channel = this.props.parentObj;
		channel.setState({ disabled: !value, disabledClass: !value ? 'disabled' : '' }, 
			function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			}
		);
	}
	updatePan(value) {
		var channel = this.props.parentObj;
		channel.setState({ pan: value, panDisplay: panFormat(value) }, function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
	}
	updateVolume(value) {
		var channel = this.props.parentObj;
		var amp = channel.state.amp;
		amp.volume = value;
		channel.setState({ amp: amp }, function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
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
				<div className="row no-gutters">
					<div className="col-2 order-2 order-sm-1 col-sm-4 col-lg-3 text-center">
						<PowerButton switchedOn={true} className="d-inline-block" callback={this.updateActive} />
						<PowerButton switchedOn={false} className="d-none d-md-inline-block gearIcon" callback={this.toggleSettings} />
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
			]} 
		/>
					</div>
					<div className="col-4 order-1 order-sm-2 col-sm-4 col-lg-4 pt-2">
							<input className="w-100" type="button" tabIndex="-1"  value={channel.state.trackName} />
					</div>
					<div className="col-2 order-4 order-sm-3 text-center">
						<Range label="Pan" inputClass="pan col-8 px-0 mx-auto" meterClass="hidden" callback={this.updatePan} min="-100" value={channel.state.pan} />
						<span className="pan-display">{channel.state.panDisplay}</span>
					</div>
					<div className="col-2 order-3 order-sm-4 col-md-2 text-center">
						<Range label="Vol" min="-36" max="12" step=".1" value={channel.state.amp.volume} orient="vertical" inputClass="volume px-0 mx-auto col-12 col-md-3 d-md-inline-block" meterClass="px-0 mx-auto col-12 col-md-9 d-block mt-2 mt-md-0 d-md-inline-block" callback={this.updateVolume} />
					</div>
				</div>
			</div>
		)
	}
}

export default ChannelControls;