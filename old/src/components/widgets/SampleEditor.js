import React, { Component } from 'react';
import AudioOut from './AudioOut.js';
import Hotkeys from 'react-hot-keys';
const HotKey = require('react-shortcut');
import PowerButton from './PowerButton.js';
import cloneDeep from 'lodash/cloneDeep';

class SampleEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			playing: false,
			sample: {
				wav: this.props.wav || null,
				length: this.props.length || 0,
				image: this.props.image || null,
				sliceLength: this.props.sliceLength || 0,
				sliceStart: this.props.sliceStart || 0,
				sliceEnd: this.props.sliceEnd || 0
			}
		};
		this.playWav = this.playWav.bind(this);
		this.loadWav = this.loadWav.bind(this);
		this.pauseWav = this.pauseWav.bind(this);
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		if (this.props.wav) {
			audioOut.current.src = this.state.sample.wav;
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
	loadWav(audioOut) {
		if (audioOut) {
			audioOut.current.src = this.props.group.state.slices[this.props.padKey-1].filename;
			audioOut.current.load();
		}
	}
	restartWav(audioOut) {
		if (audioOut && audioOut.current) {
			audioOut.current.pause();
			audioOut.current.currentTime = 0;
		}
	}
	playWav() {
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		if (this.state.playing) {
			this.restartWav(audioOut);
		}
		if (audioOut.current && !this.state.sample.wav && this.props.group.state.slices) {
			if (!audioOut.current.src || audioOut.current.src!=this.state.sample.wav) {
				this.loadWav(audioOut);
			}
		}
		if (audioOut && audioOut.current && audioOut.current.src) {
			audioOut.current.play();
			this.setState({playing:true});
			var pad = this;
			const padState = cloneDeep(this.state);
			setTimeout(function(){
				if (pad.state.lastInput == padState.lastInput) {
					pad.pauseWav();
				}
			},this.props.group.state.slices[this.props.padKey].len);
		}
		else {
			this.setState({playing:false});
		}
	}
	pauseWav() {
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		if (audioOut && audioOut.current) {
			audioOut.current.pause();
		}
		this.setState({ playing: false });
	}
	toggleSettings() {

	}
	render() {
		var label = this.props.label || 'Upload File';
		var audioOut = this.props.group.state.padRefs[this.props.padKey];
		return (
			<div 
				className={
					"drumPad " + 
					this.props.padClass + " " + 
					this.props.padKey + " " +
					(this.state.playing ? 'highlight' : '')
				}>
				<div onClick={this.playWav} className="padSurface w-100 h-100">
					<AudioOut source={this.state.sample.wav} passedRef={audioOut} />
					<div className="hotKeyLabel">{(this.props.hotKey).toUpperCase()}</div>
				</div>
			</div>
		)
	}
}

export default SampleEditor;
