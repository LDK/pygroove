import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import OptionIndicator from './widgets/OptionIndicator.js';
import Cell from './widgets/Cell.js';
import StepSelector from './sections/StepSelector.js';
import ChannelOptions from './sections/ChannelOptions.js';
import ChannelControls from './sections/ChannelControls.js'
import {stepFormat} from './Helpers.js';

class Channel extends React.Component {
	constructor(props) {
		super(props);
		var steps = Array(33).fill(null);
		delete steps[0];
		this.state = {
			filterList: ['filter','filter2'],
			position: props.position,
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
			pattern: props.song.state.activePattern,
			sample: {
				wav: props.wav,
				id: props.sampleId || null,
				image: props.sampleImage || null
			}
		};
		for (var listKey in this.state.filterList) {
			var filterKey = this.state.filterList[listKey];
			this.state[filterKey] = {
				on: false,
				type: 'lp',
				frequency: 22000
			}
		}
		var song = props.song;
		var pattern = song.state.activePattern;
		var tracks = song.state.tracks;
		tracks[this.state.trackName] = this.state;
		song.setState({tracks: tracks});
		this.fillCell = this.fillCell.bind(this);
		this.emptyCell = this.emptyCell.bind(this);
		this.clearCells = this.clearCells.bind(this);
		this.updateSettingsMode = this.updateSettingsMode.bind(this);
		this.updateChannelSequences = this.updateChannelSequences.bind(this);
		this.machine = this.props.machine || 'simple';
		if (props.initData) {
			for (var i in props.initData) {
				var item = props.initData[i];
				this.state[i] = item;
			}
		}
		}
		componentDidMount() {
			this.props.song.registerChannel(this.props.position,this);
		}
		updateSettingsMode(value) {
			this.setState({ settingsMode: value || 'chan' });
			if (value == 'step' && !this.state.selectedStep) {
				this.setState({ selectedStep: 1 });
			}
		}
		renderCell(i) {
			var indicator = '';
			var loc = stepFormat(i);
			if (this.state.steps[i]) { indicator = 'X'; }
			return <Cell channel={this} bar={loc.bar} beat={loc.beat} tick={loc.tick} value={this.state.steps[i] ? true : false} indicator={indicator} key={i} cellKey={i} />;
		}
		cellRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderCell(i));
			}
			return cells;
		}
		updateChannelSequences(steps) {
			var channel = this;
			var idx = channel.props.song.state.activePatternIndex;
			if (!idx || !channel.props.song.patterns[idx]) {
				return;
			}
			var seq = [];
			for (var i in steps) {
				if (steps[i] != null) {
					var step = cloneDeep(steps[i]);
					var stepInfo = stepFormat(i);
					if (step && stepInfo) {
						step.loc = stepInfo.loc;
					}
					delete step.bar;
					delete step.beat;
					delete step.tick;
					seq.push(step);
				}
			}
			channel.props.song.patterns[idx].chanSequences[channel.state.position] = JSON.stringify(seq);
		}
		fillCell(i,stepData) {
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
			if (typeof stepData != 'undefined') {
				for (var key in stepData) {
					var value = stepData[key];
					steps[i][key] = value;
				}
			} 
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			var idx = this.props.song.state.activePatternIndex;
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
		clearCells() {
			const steps = this.state.steps.slice();
			for (var i in steps) {
				this.emptyCell(i);
			}
			this.updateChannelSequences(steps);
		}
		render() {
			var props = this.props;
			var bars = 2;
			if (props.song.state.activePattern && props.song.state.activePattern.state) {
				bars = props.song.state.activePattern.state.bars;
			}
			return (
			<div className={this.state.disabledClass + " channel row no-gutters mb-3"}>
				<ChannelControls parentObj={this} containerClass="col-12 col-sm-3 col-md-4 text-left" />
				<div className="pattern-row col-12 col-sm-9 col-md-8">
					{this.cellRow(1,bars * 16)}
				</div>
				<StepSelector channel={this} containerClass="col-12 d-none d-md-block" />
				<ChannelOptions channel={this} containerClass="col-12 d-none d-md-block" />
			</div>
			);
		}
}
export default Channel;


