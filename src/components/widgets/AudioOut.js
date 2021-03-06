import React, { Component } from 'react';

class AudioOut extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			source: props.source || null
		};
		this.updateSource = this.updateSource.bind(this);
	}
	updateSource(value) {
		this.setState({source: value});
		this.render();
	}
	render() {
		return (
			<div>
				<audio ref={this.props.passedRef} tabIndex="-1">
					<source src={this.state.source} />
				</audio>
			</div>
		)
	}
}

export default AudioOut;
