import React, { Component } from 'react';
import Incrementer from '../Incrementer.js';
import OptionIndicator from '../OptionIndicator.js';
import FilterSection from './FilterSection.js';
import SampleSection from './SampleSection.js';
import ChannelPitchSection from './ChannelPitchSection.js';

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

function StepPicker(props) {
	return (
		<div className="stepPicker" onClick={props.onClick}>
			<span>
				{props.indicator}
			</span>
		</div>
	);
}

class ChannelOptions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.selectStep = this.selectStep.bind(this);
	}
	selectStep(i) {
		var channel = this.props.channel;
		var selectedStep = (channel.selectedStep != i) ? i : null;
		channel.setState({selectedStep: selectedStep});
	}
	renderStepPicker(i) {
		var channel = this.props.channel;
		var indicator = '';
		var loc = stepFormat(i);
		if (channel.state.selectedStep == i) { indicator = '*'; }
		return <StepPicker bar={loc.bar} beat={loc.beat} tick={loc.tick} indicator={indicator} onClick={() => this.selectStep(i)} key={i}/>;
	}
	stepRow(start,end) {
		var cells = [];
		for (var i = start; i <= end; i++) {
			cells.push(this.renderStepPicker(i));
		}
		return cells;
	}
	render() {
		var channel = this.props.channel;
		var props = this.props;
		return (
			<div className={props.containerClass}>
				<div className={"container-fluid px-0 channel-options " + channel.state.settingsClass + ' ' + channel.state.settingsMode}>
					<div className="row mx-auto">
						<SampleSection parentObj={channel} containerClass="col-4 text-center" />
						<FilterSection parentObj={channel} containerClass = "col-2 text-center"
							filterNumber={1} label="Filter 1"
							toggleCallback = {channel.toggleFilter}
							typeCallback = {channel.updateFilterType}
							freqCallback = {channel.updateFilterFrequency}
						/>
						<FilterSection parentObj={channel} containerClass = "col-2 text-center"
							filterNumber={2} label="Filter 2"
							toggleCallback = {channel.toggleFilter}
							typeCallback = {channel.updateFilterType}
							freqCallback = {channel.updateFilterFrequency}
						/>
						<ChannelPitchSection parentObj={channel} containerClass="col-2 text-center" />
						<div className="col-2">
							<OptionIndicator layout="vertical" value={channel.state.settingsMode} options={[
								{key: 'Chan', value: 'chan'},
								{key: 'Step', value: 'step'}
							]} name={"settingsMode-"+channel.state.trackName} label="Settings Mode" callback={channel.updateSettingsMode} />
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ChannelOptions;