import React, { Component } from 'react';
import MultiModeOptionIndicator from '../MultiModeOptionIndicator.js';
import MultiModePowerButton from '../MultiModePowerButton.js';
import Range from '../Range.js';

class FilterSection extends React.Component {
	constructor(props) {
		super(props);
		var filterNumber = this.props.filterNumber || 1;
		var filterKey = 'filter' + (filterNumber > 1 ? filterNumber : '');
		this.state = {
			filterKey: filterKey,
			filterNumber: filterNumber
		};
		this.togglePower = this.togglePower.bind(this);
	}
	togglePower() {
		this.props.toggleCallback(this.state.filterKey);
		this.render();
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
					callback={this.togglePower}
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
					callback={props.typeCallback}
					params={params}
				/>
				<hr className="mb-4 mt-1" />
				<Range 
					label="Cutoff Freq" 
					className="mt-4 text-center"
					callback={props.freqCallback}
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
