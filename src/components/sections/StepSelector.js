import React, { Component } from 'react';
import Incrementer from '../Incrementer.js';

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

class StepSelector extends React.Component {
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
				<div className={"container-fluid px-0 step-editor"}>
					<div className="row mx-auto">
						<div className={"col-9 col-md-8 offset-3 offset-md-4 px-0 steps-row " + (channel.state.settingsOpen && channel.state.settingsMode == 'step' ? 'open' : '')}>
							{this.stepRow(1,channel.state.pattern.state.bars * 16)}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default StepSelector;