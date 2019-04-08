import React, { Component } from 'react';

class ContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			isOpen: props.open || false,
			icon: props.icon || 'see-more-vertical',
			items: props.items || []
		};
	}
	componentWillMount() {
		document.addEventListener('mousedown', this.handleClick, false);
	}
	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClick, false);
	}
	handleClick(event) {
		if (event.target.classList.contains('contextMenu-option')) {
			// Do nothing
		}
		else {
			this.setState({ isOpen: false })
		}
	}
	callback(event) {
		event.preventDefault();
		var opn = !this.state.isOpen;
		this.setState({ isOpen: opn });
		if (this.props.callback) {
			this.props.callback(event);
		}
		this.render();
	}
	render() {
		var wrapperClass = "contextMenu-wrapper d-inline-block " + (this.props.wrapperClass || '');
		wrapperClass = wrapperClass.trim();
		if (this.state.isOpen) {
			wrapperClass += ' open';
		}
		const options = this.props.items.map((item,i) => 
			<option className="contextMenu-option" key={i} value={item.value}>{item.label}</option>
			);
		return (
			<div className={wrapperClass}>
				<a onClick={this.callback} href="javascript:;" className={this.state.icon}></a>
				<select size={this.state.items.length} onClick={this.callback} tabIndex="-1">
					{options}
				</select>
			</div>
		)
	}
}

export default ContextMenu;
