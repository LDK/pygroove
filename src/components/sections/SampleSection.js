import React, { Component } from 'react';
import PowerButton from '../widgets/PowerButton.js';
import DropZone from '../widgets/DropZone.js';
import PitchSelector from '../widgets/PitchSelector.js';
import MultiModePitchSelector from '../widgets/MultiModePitchSelector.js';
import MultiModePowerButton from '../widgets/MultiModePowerButton.js';

class SampleSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.toggleNormalize = this.toggleNormalize.bind(this);
		this.toggleTrim = this.toggleTrim.bind(this);
		this.toggleReverse = this.toggleReverse.bind(this);
		this.filesAdded = this.filesAdded.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
	}
	sendRequest(file) {
		var channel = this.props.parentObj;
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("file", file);
			formData.append("filename", file.name);
			req.open("POST", channel.props.pattern.props.song.grooveServer + "upload");
			req.send(formData);
			var chan = this.props.parentObj;
			req.onload = function(e) {
				if (this.status == 200) {
					var wavImg = false;
					if (this.responseText) {
						var res = JSON.parse(this.responseText);
						if (res.img) {
							wavImg = res.img;
						}
					}
					chan.setState({ wav: 'uploaded/' + file.name, wavName: file.name, wavImg: wavImg });
					chan.props.updateTrack(chan.state.trackName,chan.state);
				}
			}
		});
	}
	filesAdded(files) {
		for (var n = 0; n < files.length; n++) {
			this.sendRequest(files[n]);
		}
	}
	toggleTrim(value) {
		var channel = this.props.parentObj;
		channel.setState({ trim: !channel.state.trim }, function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
	}
	toggleNormalize(value) {
		var channel = this.props.parentObj;
		channel.setState({ normalize: !channel.state.normalize }, function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
	}
	updatePitch(value) {
		var channel = this.props.parentObj;
		if (channel.state.settingsMode == 'step') {
			const steps = channel.state.steps.slice();
			steps[channel.state.selectedStep].pitch = value;
			channel.setState({ steps: steps }, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
	}
	toggleReverse(value) {
		var channel = this.props.parentObj;
		if (channel.state.settingsMode == 'step') {
			const steps = channel.state.steps.slice();
			steps[channel.state.selectedStep].reverse = !steps[channel.state.selectedStep].reverse;
			channel.setState({ steps: steps }, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
		else {
			channel.setState({ reverse: !channel.state.reverse }, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
	}
	render() {
		var parentObj = this.props.parentObj;
		var props = this.props;
		return (
			<div className={props.containerClass}>
				<div className={(parentObj.state.settingsMode == 'step' ? 'd-none' : '')}>
					<label>Current Sample: {parentObj.state.wavName || parentObj.state.wav}</label>
					<DropZone parentObj={parentObj} onFilesAdded={this.filesAdded} label="Upload Sample" />
				</div>
				<div className={(parentObj.state.settingsMode != 'step' ? 'd-none' : '')}>
					<label>Pitch: </label> {parentObj.state.steps[parentObj.state.selectedStep] ? parentObj.state.steps[parentObj.state.selectedStep].pitch : 'N/A'}
					<MultiModePitchSelector 
						parentObj={parentObj}
						value={parentObj.state.steps[parentObj.state.selectedStep]}
						callback={this.updatePitch}
						className=""
					/>
				</div>
				<div className="buttons-row text-center">
					<MultiModePowerButton 
						className="mt-2 mr-2"
						settingsMode={parentObj.state.settingsMode} 
						switchedOn={
							(
								parentObj.state.settingsMode == 'step' 
							) 
							? 
								(
									parentObj.state.steps[parentObj.state.selectedStep]
									? parentObj.state.steps[parentObj.state.selectedStep].reverse
									: false
								)
							: parentObj.state.reverse
						} 
						disabled={parentObj.state.settingsMode == 'step' && !parentObj.state.steps[parentObj.state.selectedStep]}
						label={(parentObj.state.reverse && parentObj.state.settingsMode=='step' ? 'Cancel ': '') + 'Rev.'}
						labelButton={true} callback={this.toggleReverse}
					 />
					<PowerButton
						className={"mt-2 mr-2" + (parentObj.state.settingsMode=='step' ? ' d-none' : '')}
						switchedOn={parentObj.state.trim}
						label="Trim"
						labelButton={true}
						callback={this.toggleTrim} 
					/>
					<PowerButton
						className={"mt-2" + (parentObj.state.settingsMode=='step' ? ' d-none' : '')}
						switchedOn={parentObj.state.normalize}
						label="Normalize"
						labelButton={true}
						callback={this.toggleNormalize} 
					/>
				</div>
			</div>
		)
	}
}

export default SampleSection;
