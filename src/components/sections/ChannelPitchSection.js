import React, { Component } from 'react';
import Incrementer from '../Incrementer.js';

class ChannelPitchSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleTranspose = this.handleTranspose.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
	}
	updatePitch(value) {
		var channel = this.props.parentObj;
		channel.setState({ transpose: value }, function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
	}
	handleTranspose(value) {
		var channel = this.props.parentObj;
		if (channel.state.settingsMode == 'step') {
			// Set step transpose
			const steps = channel.state.steps.slice();
			steps[channel.state.selectedStep].transpose = value;
			channel.setState({ steps: steps }, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
		else {
			// Update channel transpose value
			this.updatePitch(value);
		}
	}
	render() {
		var parentObj = this.props.parentObj;
		var props = this.props;
		return (
			<div className={props.containerClass}>
				<Incrementer label="Transpose" parentObj={parentObj} settingsMode={parentObj.state.settingsMode} callback={this.handleTranspose} inputClass="transpose col-8 px-0 mx-auto" disabled={parentObj.state.settingsMode == 'step' && (!parentObj.state.selectedStep || !parentObj.state.steps[parentObj.state.selectedStep])} min="-48" max="48"
					value={
						parentObj.state.settingsMode == 'step' 
						? (parentObj.state.selectedStep && parentObj.state.steps[parentObj.state.selectedStep]
							? parentObj.state.steps[parentObj.state.selectedStep].transpose 
							: "0")
						: (parentObj.state.transpose || "0")
					} 
				/>
				<hr className="my-1" />
				<Incrementer label="Root Note" parentObj={parentObj} settingsMode={parentObj.state.settingsMode} callback={this.handleTranspose} inputClass="transpose col-8 px-0 mx-auto" disabled={parentObj.state.settingsMode == 'step' && (!parentObj.state.selectedStep || !parentObj.state.steps[parentObj.state.selectedStep])} min="-48" max="48"
					value={
						parentObj.state.settingsMode == 'step' 
						? (parentObj.state.selectedStep && parentObj.state.steps[parentObj.state.selectedStep]
							? parentObj.state.steps[parentObj.state.selectedStep].transpose 
							: "0")
						: (parentObj.state.transpose || "0")
					} 
				/>
			</div>

		)
	}
}

export default ChannelPitchSection;
