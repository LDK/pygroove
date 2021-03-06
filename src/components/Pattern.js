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
		var position = this.props.position;
		this.state = {
			id: this.props.id || null,
			bars: this.props.bars || 2,
			name: this.props.name || 'Pattern '+position,
			position: position || (this.props.song.patterns.length + 1),
			clipboard: {}
		};
		this.addToClipboard = this.addToClipboard.bind(this);
		if (!this.props.song.patterns[position]) {
			var patternObj = cloneDeep(this.state);
			delete patternObj.clipboard;
			patternObj.chanSequences = {};
			this.props.song.registerPattern(position,patternObj);
		}
		if (!this.props.song.state.activePattern) {
			var stateObj = { activePattern: this };
			this.props.song.setState(stateObj);
		}
	}
	addToClipboard(k,v) {
		var clip = this.state.clipboard;
		clip[k] = v;
		this.setState({ clipboard: clip });
	}
	render() {
		return (
			<section id="pattern">
				{this.props.song.state.channelRows}
			</section>
		);
	}
}

export default Pattern;
