import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import OptionIndicator from './OptionIndicator.js';
import ContextMenu from './ContextMenu.js';
import PowerButton from './PowerButton.js';
import Cell from './Cell.js';
import FilterSection from './sections/FilterSection.js';
import SampleSection from './sections/SampleSection.js';
import ChannelPitchSection from './sections/ChannelPitchSection.js';
import Range from './Range.js';

function stepFormat(step) {
	var bar = (Math.floor((step-1) / 16)) + 1;
	var beat = (Math.floor((step-1) / 4) % 4) + 1;
	var tick = (1 + (step-1) * 8) % 32;
	return {
		bar: bar, 
		beat: beat, 
		tick: tick,
		loc: bar + "." + beat + "." + tick
	};
}

function panFormat(value) {
	var num = Math.abs(value);
	var dir = 'C';
	if (value == 0) {
		return dir;
	}
	else if (value > 0) {
		dir = 'R';
	}
	else {
		dir = 'L';
	}
	return num + dir;
}


function StepPicker(props) {
	return (
		<div className="stepPicker" onClick={props.onClick}>
			<span>
				{props.indicator}
			</span>
		</div>
	);
}


class Channel extends React.Component {
	constructor(props) {
		super(props);
		var steps = Array(33).fill(null);
		delete steps[0];
		this.state = {
			filterList: ['filter','filter2'],
			disabled: props.disabled || false,
			disabledClass: props.disabled ? 'disabled' : '',
			settingsOpen: props.settingsOpen || false,
			settingsClass: props.settingsOpen ? '' : ' d-none',
			settingsMode: props.settingsMode || 'chan',
			trackName: props.trackName || 'New Channel',
			steps: steps,
			selectedStep: null,
			reverse: props.reverse || false,
			trim: props.trim || false,
			normalize: props.normalize || false,
			pitch: 'C4',
			rootPitch: 'C4',
			transpose: 0,
			panDisplay: 'C',
			pan: 0,
			amp: {
				volume: 0,
				attack: 0,
				peak: 0,
				decay: 0,
				sustain: 0,
				release: 0
			},
			pattern: props.pattern,
			wav: props.wav
		};
		for (var listKey in this.state.filterList) {
			var filterKey = this.state.filterList[listKey];
			this.state[filterKey] = {
				on: false,
				type: 'lp',
				frequency: 22000
			}
		}
		this.state.actions = {
			fill: function(chan) {
				for (var i=1;i<chan.state.steps.length;i++) {
					chan.fillCell(i);
				}
			},
			fill2: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+2) {
					chan.fillCell(i);
				}
			},
			fill4: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+4) {
					chan.fillCell(i);
				}
			},
			fill8: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+8) {
					chan.fillCell(i);
				}
			},
			clear: function(chan) {
				for (var i=1;i<chan.state.steps.length;i++) {
					chan.emptyCell(i);
				}
			},
			copy: function(chan) {
				chan.state.pattern.addToClipboard('steps',chan.state.steps);
			},
			cut: function(chan) {
				chan.state.pattern.addToClipboard('steps',chan.state.steps);
				this.clear(chan);
			},
			paste: function(chan) {
				if (chan.state.pattern.state.clipboard.steps) {
					chan.setState({ steps: chan.state.pattern.state.clipboard.steps });
				}
			}
		}
		var pattern = props.pattern;
		var tracks = pattern.state.tracks;
		tracks[this.state.trackName] = this.state;
		pattern.setState({tracks: tracks});
		this.fillCell = this.fillCell.bind(this);
		this.emptyCell = this.emptyCell.bind(this);
		this.updatePan = this.updatePan.bind(this);
		this.updateSettingsMode = this.updateSettingsMode.bind(this);
		this.updateFilterType = this.updateFilterType.bind(this);
		this.updateFilterFrequency = this.updateFilterFrequency.bind(this);
		this.updateVolume = this.updateVolume.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
		this.handleTranspose = this.handleTranspose.bind(this);
		this.updateActive = this.updateActive.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.selectStep = this.selectStep.bind(this);
		this.toggleFilter = this.toggleFilter.bind(this);
		this.toggleReverse = this.toggleReverse.bind(this);
		this.toggleTrim = this.toggleTrim.bind(this);
		this.toggleNormalize = this.toggleNormalize.bind(this);
		this.runChannelAction = this.runChannelAction.bind(this);
		this.filesAdded = this.filesAdded.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		}
		sendRequest(file) {
			return new Promise((resolve, reject) => {
				const req = new XMLHttpRequest();
   
				const formData = new FormData();
				formData.append("file", file);
				formData.append("filename", file.name);
				req.open("POST", this.props.pattern.grooveServer + "upload");
				req.send(formData);
				var chan = this;
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
		updatePan(value) {
			this.setState({ pan: value, panDisplay: panFormat(value) }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilterType(event,params) {
			if (!event || !event.currentTarget || !event.currentTarget.value) {
				return;
			}
			var value = event.currentTarget.value;
			var filterKey = 'filter';
			if (params && params.filterKey) {
				filterKey = params.filterKey;
			}
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[this.state.selectedStep]) {
					steps[this.state.selectedStep][filterKey].type = value;
					this.setState({ steps: steps }, function () {
						this.props.updateTrack(this.state.trackName,this.state);
					});
				}
			}
			else {
				var fil = this.state[filterKey];
				fil.type = value;
				var stateChange = {};
				stateChange[filterKey] = fil;
				this.setState(stateChange , function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		updateFilterFrequency(value,params) {
			if (!params || !params.filterKey) {
				return;
			}
			var fil = this.state[params.filterKey];
			fil.frequency = value;
			var stateChange = {};
			stateChange[params.filterKey] = fil;
			this.setState(stateChange , function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateActive(value) {
			this.setState({ disabled: !value, disabledClass: !value ? 'disabled' : '' }, 
				function () {
					this.props.updateTrack(this.state.trackName,this.state);
				}
			);
		}
		updateVolume(value) {
			var amp = this.state.amp;
			amp.volume = value;
			this.setState({ amp: amp }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updatePitch(value) {
			this.setState({ transpose: value }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		handleTranspose(value) {
			if (this.state.settingsMode == 'step') {
				// Set step transpose
				const steps = this.state.steps.slice();
				steps[this.state.selectedStep].transpose = value;
				this.setState({ steps: steps }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
			else {
				// Update channel transpose value
				this.updatePitch(value);
			}
		}
		toggleSettings(value) {
			var opn = this.state.settingsOpen;
			opn = !opn;
			this.setState({ settingsOpen: opn, settingsClass: opn ? '' : ' d-none' });
		}
		updateSettingsMode(value) {
			this.setState({ settingsMode: value || 'chan' });
			if (value == 'step' && !this.state.selectedStep) {
				this.setState({ selectedStep: 1 });
			}
		}
		toggleFilter(filterKey) {
			var filter = this.state[filterKey];
			var selStep = this.state.selectedStep;
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[selStep] && steps[selStep][filterKey] && typeof steps[selStep][filterKey] != 'undefined') {
					steps[selStep][filterKey].on = !steps[selStep][filterKey].on;
				}
				else if (steps[selStep]) {
					steps[selStep][filterKey].on = !this.state[filterKey].on;
				}
				else {
					
				}
				this.setState({ steps: steps }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
			else {
				filter.on = !filter.on;
				var stateChange = {};
				stateChange[filterKey] = filter;
				this.setState(stateChange, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		toggleReverse(value) {
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				steps[this.state.selectedStep].reverse = !steps[this.state.selectedStep].reverse;
				this.setState({ steps: steps }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
			else {
				this.setState({ reverse: !this.state.reverse }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		toggleTrim(value) {
			this.setState({ trim: !this.state.trim }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleNormalize(value) {
			this.setState({ normalize: !this.state.normalize }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		renderCell(i) {
			var indicator = '';
			var loc = stepFormat(i);
			if (this.state.steps[i]) { indicator = 'X'; }
			return <Cell channel={this} bar={loc.bar} beat={loc.beat} tick={loc.tick} value={this.state.steps[i] ? true : false} indicator={indicator} key={i} cellKey={i} />;
		}
		renderStepPicker(i) {
			var indicator = '';
			var loc = stepFormat(i);
			if (this.state.selectedStep == i) { indicator = '*'; }
			return <StepPicker bar={loc.bar} beat={loc.beat} tick={loc.tick} indicator={indicator} onClick={() => this.selectStep(i)} key={i}/>;
		}
		cellRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderCell(i));
			}
			return cells;
		}
		stepRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderStepPicker(i));
			}
			return cells;
		}
		selectStep(i) {
			var selectedStep = (this.selectedStep != i) ? i : null;
			this.setState({selectedStep: selectedStep});
		}
		fillCell(i) {
			const steps = this.state.steps.slice();
			if (!steps[i]) {
				steps[i] = {};
				steps[i].pitch = this.rootPitch;
				for (var listKey in this.state.filterList) {
					var filterKey = this.state.filterList[listKey];
					steps[i][filterKey] = {}
				}
			}
			steps[i].on = true;
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
		}
		emptyCell(i) {
			const steps = this.state.steps.slice();
			if (steps[i]) {
				steps[i] = false;
			}
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
		}
		runChannelAction(event) {
			if (event.currentTarget.value) {
				this.state.actions[event.currentTarget.value](this);
			}
		}
		render() {
			return (
			<div className={this.state.disabledClass + " channel row no-gutters mb-3"}>
				<div className="col-1 d-none d-md-block text-left">
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
				<input className="col-12 col-sm-1" type="button" tabIndex="-1"  value={this.state.trackName} />
				<div className="col-1 d-none d-md-block text-center">
					<Range label="Pan" inputClass="pan col-8 px-0 mx-auto" meterClass="hidden" callback={this.updatePan} min="-100" value={this.state.pan} />
					<span className="pan-display">{this.state.panDisplay}</span>
				</div>
				<div className="col-1 d-none d-sm-block text-center">
					<Range label="Vol" min="-36" max="12" step=".1" value={this.state.amp.volume} orient="vertical" inputClass="volume px-0 mx-auto col-12 col-md-3 d-md-inline-block" meterClass="px-0 mx-auto col-12 col-md-9 d-block mt-2 mt-md-0 d-md-inline-block" callback={this.updateVolume} />
				</div>
				<div className="pattern-row col-12 col-sm-9 col-md-8">
					{this.cellRow(1,this.state.pattern.state.bars * 16)}
				</div>
				<div className="col-1 d-none d-md-block text-center">
				</div>
				<div className="col-12 d-none d-md-block">
					<div className={"container-fluid px-0 step-editor"}>
						<div className="row mx-auto">
							<div className={"col-9 col-md-8 offset-3 offset-md-4 px-0 steps-row " + (this.state.settingsOpen && this.state.settingsMode == 'step' ? 'open' : '')}>
								{this.stepRow(1,this.state.pattern.state.bars * 16)}
							</div>
						</div>
					</div>
				</div>
				<div className="col-12 d-none d-md-block">
					<div className={"container-fluid px-0 channel-options " + this.state.settingsClass + ' ' + this.state.settingsMode}>
						<div className="row mx-auto">
							<SampleSection parentObj={this} containerClass="col-4 text-center" />
							<FilterSection parentObj={this} containerClass = "col-2 text-center"
								filterNumber={1} label="Filter 1"
								toggleCallback = {this.toggleFilter}
								typeCallback = {this.updateFilterType}
								freqCallback = {this.updateFilterFrequency}
							/>
							<FilterSection parentObj={this} containerClass = "col-2 text-center"
								filterNumber={2} label="Filter 2"
								toggleCallback = {this.toggleFilter}
								typeCallback = {this.updateFilterType}
								freqCallback = {this.updateFilterFrequency}
							/>
							<ChannelPitchSection parentObj={this} containerClass="col-2 text-center" />
							<div className="col-2">
								<OptionIndicator layout="vertical" value={this.state.settingsMode} options={[
									{key: 'Chan', value: 'chan'},
									{key: 'Step', value: 'step'}
								]} name={"settingsMode-"+this.state.trackName} label="Settings Mode" callback={this.updateSettingsMode} />
							</div>
						</div>
					</div>
				</div>
			</div>
			);
		}
}
export default Channel;
