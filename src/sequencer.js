import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Pattern from './components/Pattern.js';
import AudioOut from './components/AudioOut.js';
import SongOptions from './components/sections/SongOptions.js';
import {stepFormat} from './components/Helpers.js';

class Song extends React.Component {
	constructor(props) {
		super(props);
		this.grooveServer = 'http://localhost:8081/';
		this.state = {
			bpm: 126,
			audioSource: 'fix that.mp3',
			tracks: {},
			title: 'pyGroove Demo Beat',
			swing: .75
		};
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.songOut = React.createRef();
	}
	updateTrack(trackName,track){
		var tracks = this.state.tracks;
		tracks[trackName] = track;
		this.setState({tracks: tracks});
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
		submitted.year = 2019;
		submitted.beatDiv = 4;
		submitted.tickDiv = 32;
		submitted.repeat = 4;
		submitted.bars = 2;
		var song = this;
		window.fetch(this.grooveServer, {
			method: 'POST', 
			body: JSON.stringify(submitted)
		})
		.then(function(data) {
			data.text().then(function(text) {
				song.setState({ renderedFile: text });
				song.setState({ audioSource: text })
				song.songOut.current.refs.audio.src = '';
				song.songOut.current.refs.audio.load();
				song.songOut.current.refs.audio.src = song.state.audioSource;
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		return (
			<div className="container mx-auto rounded p-3 pattern-bg">
				<form onSubmit={this.handleSubmit} action="{this.grooveServer}">
					<SongOptions parentObj={this} containerClass="status row" />
					<Pattern parentObj={this} />
					<input type="submit" value="Save Song" tabIndex="-1" />
				</form>
				<AudioOut source={this.state.audioSource} passedRef={this.songOut} />
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Song />,
	document.getElementById('root')
);