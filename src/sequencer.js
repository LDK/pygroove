import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Pattern from './components/Pattern.js';
import Channel from './components/Channel.js';
import AudioOut from './components/widgets/AudioOut.js';
import SongOptions from './components/sections/SongOptions.js';
import Navigation from './components/sections/Navigation.js';
import {stepFormat} from './components/Helpers.js';
import {sanitizeBooleans} from './components/Helpers.js';
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
			title: '',
			swing: .75,
			currentUser: currentUser,
			id: this.props.id || false,
			activePattern: null,
			channelsLoaded: false,
			channelRows: []
		};
		this.channels = {};
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.setCurrentUser = this.setCurrentUser.bind(this);
		this.loadSong = this.loadSong.bind(this);
		this.songOut = React.createRef();
		this.renderChannel = this.renderChannel.bind(this);
		this.registerChannel = this.registerChannel.bind(this);
		this.renderPattern = this.renderPattern.bind(this);
		this.buildChannelRows = this.buildChannelRows.bind(this);
		if (props.id) {
			this.loadSong(props.id);
		}
		this.buildChannelRows();
	}
	renderChannel(i,trackName,wav) {
		var channel = <Channel trackName={trackName} wav={wav+'.wav'} song={this} updateTrack={this.updateTrack} position={i} key={i} />;
		return channel;
	}
	registerChannel(position,channel) {
		this.channels[position] = channel;
	}
	renderPattern(position) {
		return <Pattern song={this} position={position} />;
	}
	buildChannelRows() {
		var channels = [];
		if (this.state.id && !this.channelsLoaded) {
			var formData = new FormData();
			formData.append('song_id',this.state.id);
			formData.append('user_id',this.state.currentUser.user_id);
			formData.append('pyKey',this.state.currentUser.pyKey);
			var song = this;
			window.fetch(this.grooveServer+'channels', {
				method: 'POST', 
				body: formData
			})
			.then(function(data) {
				data.text().then(function(text) {
					if (!text.length) return;
					var chanData = JSON.parse(text);
					for (var chanName in chanData) {
						var channel = chanData[chanName];
						var chanObj = song.renderChannel(parseInt(channel.position),channel.name,channel.wav.replace('.wav',''));
						channels.push(chanObj);
						song.registerChannel(channel.position,chanObj);
					}
					song.channelsLoaded = true;
					song.setState({ channelRows: channels });
				});
				return channels;
			});
		}
		else {
			var channels = [];
			channels.push(this.renderChannel(1,'Kick','808-Kick1'));
			channels.push(this.renderChannel(2,'Closed Hat','808-CH1'));
			channels.push(this.renderChannel(3,'Open Hat','808-OH1'));
			channels.push(this.renderChannel(4,'Snare','808-Snare1'));
			this.channelsLoaded = true;
			this.state.channelRows = channels;
			return channels;
		}
	}
	loadSong(id) {
		id = parseInt(id);
		if (!id) return;
		var formData = new FormData();
		formData.append('song_id',this.state.id);
		formData.append('user_id',this.state.currentUser.user_id);
		formData.append('pyKey',this.state.currentUser.pyKey);
		var song = this;
		window.fetch(this.grooveServer+'song', {
			method: 'POST', 
			body: formData
		})
		.then(function(data) {
			data.text().then(function(text) {
				if (!text.length) return;
				var songData = JSON.parse(text);
				songData.id = id;
				var songChannels = cloneDeep(songData['channels']);
				delete songData['channels'];
				songData['tracks'] = songChannels;
				song.setState(songData);
				for (var channelName in songChannels) {
					var chan = songChannels[channelName];
					for (var key in chan) {
						var item = chan[key];
						chan[key] = sanitizeBooleans(item);
					}
					if (song.channels[chan.position]) {
						song.channels[chan.position].setState(chan);
					}
					else {
						song.registerChannel(chan.position, chan);
					}
				}
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
		
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
		delete submitted.activePattern;
		delete submitted.channels;
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
				song.setState({ renderedFile: text, audioSource: text });
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
					{this.renderPattern(1)}
					<input type="submit" value="Save Song" tabIndex="-1" />
				</form>
				<AudioOut source={this.state.audioSource} passedRef={this.songOut} />
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Song id={1} />,
	document.getElementById('root')
);