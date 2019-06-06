import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';

class Range extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || 0,
			displayValue: props.displayValue || null
		};
	}
	
	callback(event) {
		this.setState({ value: event.target.value });
		this.props.callback(event.target.value);
	}
	
	render() {
		const { range } = this.props;
		return (
			<div className={"meter " + (this.props.className || '')}>
				<input className={this.props.inputClass || ''} type="range"
					value={this.props.value || 0}
					orient={this.props.orient || 'horizontal'}
					min={this.props.min || 0}
					max={this.props.max || 100}
					step={this.props.step || 1}
					onChange={this.callback}
					tabIndex="-1" >
				</input>
				<span className={'meter-display ' + (this.props.inputClass || '') + ' ' + (this.props.meterClass || '')}>{this.state.value}</span>
			</div>
		)
	}
}
// ========================================

export default Range;
