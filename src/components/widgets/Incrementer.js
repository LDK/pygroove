import React, { Component } from 'react';

class Incrementer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || '',
			label: props.label || '',
			min: props.min || false,
			max: props.max || false,
			typeMode: props.typeMode || false
		};
		this.increment = this.increment.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.typeModeOn = this.typeModeOn.bind(this);
		this.typeModeOff = this.typeModeOff.bind(this);
		this.keyPress = this.keyPress.bind(this);
	}
	increment(val) {
		var newVal = parseInt(this.props.value) || 0;
		if (this.props.disabled) {
			return this.render();
		}
		newVal += val;
		newVal = this.sanitizeValue(newVal);
		this.setState({value: this.props.value, typeMode: false},function(){
			if (this.props.callback) {
				this.props.callback(newVal);
			}
			this.render();
		});
	}
	focusOn() {
		this.textInput.focus();
	}
	typeModeOn(event) {
		this.setState({ typeMode: true });
		this.render();
		this.focusOn();
	}
	typeModeOff(event) {
		var val = parseInt(event.target.value);
		if (val) {
			this.setState({value:val});
		}
		this.setState({ typeMode: false });
		if (this.props.callback) {
			this.props.callback(val);
		}
		this.render();
	}
	handleChange(event) {
		var val = this.sanitizeValue(event.target.value);
		this.setState({ value: val });
		if (this.props.callback) {
			this.props.callback(val);
		}
	}
	sanitizeValue(value) {
		var finalValue = value || 0;
		if (this.state.min !== false) {
			finalValue = Math.max(finalValue, this.state.min);
		}
		if (this.state.max !== false) {
			finalValue = Math.min(finalValue, this.state.max);
		}
		if (isNaN(finalValue)) {
			finalValue = 0;
		}
		return finalValue;
	}
	handleBlur(event) {
		var finalValue = this.sanitizeValue(event.target.value);
		this.setState({ value: finalValue, typeMode: false });
		if (this.props.callback) {
			this.props.callback(finalValue);
		}
	}
	keyPress(e){
		if(e.keyCode == 13 || e.keyCode == 10){
			e.preventDefault();
			var value = this.sanitizeValue(e.target.value);
			this.setState({ value: value, typeMode: false });
			if (this.props.callback) {
				this.props.callback(value);
			}
		}
	}
	render() {
		return (
			<div className={"incrementer text-center" + ' ' + (this.props.className || '') }>
				<label className="d-block">{this.state.label}</label>
				<span className={(this.props.disabled ? ' disabled' : '')} onClick={() => this.increment(1)} >^</span>
				<span className={(this.props.disabled ? ' disabled' : '')} onClick={() => this.increment(12)} >^^</span>
				<div onClick={this.typeModeOn}>
					<input type="text" onKeyDown={this.keyPress} tabIndex="-1" value={this.props.value} name={this.props.name} 
						ref={elem => (this.textInput = elem)} 
						className={"mx-auto text-center w-50 d-block " + (this.props.disabled || !this.state.typeMode ? ' disabled' : '')}
						disabled={this.props.disabled || !this.state.typeMode}
						onBlur={this.handleBlur}
						onChange={this.handleChange} 
					/>
				</div>
				<span className={(this.props.disabled ? ' disabled' : '')} onClick={() => this.increment(-1)}>v</span>
				<span className={(this.props.disabled ? ' disabled' : '')} onClick={() => this.increment(-12)} >vv</span>
			</div>
		)
	}
}

export default Incrementer;
