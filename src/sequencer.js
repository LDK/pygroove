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
import {cellFormat} from './components/Helpers.js';
import {sanitizeBooleans} from './components/Helpers.js';
import Cookies from 'universal-cookie';
import DataBrowser from './components/widgets/DataBrowser.js';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.songs = [];
		this.grooveServer = 'http://localhost:8081/';
		const cookies = new Cookies();
		var userCookie = cookies.get('pyGroove-user');
		var currentUser = false;
		if (userCookie && userCookie.user_id && userCookie.pyKey) {
			currentUser = userCookie;
		}
		this.state = {
			currentUser: currentUser,
			activeSong: null,
			songs: []
		};
		this.setCurrentUser = this.setCurrentUser.bind(this);
		this.logUserOut = this.logUserOut.bind(this);
		this.getSongs = this.getSongs.bind(this);
		this.getSongs();
	}
	getSongs() {
		var uid = this.state.currentUser.user_id;
		if (!uid) {
			return [];
		}
		var formData = new FormData();
		var app = this;
		formData.append('user_id',this.state.currentUser.user_id);
		formData.append('pyKey',this.state.currentUser.pyKey);
		window.fetch(this.grooveServer+'songs', {
			method: 'POST', 
			body: formData
		}).then(function(data){
			data.text().then(function(text) {
				if (!text.length) {
					return;
				}
				var songData = JSON.parse(text);
				var songs = [];
				for (var i in songData) {
					var song = songData[i];
					songs.push({
						id: song.id,
						name: song.title
					});
				}
				app.setState({songs: songs});
			});
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
		this.getSongs();
	}
	setActiveSong(song) {
		this.setState({activeSong: song});
	}
	logUserOut() {
		const cookies = new Cookies();
		cookies.remove("pyGroove-user");
		this.state.activeSong.patterns = {};
		this.state.activeSong.channels = {};
		this.state.activeSong.setState({ id: null, title: null, bpm: 126, swing: .75 });
		this.setState({currentUser: false, activeSong: null, songs: []});
	}
	render() {
		return (
			<Song app={this} />
		);
	}
}
class Song extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bpm: 126,
			audioSource: 'fix that.mp3',
			tracks: {},
			title: '',
			swing: .75,
			id: this.props.id || false,
			activePattern: null,
			activePatternIndex: this.props.initPattern || 1,
			channelsLoaded: false,
			channelRows: []
		};
		this.channels = {};
		this.patterns = {};
		this.app = this.props.app;
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.loadSong = this.loadSong.bind(this);
		this.songOut = React.createRef();
		this.renderChannel = this.renderChannel.bind(this);
		this.registerChannel = this.registerChannel.bind(this);
		this.renderPattern = this.renderPattern.bind(this);
		this.registerPattern = this.registerPattern.bind(this);
		this.buildChannelRows = this.buildChannelRows.bind(this);
		this.getPatterns = this.getPatterns.bind(this);
		if (props.id) {
			this.loadSong(props.id);
		}
		else {
			this.app.setActiveSong(this);
		}
		this.buildChannelRows(false);
	}
	renderChannel(i,trackName,sampleData) {
		var initData = {};
		if (this.channels[i]) {
			initData = this.channels[i];
		}
		var wav = sampleData.wav ? sampleData.wav+'.wav' : null;
		var img = sampleData.image ? sampleData.image : null;
		var id = sampleData.id ? sampleData.id : null;
		var channel = <Channel trackName={trackName} wav={wav} sampleImage={img} sampleId={id} song={this} updateTrack={this.updateTrack} position={i} key={i} initData={initData} />;
		return channel;
	}
	registerChannel(position,channel) {
		this.channels[position] = channel;
	}
	renderPattern(position) {
		var initData = {};
		if (this.patterns[position]) {
			initData = this.patterns[position];
		}
		var pattern = <Pattern song={this} position={this.state.activePatternIndex} />;
		return pattern;
	}
	registerPattern(position,pattern) {
		this.patterns[position] = pattern;
	}
	getDefaultChannels() {
		var channels = [];
		channels.push(this.renderChannel(1,'Kick',{ id: 1, wav: '808-Kick1', image: 'img/waveform/default/808-Kick1.png' }));
		channels.push(this.renderChannel(2,'Closed Hat',{ id: 2, wav: '808-CH1', image: 'img/waveform/default/808-CH1.png' }));
		channels.push(this.renderChannel(3,'Open Hat',{ id: 3, wav: '808-OH1', image: 'img/waveform/default/808-OH1.png' }));
		channels.push(this.renderChannel(4,'Snare',{ id: 4, wav: '808-Snare1', image: 'img/waveform/default/808-Snare1.png' }));
		return channels;
	}

	getPatterns() {
		var song = this;
		var patterns = [];
		var formData = new FormData();
		var app = this.app;
		formData.append('song_id',this.state.id);
		formData.append('user_id',app.state.currentUser.user_id);
		formData.append('pyKey',app.state.currentUser.pyKey);
		window.fetch(app.grooveServer+'patterns', {
			method: 'POST', 
			body: formData
		})
		.then(function(data) {
			data.text().then(function(text) {
				if (!text.length) {
					return;
				}
				var patternData = JSON.parse(text);
				for (var chanPos in song.channels) {
					// song.channels[chanPos].clearCells();
					for (var position in patternData) {
						var pattern = patternData[position];
						patterns.push(pattern);
						var steps = JSON.parse(pattern.chanSequences[chanPos].replace(/'/g, '"').toLowerCase());
						if (position == song.state.activePatternIndex) {
							for (var i in steps) {
								var step = cellFormat(steps[i]);
								song.channels[chanPos].fillCell(step,steps[i]);
							}
						}
						song.registerPattern(position,pattern);
					}
				}
				song.patternsLoaded = true;
			});
			return patterns;
		});
	}
	buildChannelRows(renderAfter,songId) {
		if (!songId) {
			songId = this.state.id;
		}
		var channels = [];
		var song = this;
		song.channelsLoaded = false;
		var init = song.getDefaultChannels();
		song.setState({ channelRows: [] });
		if (songId) {
			var formData = new FormData();
			var app = this.app;
			formData.append('song_id',songId);
			formData.append('user_id',app.state.currentUser.user_id);
			formData.append('pyKey',app.state.currentUser.pyKey);
			var song = this;
			window.fetch(app.grooveServer+'channels', {
				method: 'POST', 
				body: formData
			})
			.then(function(data) {
				data.text().then(function(text) {
					if (!text.length) {
						var channelList = song.getDefaultChannels();
						song.setState({ channelRows: channelList, id: false });
						return;
					}
					var chanData = JSON.parse(text);
					for (var chanName in chanData) {
						var channel = chanData[chanName];
						var chanObj = song.renderChannel(parseInt(channel.position),channel.name,channel.sample);
						channels.push(chanObj);
						song.registerChannel(channel.position,chanObj);
					}
					song.channelsLoaded = true;
					song.setState({ channelRows: channels });
					song.getPatterns();
				});
				return channels;
			});
		}
		else {
			var channels = this.getDefaultChannels();
			this.state.channelRows = channels;
			this.channelsLoaded = true;
			return channels;
		}
	}
	loadSong(id,buildAfter) {
		id = parseInt(id);
		if (!id) return;
		var formData = new FormData();
		var app = this.app;
		formData.append('song_id',id);
		formData.append('user_id',app.state.currentUser.user_id);
		formData.append('pyKey',app.state.currentUser.pyKey);
		var song = this;
		song.patterns = {};
		song.channels = {};
		window.fetch(app.grooveServer+'song', {
			method: 'POST', 
			body: formData
		})
		.then(function(data) {
			app.setState({ activeSong: null });
			data.text().then(function(text) {
				if (!text.length) {
					return;
				}
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
						if (!chan.hasOwnProperty('setState')) {
							chan[key] = sanitizeBooleans(item);
						}
					}
					if (song.channels[chan.position]) {
						song.channels[chan.position].setState(chan);
					}
					else {
						song.registerChannel(chan.position, chan);
					}
				}
			});
			app.setState({ activeSong: song });
			if (buildAfter) {
				song.buildChannelRows(true,id);
			}
			app.state.activeSong.render();
		}).catch(function(error) {
			console.log('Request failed', error);
		});
		
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
		delete submitted.channelRows;
		submitted.currentUser = this.app.state.currentUser;
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
		submitted.patterns = this.patterns;
		var song = this;
		var app = song.app;
		window.fetch(app.grooveServer, {
			method: 'POST', 
			body: JSON.stringify(submitted)
		})
		.then(function(data) {
			data.text().then(function(text) {
				// TODO: Move these lines to a separate render function
				// song.setState({ renderedFile: text, audioSource: text });
				// song.songOut.current.src = song.state.audioSource;
				// song.songOut.current.load();
				song.setState({ id: JSON.parse(text).id });
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		var app = this.app;
		return (
			<div className="container mx-auto rounded px-3 pb-3 pattern-bg">
				<Navigation song={this} loginCallback={app.setCurrentUser} logoutCallback={app.logUserOut} />
				<form onSubmit={this.handleSubmit} action={app.grooveServer}>
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
	<App />,
	document.getElementById('root')
);