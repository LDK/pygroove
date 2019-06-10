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
		var pattern = props.pattern;
		var song = pattern.props.parentObj;
		var tracks = song.state.tracks;
		tracks[this.state.trackName] = this.state;
		song.setState({tracks: tracks});
		this.fillCell = this.fillCell.bind(this);
		this.emptyCell = this.emptyCell.bind(this);
		this.updateSettingsMode = this.updateSettingsMode.bind(this);
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
		render() {
			return (
			<div className={this.state.disabledClass + " channel row no-gutters mb-3"}>
				<ChannelControls parentObj={this} containerClass="col-12 col-sm-3 col-md-4 text-left" />
				<div className="pattern-row col-12 col-sm-9 col-md-8">
					{this.cellRow(1,this.state.pattern.state.bars * 16)}
				</div>
				<StepSelector channel={this} containerClass="col-12 d-none d-md-block" />
				<ChannelOptions channel={this} containerClass="col-12 d-none d-md-block" />
			</div>
			);
		}
}
export default Channel;
