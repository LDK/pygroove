import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Channel from './Channel.js';
import Range from './widgets/Range.js';
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
	renderChannel(i,trackName,wav) {
		return <Channel trackName={trackName} wav={wav+'.wav'} pattern={this} updateTrack={this.props.song.updateTrack} key={i} />;
	}
	channelRows() {
		var channels = [];
		channels.push(this.renderChannel(1,'Kick','808-Kick1'));
		channels.push(this.renderChannel(2,'Closed Hat','808-CH1'));
		channels.push(this.renderChannel(3,'Open Hat','808-OH1'));
		channels.push(this.renderChannel(4,'Snare','808-Snare1'));
		return channels;
	}
	render() {
		return (
			<section id="pattern">
				{this.channelRows()}
			</section>
		);
	}
}

export default Pattern;
