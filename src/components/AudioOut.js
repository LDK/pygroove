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
	}
	render() {
		return (
			<div>
				<audio controls tabIndex="-1">
					<source src={this.state.source} />
				</audio>
			</div>
		)
	}
}

export default AudioOut;
