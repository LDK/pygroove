import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import OptionIndicator from './OptionIndicator.js';
import ContextMenu from './ContextMenu.js';
import PowerButton from './PowerButton.js';
import Cell from './Cell.js';
import FilterSection from './sections/FilterSection.js';
import SampleSection from './sections/SampleSection.js';
import Channel from './Channel.js';
import ChannelPitchSection from './sections/ChannelPitchSection.js';
import AudioOut from './AudioOut.js';
import Range from './Range.js';

function stepFormat(step) {
	var bar = (Math.floor((step-1) / 16)) + 1;
	var beat = (Math.floor((step-1) / 4) % 4) + 1;
	var tick = (1 + (step-1) * 8) % 32;
	return {
		bar: bar, 
		beat: beat, 
		tick: tick,
		loc: bar + "." + beat + "." + tick
	};
}


class Pattern extends React.Component {
	constructor(props) {
		super(props);
		this.patternOut = React.createRef();
		this.state = {
			bpm: 126,
			swing: .75,
			bars: 2,
			title: 'pyGroove Demo Beat',
			audioSource: 'fix that.mp3',
			tracks: {},
			clipboard: {}
		};
		this.grooveServer = 'http://localhost:8081/';
		this.updateBPM = this.updateBPM.bind(this);
		this.updateSwing = this.updateSwing.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.addToClipboard = this.addToClipboard.bind(this);
		this.renderChannel = this.renderChannel.bind(this);
	}
	updateTrack(trackName,track){
		var tracks = this.state.tracks;
		tracks[trackName] = track;
		this.setState({tracks: tracks});
	}
	addToClipboard(k,v) {
		var clip = this.state.clipboard;
		clip[k] = v;
		this.setState({ clipboard: clip });
	}
	renderChannel(trackName,wav) {
		return <Channel trackName={trackName} wav={wav+'.wav'} pattern={this} updateTrack={this.updateTrack} />;
	}
	updateBPM(event) {
		this.setState({bpm: event.target.value});
	}
	updateSwing(value) {
		this.setState({swing: value});
	}
	updateTitle(event) {
		this.setState({title: event.target.value});
	}
	handleSubmit(event) {
		event.preventDefault();
		for (var trackName in this.state.tracks) {
			this.updateTrack(trackName,this.state.tracks[trackName]);
		}
		const submitted = cloneDeep(this.state);
		delete submitted.__proto__;
		for (var trackName in submitted.tracks) {
			var track = submitted.tracks[trackName];
			delete track.pattern;
			track.notes = [];
			for (var step in track.steps) {
				if (track.steps[step]) {
					var note = { loc: stepFormat(step).loc };
					track.notes.push(note);
				}
			}
			delete track.steps;
			delete track.panDisplay;
			delete track.pitch;
			delete track.trackName;
		}
		submitted.author = 'Daniel Swinney';
		submitted.year = 2018;
		submitted.beatDiv = 4;
		submitted.tickDiv = 32;
		submitted.repeat = 4;
		var pattern = this;
		window.fetch(this.grooveServer, {
			method: 'POST', 
			body: JSON.stringify(submitted)
		})
		.then(function(data) {
			data.text().then(function(text) {
				pattern.setState({ renderedFile: text });
				pattern.setState({ audioSource: text })
				pattern.patternOut.current.refs.audio.src = '';
				pattern.patternOut.current.refs.audio.load();
				pattern.patternOut.current.refs.audio.src = pattern.state.audioSource;
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		return (
			<div className="container mx-auto rounded p-3 pattern-bg">
				<form onSubmit={this.handleSubmit} action="{this.grooveServer}">
					<div className="status row">
						<div className="col-10">
							<label>Title:</label><input type="text" value={this.state.title} onChange={this.updateTitle} tabIndex="-1" /><br />
							<label>BPM:</label><input type="text" value={this.state.bpm} onChange={this.updateBPM} tabIndex="-1" /><br />
						</div>
						<div className="col-2">
							Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={this.state.swing} />
						</div>
					</div>
					{this.renderChannel('Kick','808-Kick1')}
					{this.renderChannel('Closed Hat','808-CH1')}
					{this.renderChannel('Open Hat','808-OH1')}
					{this.renderChannel('Snare','808-Snare1')}
					<input type="submit" value="Save Pattern" tabIndex="-1" />
				</form>
				<AudioOut source={this.state.audioSource} passedRef={this.patternOut} />
			</div>
		);
	}
}

export default Pattern;
