import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Channel from './Channel.js';
import Range from './Range.js';
import {stepFormat} from './Helpers.js';

class Pattern extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bars: 2,
			clipboard: {}
		};
		this.addToClipboard = this.addToClipboard.bind(this);
		this.renderChannel = this.renderChannel.bind(this);
	}
	addToClipboard(k,v) {
		var clip = this.state.clipboard;
		clip[k] = v;
		this.setState({ clipboard: clip });
	}
	renderChannel(trackName,wav) {
		return <Channel trackName={trackName} wav={wav+'.wav'} pattern={this} updateTrack={this.props.parentObj.updateTrack} />;
	}
	render() {
		return (
				<section id="pattern">
					{this.renderChannel('Kick','808-Kick1')}
					{this.renderChannel('Closed Hat','808-CH1')}
					{this.renderChannel('Open Hat','808-OH1')}
					{this.renderChannel('Snare','808-Snare1')}
					<input type="submit" value="Save Pattern" tabIndex="-1" />
				</section>
		);
	}
}

export default Pattern;
