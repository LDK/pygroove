import React, { Component } from 'react';
import OptionIndicator from './OptionIndicator.js'

class MultiModeOptionIndicator extends OptionIndicator {
	render() {
		var props = this.props;
		var state = this.state;
		var cb = this.props.callback;
		var layout = state.layout;
		var params = this.props.params || {};
		const radios = this.props.options.map((opt,i) => 
			<li className={"px-0 mx-2 pt-3 "} key={i}>
				<label>
					<input type="radio" checked={(opt.value == this.props.value)} 
						name={props.inputName}
						tabIndex="-1" value={opt.value} disabled={props.disabled} 
						onClick={
							(e) => {
								cb(e, params)
							}
						} 
					/>
					<span className="checkmark"></span>
				</label>
			</li>
		);
		var listClass = "text-center px-0 mb-0 " + layout;
		var wrapperClass = "optionIndicator text-center" +  (props.disabled ? ' disabled ' : ' ') + (this.props.className || '');
		return (
			<div className={wrapperClass}>
				<label>{this.state.label}</label>
				<ul className={listClass}>
					{radios}
				</ul>
			</div>
		)
	}
}

// ========================================

export default MultiModeOptionIndicator;
