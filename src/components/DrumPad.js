import React, { Component } from 'react';
import AudioOut from './AudioOut.js';
import Hotkeys from 'react-hot-keys';
const HotKey = require('react-shortcut');
import PowerButton from './PowerButton.js';

class DrumPad extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			highlight: false,
			wav: this.props.wav || null
		};
		this.empty = this.empty.bind(this);
		this.playWav = this.playWav.bind(this);
		this.loadWav = this.loadWav.bind(this);
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		if (this.props.wav) {
			audioOut.current.src = this.state.wav;
			audioOut.current.load();
		}
		if (this.props.group) {
			var padRefs = this.props.group.state.padRefs;
			if (!padRefs) {
				padRefs = [];
			}
			padRefs[this.props.padKey] = audioOut;
			this.props.group.setState({ padRefs: padRefs });
		}
	}
	onKeyUp(keyName, e, handle) {
		this.setState({highlight:false});
	}
	onKeyDown(keyName, e, handle) {
		this.setState({highlight:true});
		this.playWav();
	}
	empty() {
		var i = this.props.padKey;
		this.setState({ wav: null });
	}
	loadWav(audioOut) {
		audioOut.current.src = this.props.group.state.slices[this.props.padKey-1];
		audioOut.current.load();
	}
	playWav() {
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		if (audioOut.current && !this.state.wav && this.props.group.state.slices) {
			this.loadWav(audioOut);
		}
		audioOut.current.play();
	}
	toggleSettings() {

	}
	render() {
		var label = this.props.label || 'Upload File';
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		var keyArray = this.props.hotKey.split(',');
		return (
			<Hotkeys
				keyName={this.props.hotKey}
				onKeyUp={this.onKeyUp.bind(this)}
			>
				<HotKey
					simultaneous
					keys={keyArray}
					onKeysCoincide={this.onKeyDown.bind(this)}
				/>
				<div 
					className={
						"drumPad " + 
						this.props.padClass + " " + 
						this.props.padKey + " " +
						(this.state.highlight ? 'highlight' : '')
					}>
					<div onClick={this.playWav} className="padSurface w-100 h-100">
						<AudioOut source={this.state.wav} passedRef={audioOut} />
					</div>
				</div>
			</Hotkeys>
		)
	}
}

export default DrumPad;