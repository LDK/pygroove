import React, { Component } from 'react';
import MultiModeOptionIndicator from '../widgets/MultiModeOptionIndicator.js';
import MultiModePowerButton from '../widgets/MultiModePowerButton.js';
import Range from '../widgets/Range.js';

class FilterSection extends React.Component {
	constructor(props) {
		super(props);
		var filterNumber = this.props.filterNumber || 1;
		var filterKey = 'filter' + (filterNumber > 1 ? filterNumber : '');
		this.state = {
			filterKey: filterKey,
			filterNumber: filterNumber
		};
		this.toggleFilter = this.toggleFilter.bind(this);
		this.updateFilterType = this.updateFilterType.bind(this);
		this.updateFilterFrequency = this.updateFilterFrequency.bind(this);
	}
	updateFilterFrequency(value) {
		if (!value) {
			return;
		}
		var filterKey = this.state.filterKey;
		var channel = this.props.parentObj;
		var fil = channel.state[filterKey];
		fil.frequency = value;
		var stateChange = {};
		stateChange[filterKey] = fil;
		channel.setState(stateChange , function () {
			channel.props.updateTrack(channel.state.trackName,channel.state);
		});
	}
	updateFilterType(event) {
		if (!event || !event.currentTarget || !event.currentTarget.value) {
			return;
		}
		var value = event.currentTarget.value;
		var filterKey = this.state.filterKey;
		var channel = this.props.parentObj;
		if (channel.state.settingsMode == 'step') {
			const steps = channel.state.steps.slice();
			if (steps[channel.state.selectedStep]) {
				steps[channel.state.selectedStep][filterKey].type = value;
				channel.setState({ steps: steps }, function () {
					channel.props.updateTrack(channel.state.trackName,channel.state);
				});
			}
		}
		else {
			var fil = channel.state[filterKey];
			fil.type = value;
			var stateChange = {};
			stateChange[filterKey] = fil;
			channel.setState(stateChange , function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
	}
	toggleFilter() {
		var filterKey = this.state.filterKey;
		var channel = this.props.parentObj;
		var filter = channel.state[filterKey];
		var selStep = channel.state.selectedStep;
		if (channel.state.settingsMode == 'step') {
			const steps = channel.state.steps.slice();
			if (steps[selStep] && steps[selStep][filterKey] && typeof steps[selStep][filterKey] != 'undefined') {
				steps[selStep][filterKey].on = !steps[selStep][filterKey].on;
			}
			else if (steps[selStep]) {
				steps[selStep][filterKey].on = !channel.state[filterKey].on;
			}
			else {
				
			}
			channel.setState({ steps: steps }, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
		else {
			filter.on = !filter.on;
			var stateChange = {};
			stateChange[filterKey] = filter;
			channel.setState(stateChange, function () {
				channel.props.updateTrack(channel.state.trackName,channel.state);
			});
		}
	}
	render() {
		var parentObj = this.props.parentObj;
		var filterNumber = this.state.filterNumber;
		var filterKey = this.state.filterKey;
		var props = this.props;
		var label = props.label || 'Filter ' + filterNumber;
		var params = {filterKey: filterKey};
		var steps = parentObj.state.steps;
		var selStep = parentObj.state.selectedStep;
		var typeValue = 
			(parentObj.state.settingsMode == 'step' 
			? (
				!steps[selStep] || !steps[selStep][filterKey] || typeof steps[selStep][filterKey].type == 'undefined'
				? parentObj.state[filterKey].type
				: steps[selStep][filterKey].type
			)
			: parentObj.state[filterKey].type);
		return (
			<div className={props.containerClass}>
			{parentObj.state[filterKey].on}
				<MultiModePowerButton 
					className="mx-auto" settingsMode={parentObj.state.settingsMode} 
					switchedOn={
						parentObj.state.settingsMode == 'step' && steps[selStep]
						? ( 
							typeof steps[selStep][filterKey].on == 'undefined'
							? (parentObj.state[filterKey].on || false)
							: steps[selStep][filterKey].on
						)
						: parentObj.state[filterKey].on
					} 
					disabled={parentObj.state.settingsMode == 'step' && !steps[selStep]}
					label={label}
					callback={this.toggleFilter}
				 />
				<hr className="mb-2 mt-1" />
				<MultiModeOptionIndicator 
					value={typeValue}
					disabled={!parentObj.state[filterKey].on || (parentObj.state.settingsMode == 'step' && !parentObj.state.steps[parentObj.state.selectedStep])}
					inputName={filterKey+'-type-'+parentObj.state.trackName}
					options={[
						{key: 'LP', value: 'lp'},
						{key: 'BP', value: 'bp'},
						{key: 'HP', value: 'hp'}
					]} 
					label={label + " Type"} 
					callback={this.updateFilterType}
					params={params}
				/>
				<hr className="mb-4 mt-1" />
				<Range 
					label="Cutoff Freq" 
					className="mt-4 text-center"
					callback={this.updateFilterFrequency}
					params={params}
					disabled={!parentObj.state[filterKey].on}
					inputClass="freq col-8 px-0 mx-auto"
					min="30"
					max="22000"
					inputName={filterKey+'-freq-'+parentObj.state.trackName}
					value={parentObj.state[filterKey].frequency} 
				/>
			</div>
		)
	}
}

export default FilterSection;
