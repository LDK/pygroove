import React, { Component } from 'react';
import PowerButton from './PowerButton.js';

class MultiModePowerButton extends PowerButton {
	callback(event) {
		event.preventDefault();
		var switchedOn = !this.props.switchedOn;
		if (this.props.callback) {
			this.props.callback(switchedOn);
		}
	}
	render() {
		var buttonClass = this.props.switchedOn ? 'switchedOn' : '';
		var divClass = "powerButton " + (this.props.className || '');
		var wrapperClass = "powerButton-wrapper d-inline-block " + (this.props.wrapperClass || '');
		wrapperClass = wrapperClass.trim();
		divClass = divClass.trim();
		if (this.state.labelButton) {
			divClass += " labelButton";
		}
		return (
			<div className={wrapperClass}>
				<label className={'powerButton-display ' + (this.props.inputClass || '') + ' ' + (this.props.displayClass || '')}>{!this.state.labelButton ? this.props.label : ''}</label>
				<div className={divClass}>
					<button className={buttonClass}
						value={this.props.switchedOn ? 1 : 0}
						onClick={this.callback}
						disabled={this.props.disabled}
						tabIndex="-1" 
					>{this.state.labelButton ? this.props.label : ''}</button>
				</div>
			</div>
		)
	}
}

export default MultiModePowerButton;
