import React, { Component } from 'react';

class PowerButton extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			switchedOn: props.switchedOn || false,
			label: props.label || '',
			labelButton: props.labelButton || false
		};
		this.state.inputClass = this.state.switchedOn ? 'switchedOn' : '';
	}
	callback(event) {
		event.preventDefault();
		var switchedOn = !this.state.switchedOn;
		this.setState({ switchedOn: switchedOn });
		if (this.props.callback) {
			this.props.callback(switchedOn);
		}
	}
	render() {
		var buttonClass = this.state.switchedOn ? 'switchedOn' : '';
		var divClass = "powerButton " + (this.props.className || '');
		var wrapperClass = "powerButton-wrapper d-inline-block " + (this.props.wrapperClass || '');
		wrapperClass = wrapperClass.trim();
		divClass = divClass.trim();
		if (this.state.labelButton) {
			divClass += " labelButton";
		}
		return (
			<div className={wrapperClass}>
				<label className={'powerButton-display ' + (this.props.inputClass || '') + ' ' + (this.props.displayClass || '')}>{!this.state.labelButton ? this.state.label : ''}</label>
				<div className={divClass}>
					<button className={buttonClass}
						value={this.state.switchedOn ? 1 : 0}
						onClick={this.callback}
						disabled={this.props.disabled}
						tabIndex="-1"
					>{this.state.labelButton ? this.state.label : ''}</button>
				</div>
			</div>
		)
	}
}

export default PowerButton;
