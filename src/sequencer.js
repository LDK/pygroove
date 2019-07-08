import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Pattern from './components/Pattern.js';
import AudioOut from './components/widgets/AudioOut.js';
import SongOptions from './components/sections/SongOptions.js';
import Navigation from './components/sections/Navigation.js';
import {stepFormat} from './components/Helpers.js';
import Cookies from 'universal-cookie';

class Song extends React.Component {
	constructor(props) {
		super(props);
		this.grooveServer = 'http://localhost:8081/';
		const cookies = new Cookies();
		var userCookie = cookies.get('pyGroove-user');
		var currentUser = false;
		if (userCookie && userCookie.user_id && userCookie.pyKey) {
			currentUser = userCookie;
		}
		this.state = {
			bpm: 126,
			audioSource: 'fix that.mp3',
			tracks: {},
			title: 'pyGroove Demo Beat',
			swing: .75,
			currentUser: currentUser
		};
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setCurrentUser = this.setCurrentUser.bind(this);
		this.songOut = React.createRef();
	}
	setCurrentUser(user) {
		if (user.hasOwnProperty('error')) {
			return;
		}
		const cookies = new Cookies();
		var d = new Date();
		d.setTime(d.getTime() + ((60*24*30)*60*1000));
		cookies.set("pyGroove-user", JSON.stringify(user), { path: "/", expires: d });
		this.setState({currentUser: user});
	}
	updateTrack(trackName,track) {
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
					var note = { 
						loc: stepFormat(step).loc,
						pitch: track.steps[step].pitch,
						filter: track.steps[step].filter,
						reverse: track.steps[step].reverse || false
					 };
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
				song.songOut.current.src = song.state.audioSource;
				song.songOut.current.load();
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		return (
			<div className="container mx-auto rounded px-3 pb-3 pattern-bg">
				<Navigation song={this} loginCallback={this.setCurrentUser} />
				<form onSubmit={this.handleSubmit} action={this.grooveServer}>
					<SongOptions song={this} containerClass="status row" />
					<Pattern song={this} position={1} />
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