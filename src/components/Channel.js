import React, { Component } from 'react';
import PowerButton from './PowerButton.js';
import ContextMenu from './ContextMenu.js';

function stepFormat(step) {
	var bar = (Math.floor((step-1) / 16)) + 1;
	var beat = (Math.floor((step-1) / 4) % 4) + 1;
	var tick = (1 + (step-1) * 8) % 32;
	// return {bar: bar, beat: beat, tick: tick};
	return bar + "." + beat + "." + tick;
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
			reverse: props.reverse || false,
			trim: props.trim || false,
			pitch: {
				
			},
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
		this.toggleCell = this.toggleCell.bind(this);
		this.fillCell = this.fillCell.bind(this);
		this.emptyCell = this.emptyCell.bind(this);
		this.updatePan = this.updatePan.bind(this);
		this.updateSettingsMode = this.updateSettingsMode.bind(this);
		this.updateFilterType = this.updateFilterType.bind(this);
		this.updateFilterFrequency = this.updateFilterFrequency.bind(this);
		this.updateVolume = this.updateVolume.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
		this.updateActive = this.updateActive.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.toggleFilter = this.toggleFilter.bind(this);
		this.toggleReverse = this.toggleReverse.bind(this);
		this.toggleTrim = this.toggleTrim.bind(this);
		this.toggleFilter2 = this.toggleFilter2.bind(this);
		this.updateFilter2Type = this.updateFilter2Type.bind(this);
		this.updateFilter2Frequency = this.updateFilter2Frequency.bind(this);
		this.runChannelAction = this.runChannelAction.bind(this);
		}
		updatePan(value) {
			this.setState({ pan: value, panDisplay: panFormat(value) }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilterType(value) {
			var fil = this.state.filter;
			fil.type = value;
			this.setState({ filter: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilterFrequency(value) {
			var fil = this.state.filter;
			fil.frequency = value;
			this.setState({ filter: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilter2Type(value) {
			var fil = this.state.filter2;
			fil.type = value;
			this.setState({ filter2: fil }, function () {
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
		toggleSettings(value) {
			var opn = this.state.settingsOpen;
			opn = !opn;
			this.setState({ settingsOpen: opn, settingsClass: opn ? '' : ' d-none' });
		}
		updateSettingsMode(value) {
			this.setState({ settingsMode: value || 'chan' });
		}
		toggleFilter(value) {
			this.setState({ filterOn: !this.state.filterOn }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleFilter2(value) {
			this.setState({ filter2On: !this.state.filter2On }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleReverse(value) {
			this.setState({ reverse: !this.state.reverse }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
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
			return <Cell bar={loc.bar} beat={loc.beat} tick={loc.tick} value={this.state.steps[i]} indicator={indicator} onClick={() => this.toggleCell(i)} key={i}/>;
		}
		cellRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderCell(i));
			}
			return cells;
		}
		toggleCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = !steps[i];
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
			// this.setState({pattern: pattern});
		}
		fillCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = true;
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
		}
		emptyCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = false;
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
					<div className={"container-fluid px-0 channel-options " + this.state.settingsClass + (this.state.filterOn ? ' filterOn' : '')}>
						<div className="row mx-auto">
							<div className="col-3">
								<label>Current Sample: {this.state.wav}</label>
								<FileSelector name="test-file" />
							</div>
							<div className="col-1 text-center">
								<PowerButton switchedOn={this.state.filterOn} label="Filter 1"  callback={this.toggleFilter} className="mx-auto" />
								<PowerButton switchedOn={this.state.filter2On} label="Filter 2"  callback={this.toggleFilter2} wrapperClass="mt-3" className="mx-auto" />
							</div>
				<div className="col-2">
					<OptionIndicator value={this.state.filter.type} disabled={!this.state.filterOn} options={[
						{key: 'LP', value: 'lp'},
						{key: 'BP', value: 'bp'},
						{key: 'HP', value: 'hp'}
					]} name={"filterType-"+this.state.trackName} label="Filter 1 Type" callback={this.updateFilterType} />
					<hr className="mb-4 mt-1" />
					<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilterFrequency} disabled={!this.state.filterOn} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter.frequency} />
				</div>
				<div className="col-2">
					<OptionIndicator value={this.state.filter2.type} disabled={!this.state.filter2On} options={[
						{key: 'LP', value: 'lp'},
						{key: 'BP', value: 'bp'},
						{key: 'HP', value: 'hp'}
					]} name={"filter2Type-"+this.state.trackName} label="Filter 2 Type" callback={this.updateFilter2Type} />
					<hr className="mb-4 mt-1" />
					<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilter2Frequency} disabled={!this.state.filter2On} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter2.frequency} />
				</div>
							<div className="col-2 text-center">
								<Incrementer label="Transpose" callback={this.updatePitch} inputClass="transpose col-8 px-0 mx-auto" min="-48" max="48" value={this.state.transpose || "0"} />
								<PowerButton className="mt-2" switchedOn={this.state.reverse} label="Reverse" labelButton={true} callback={this.toggleReverse} />
								<PowerButton className="mt-2" switchedOn={this.state.trim} label="Trim" labelButton={true} callback={this.toggleTrim} />
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

export default Channel;
