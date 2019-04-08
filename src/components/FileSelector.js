import React, { Component } from 'react';

class FileSelector extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || null,
			label: props.label || ''
		};
	}
	callback(event) {
		var val = event.currentTarget.value;
		this.setState({value: val});
		if (this.props.callback) {
			this.props.callback(event.currentTarget.value);
		}
		this.render();
	}
	render() {
		var props = this.props;
		var state = this.state;
		var wrapperClass = "fileSelector" +  (props.disabled ? ' disabled ' : ' ') + (this.props.className || '');
		return (
			<div className={wrapperClass}>
				<label>{this.state.label}</label>
				<input type="file" tabIndex="-1" name={props.name} disabled={props.disabled} />
			</div>
		)
	}
}

export default FileSelector;
