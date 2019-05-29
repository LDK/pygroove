import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import AudioOut from './components/AudioOut.js';
import Range from './components/Range.js';
import OptionIndicator from './components/OptionIndicator.js';
import MultiModeOptionIndicator from './components/MultiModeOptionIndicator.js';
import ContextMenu from './components/ContextMenu.js';
import PowerButton from './components/PowerButton.js';
import MultiModePowerButton from './components/MultiModePowerButton.js';
import FileSelector from './components/FileSelector.js';
import PitchSelector from './components/PitchSelector.js';
import Incrementer from './components/Incrementer.js';
import DropZone from './components/DropZone.js';
import Cell from './components/Cell.js';

function StepPicker(props) {
	return (
		<div className="stepPicker" onClick={props.onClick}>
			<span>
				{props.indicator}
			</span>
		</div>
	);
}

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

// This const is a modification of an excerpt of https://raw.githubusercontent.com/kevinsqi/react-piano/master/src/MidiNumbers.js
const PITCH_INDEXES = {
	C: 0,
	'C#': 1,
	D: 2,
	'D#': 3,
	E: 4,
	'E#': 5,
	F: 5,
	'F#': 6,
	G: 7,
	'G#': 8,
	A: 9,
	'A#': 10,
	B: 11,
	'B#': 12
};

function pitchValue(noteName) {
	noteName = noteName.trim();
	if (noteName.length == 3) {
		var pitchName = noteName.substring(0,2);
		var octave = parseInt(noteName.substring(2,3));
	}
	else if (noteName.length == 2) {
		var pitchName = noteName.substring(0,1);
		var octave = parseInt(noteName.substring(1,2));
	}
	var val = 12;
	val += octave * 12;
	val += PITCH_INDEXES[pitchName];
	return val;
}

function pitchDiff(fromNote,toNote) {
	return pitchValue(toNote) - pitchValue(fromNote);
}

class Channel extends React.Component {
	constructor(props) {
		super(props);
		var steps = Array(33).fill(null);
		delete steps[0];
		this.state = {
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
			pitch: 'C4',
			rootPitch: 'C4',
			transpose: 0,
			panDisplay: 'C',
			pan: 0,
			filter: {
				type: 'lp',
				frequency: 22000
			},
			filter2: {
				type: 'lp',
				frequency: 22000
			},
			filterOn: false,
			filter2On: false,
			filterType: 'lp',
			filter2Type: 'lp',
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
		this.toggleFilter2 = this.toggleFilter2.bind(this);
		this.updateFilter2Type = this.updateFilter2Type.bind(this);
		this.updateFilter2Frequency = this.updateFilter2Frequency.bind(this);
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
		updateFilterType(value) {
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[this.state.selectedStep]) {
					steps[this.state.selectedStep].filterType = value;
					this.setState({ steps: steps }, function () {
						this.props.updateTrack(this.state.trackName,this.state);
					});
				}
			}
			else {
				var fil = this.state.filter;
				fil.type = value;
				this.setState({ filter: fil }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		updateFilter2Type(value) {
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[this.state.selectedStep]) {
					steps[this.state.selectedStep].filter2Type = value;
					this.setState({ steps: steps }, function () {
						this.props.updateTrack(this.state.trackName,this.state);
					});
				}
			}
			else {
				var fil = this.state.filter2;
				fil.type = value;
				this.setState({ filter2: fil }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		updateFilterFrequency(value) {
			var fil = this.state.filter;
			fil.frequency = value;
			this.setState({ filter: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilter2Frequency(value) {
			var fil = this.state.filter2;
			fil.frequency = value;
			this.setState({ filter2: fil }, function () {
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
		toggleFilter(value) {
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[this.state.selectedStep] && typeof steps[this.state.selectedStep].filterOn != 'undefined') {
					steps[this.state.selectedStep].filterOn = !steps[this.state.selectedStep].filterOn;
				}
				else if (steps[this.state.selectedStep]) {
					steps[this.state.selectedStep].filterOn = !this.state.filterOn;
				}
				else {
					
				}
				this.setState({ steps: steps }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
			else {
				this.setState({ filterOn: !this.state.filterOn }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
		}
		toggleFilter2(value) {
			if (this.state.settingsMode == 'step') {
				const steps = this.state.steps.slice();
				if (steps[this.state.selectedStep] && typeof steps[this.state.selectedStep].filter2On != 'undefined') {
					steps[this.state.selectedStep].filter2On = !steps[this.state.selectedStep].filter2On;
				}
				else if (steps[this.state.selectedStep]) {
					steps[this.state.selectedStep].filter2On = !this.state.filter2On;
				}
				else {
					
				}
				this.setState({ steps: steps }, function () {
					this.props.updateTrack(this.state.trackName,this.state);
				});
			}
			else {
				this.setState({ filter2On: !this.state.filter2On }, function () {
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
					<div className={"container-fluid px-0 channel-options " + this.state.settingsClass + (this.state.filterOn ? ' filterOn' : '')}>
						<div className="row mx-auto">
							<div className="col-3">
								<div className={(this.state.settingsMode == 'step' ? 'd-none' : '')}>
									<label>Current Sample: {this.state.wavName || this.state.wav}</label>
									<DropZone parentObj={this} onFilesAdded={this.filesAdded} label="Upload Sample" />
								</div>
								<div className={(this.state.settingsMode != 'step' ? 'd-none' : '')}>
								<label>Pitch: </label> {this.state.steps[this.state.selectedStep] ? this.state.steps[this.state.selectedStep].pitch : 'N/A'}
									<PitchSelector parentObj={this} />
								</div>
							</div>
							<div className="col-1 text-center">
								<MultiModePowerButton 
									className="mx-auto" settingsMode={this.state.filterOn} 
									switchedOn={
										this.state.settingsMode == 'step' && this.state.steps[this.state.selectedStep]
										? ( 
											typeof this.state.steps[this.state.selectedStep].filterOn == 'undefined'
											? this.state.filterOn
											: this.state.steps[this.state.selectedStep].filterOn
										)
										: this.state.filterOn
									} 
									disabled={this.state.settingsMode == 'step' && !this.state.steps[this.state.selectedStep]}
									label="Filter 1"
									callback={this.toggleFilter}
								 />
								<MultiModePowerButton 
									wrapperClass="mt-3" className="mx-auto" settingsMode={this.state.settingsMode} 
									switchedOn={
										this.state.settingsMode == 'step' && this.state.steps[this.state.selectedStep]
										? ( 
											typeof this.state.steps[this.state.selectedStep].filter2On == 'undefined'
											? this.state.filter2On
											: this.state.steps[this.state.selectedStep].filter2On
										)
										: this.state.filter2On
									} 
									disabled={this.state.settingsMode == 'step' && !this.state.steps[this.state.selectedStep]}
									label="Filter 2"
									callback={this.toggleFilter2}
								 />
							</div>
							<div className="col-2">
								<MultiModeOptionIndicator 
									value={
										this.state.settingsMode == 'step' 
										? (
											!this.state.steps[this.state.selectedStep] || typeof this.state.steps[this.state.selectedStep].filterType == 'undefined'
											? this.state.filter.type
											: this.state.steps[this.state.selectedStep].filterType
										)
										: this.state.filter.type
									}
									disabled={!this.state.filterOn || (this.state.settingsMode == 'step' && !this.state.steps[this.state.selectedStep])}
									options={[
										{key: 'LP', value: 'lp'},
										{key: 'BP', value: 'bp'},
										{key: 'HP', value: 'hp'}
									]} 
									name={"filterType-"+this.state.trackName} label="Filter 1 Type" callback={this.updateFilterType} />
								<hr className="mb-4 mt-1" />
								<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilterFrequency} disabled={!this.state.filterOn} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter.frequency} />
							</div>
							<div className="col-2">
								<MultiModeOptionIndicator 
									value={
										this.state.settingsMode == 'step' 
										? (
											!this.state.steps[this.state.selectedStep] || typeof this.state.steps[this.state.selectedStep].filter2Type == 'undefined'
											? this.state.filter2.type
											: this.state.steps[this.state.selectedStep].filter2Type
										)
										: this.state.filter2.type
									}
									disabled={!this.state.filter2On || (this.state.settingsMode == 'step' && !this.state.steps[this.state.selectedStep])}
									options={[
										{key: 'LP', value: 'lp'},
										{key: 'BP', value: 'bp'},
										{key: 'HP', value: 'hp'}
									]} 
									name={"filter2Type-"+this.state.trackName} label="Filter2 1 Type" callback={this.updateFilter2Type} />
								<hr className="mb-4 mt-1" />
								<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilter2Frequency} disabled={!this.state.filter2On} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter2.frequency} />
							</div>
							<div className="col-2 text-center">
								<Incrementer label="Transpose" parentObj={this} settingsMode={this.state.settingsMode} callback={this.handleTranspose} inputClass="transpose col-8 px-0 mx-auto" disabled={this.state.settingsMode == 'step' && (!this.state.selectedStep || !this.state.steps[this.state.selectedStep])} min="-48" max="48"
									value={
										this.state.settingsMode == 'step' 
										? (this.state.selectedStep && this.state.steps[this.state.selectedStep]
											? this.state.steps[this.state.selectedStep].transpose 
											: "0")
										: (this.state.transpose || "0")
									} 
								/>
								<MultiModePowerButton 
									className="mt-2" settingsMode={this.state.settingsMode} 
									switchedOn={
										(
											this.state.settingsMode == 'step' 
										) 
										? 
											(
												this.state.steps[this.state.selectedStep]
												? this.state.steps[this.state.selectedStep].reverse
												: false
											)
										: this.state.reverse
									} 
									disabled={this.state.settingsMode == 'step' && !this.state.steps[this.state.selectedStep]}
									label={(this.state.reverse && this.state.settingsMode=='step' ? 'Cancel ': '') + 'Reverse'}
									labelButton={true} callback={this.toggleReverse}
								 />
								<PowerButton className={"mt-2" + (this.state.settingsMode=='step' ? ' d-none' : '')} switchedOn={this.state.trim} label="Trim" labelButton={true} callback={this.toggleTrim} />
							</div>
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

class Pattern extends React.Component {
	constructor(props) {
		super(props);
		this.patternOut = React.createRef();
		this.state = {
			bpm: 126,
			swing: .75,
			bars: 2,
			title: 'pyGroove Demo Beat',
			audioSource: 'fix that.mp3',
			tracks: {},
			clipboard: {}
		};
		this.grooveServer = 'http://localhost:8081/';
		this.updateBPM = this.updateBPM.bind(this);
		this.updateSwing = this.updateSwing.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.addToClipboard = this.addToClipboard.bind(this);
		this.renderChannel = this.renderChannel.bind(this);
	}
	updateTrack(trackName,track){
		var tracks = this.state.tracks;
		tracks[trackName] = track;
		this.setState({tracks: tracks});
	}
	addToClipboard(k,v) {
		var clip = this.state.clipboard;
		clip[k] = v;
		this.setState({ clipboard: clip });
	}
	renderChannel(trackName,wav) {
		return <Channel trackName={trackName} wav={wav+'.wav'} pattern={this} updateTrack={this.updateTrack} />;
	}
	updateBPM(event) {
		this.setState({bpm: event.target.value});
	}
	updateSwing(value) {
		this.setState({swing: value});
	}
	updateTitle(event) {
		this.setState({title: event.target.value});
	}
	handleSubmit(event) {
		event.preventDefault();
		for (var trackName in this.state.tracks) {
			this.updateTrack(trackName,this.state.tracks[trackName]);
		}
		const submitted = cloneDeep(this.state);
		delete submitted.__proto__;
		for (var trackName in submitted.tracks) {
			var track = submitted.tracks[trackName];
			delete track.pattern;
			track.notes = [];
			for (var step in track.steps) {
				if (track.steps[step]) {
					var note = { loc: stepFormat(step).loc };
					track.notes.push(note);
				}
			}
			delete track.steps;
			delete track.panDisplay;
			delete track.pitch;
			delete track.trackName;
		}
		submitted.author = 'Daniel Swinney';
		submitted.year = 2018;
		submitted.beatDiv = 4;
		submitted.tickDiv = 32;
		submitted.repeat = 4;
		var pattern = this;
		window.fetch(this.grooveServer, {
			method: 'POST', 
			body: JSON.stringify(submitted)
		})
		.then(function(data) {
			data.text().then(function(text) {
				pattern.setState({ renderedFile: text });
				pattern.setState({ audioSource: text })
				pattern.patternOut.current.refs.audio.src = '';
				pattern.patternOut.current.refs.audio.load();
				pattern.patternOut.current.refs.audio.src = pattern.state.audioSource;
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		return (
			<div className="container mx-auto rounded p-3 pattern-bg">
				<form onSubmit={this.handleSubmit} action="{this.grooveServer}">
					<div className="status row">
						<div className="col-10">
							<label>Title:</label><input type="text" value={this.state.title} onChange={this.updateTitle} tabIndex="-1" /><br />
							<label>BPM:</label><input type="text" value={this.state.bpm} onChange={this.updateBPM} tabIndex="-1" /><br />
						</div>
						<div className="col-2">
							Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={this.state.swing} />
						</div>
					</div>
					{this.renderChannel('Kick','808-Kick1')}
					{this.renderChannel('Closed Hat','808-CH1')}
					{this.renderChannel('Open Hat','808-OH1')}
					{this.renderChannel('Snare','808-Snare1')}
					<input type="submit" value="Save Pattern" tabIndex="-1" />
				</form>
				<AudioOut source={this.state.audioSource} />
			</div>
		);
	}
}

class Note extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				offset: 0,
				transpose: 0,
				pan: 0,
				volume: 0,
				bar: props.bar || null,
				beat: props.beat || null,
				tick: props.tick || null
			};
		}
}

class Song extends React.Component {
	render() {
		return (
			<div>
				<Pattern />
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Song />,
	document.getElementById('root')
);