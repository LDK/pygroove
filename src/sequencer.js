import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';

function Cell(props) {
	return (
		<div className="cell" onClick={props.onClick}>
			{props.indicator}
		</div>
	);
}

function stepFormat(step) {
	var bar = (Math.floor((step-1) / 16)) + 1;
	var beat = (Math.floor((step-1) / 4) % 4) + 1;
	var tick = (1 + (step-1) * 8) % 32;
	// return {bar: bar, beat: beat, tick: tick};
	return bar + "." + beat + "." + tick;
}

function panFormat(value) {
	var num = Math.abs(value);
	var dir = 'C';
  if (value == 0) {
    return dir;
  }
	else if (value > 0) {
		dir = 'R';
	}
	else {
		dir = 'L';
	}
	return num + dir;
}

class Range extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || 0,
			displayValue: props.displayValue || null
		};
	}
	
	callback(event) {
		this.setState({ value: event.target.value });
		this.props.callback(event.target.value);
	}
	
	render() {
		const { range } = this.props;
		return (
			<div className={"meter " + (this.props.className || '')}>
				<input className={this.props.inputClass || ''} type="range"
					value={this.props.value || 0}
					orient={this.props.orient || 'horizontal'}
					min={this.props.min || 0}
					max={this.props.max || 100}
					step={this.props.step || 1}
					onChange={this.callback}
				>
</input>
				<span className={'meter-display ' + (this.props.inputClass || '') + ' ' + (this.props.meterClass || '')}>{this.state.value}</span>
			</div>
		)
	}
}
// class App extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			rangeVal: 0
// 		}
// 		this.updateRange = this.updateRange.bind(this);
// 	}
//
// 	updateRange(val) {
// 		this.setState({
// 			rangeVal: val
// 		})
// 	}
//
// 	render() {
// 		const { rangeVal } = this.state;
// 		return (
// 			<Range range={rangeVal} updateRange={this.updateRange}/>
// 		)
// 	}
// }
//

class Channel extends React.Component {
		constructor(props) {
		super(props);
		var steps = Array(33).fill(null);
		delete steps[0];
		this.state = {
			trackName: props.trackName || 'New Channel',
			steps: steps,
      pitch: {
        
      },
			transpose: 0,
			panDisplay: 'C',
			pan: 0,
			amp: {
				volume: 0,
				attack: 0,
				peak: 0,
				decay: 0,
				sustain: 0,
				release: 0
			},
			pattern: props.pattern,
			wav: props.wav
		};
		var pattern = props.pattern;
		var tracks = pattern.state.tracks;
		tracks[this.state.trackName] = this.state;
		pattern.setState({tracks: tracks});
		this.handleClick = this.handleClick.bind(this);
		this.updatePan = this.updatePan.bind(this);
		this.updateVolume = this.updateVolume.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
		}
		updatePan(value) {
			this.setState({ pan: value, panDisplay: panFormat(value) });
						<span className="pan-display">{this.state.panDisplay}</span>
		}
		updateVolume(value) {
			var amp = this.state.amp;
			amp.volume = value;
			this.setState({ amp: amp });
		}
		updatePitch(value) {
			this.setState({ transpose: value });
		}
		renderCell(i) {
			var indicator = '';
			var loc = stepFormat(i);
			if (this.state.steps[i]) { indicator = 'X'; }
			return <Cell bar={loc.bar} beat={loc.beat} tick={loc.tick} value={this.state.steps[i]} indicator={indicator} onClick={() => this.handleClick(i)} key={i}/>;
		}
		cellRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderCell(i));
			}
			return cells;
		}
		handleClick(i) {
			const steps = this.state.steps.slice();
			steps[i] = !steps[i];
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
			// this.setState({pattern: pattern});
		}
		render() {
			return (
			<div className="row no-gutters mb-3">
				<input className="col-12 col-sm-2" type="button" value={this.state.trackName} />
				<div className="col-1 d-none d-md-block text-center">
					<Range label="Pan" inputClass="pan col-8 px-0 mx-auto" meterClass="hidden" callback={this.updatePan} min="-100" value={this.state.pan} />
					<span className="pan-display">{this.state.panDisplay}</span>
				</div>
				<div className="col-1 d-none d-sm-block text-center">
					<Range label="Vol" min="-36" max="12" step=".1" value={this.state.amp.volume} orient="vertical" inputClass="volume px-0 mx-auto col-12 col-md-3 d-md-inline-block" meterClass="px-0 mx-auto col-12 col-md-9 d-block mt-2 mt-md-0 d-md-inline-block" callback={this.updateVolume} />
				</div>
				<Range label="Pitch" inputClass="pitch" className="d-none" callback={this.updatePitch} min="-48" max="48" value={this.state.transpose} />
				<div className="pattern-row col-12 col-sm-9 col-md-8">
					{this.cellRow(1,32)}
				</div>
			</div>
			);
		}

}

class Pattern extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bpm: 126,
			swing: .75,
			bars: 2,
			title: 'pyGroove Demo Beat',
			tracks: {}
		};
		this.updateBPM = this.updateBPM.bind(this);
		this.updateSwing = this.updateSwing.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateTrack = this.updateTrack.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.renderChannel = this.renderChannel.bind(this);
	}
	updateTrack(trackName,track){
		var tracks = this.state.tracks;
		tracks[trackName] = track;
		this.setState({tracks: tracks});
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
					var note = { loc: stepFormat(step) };
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
		window.fetch('http://localhost:8081/', {
			method: 'POST', 
			body: JSON.stringify(submitted)
		})
		.then(function(data) {
			data.text().then(function(text) {
				console.log('The filename is',text);
			});
		  }).catch(function(error) {
		    console.log('Request failed', error);
		  });
	}
	render() {
		return (
			<div className="container mx-auto rounded p-3 pattern-bg">
				<form onSubmit={this.handleSubmit} action="http://localhost:8081/">
					<div className="status row">
						<div className="col-10">
							<label>Title:</label><input type="text" value={this.state.title} onChange={this.updateTitle} /><br />
							<label>BPM:</label><input type="text" value={this.state.bpm} onChange={this.updateBPM} /><br />
						</div>
						<div className="col-2">
							Swing: <Range label="Swing" inputClass="pan col-8 px-0 mx-auto" meterClass="pl-2" callback={this.updateSwing} min="0" max="1.25" step=".01" value={this.state.swing} />
						</div>
					</div>
					{this.renderChannel('Kick','808-Kick1')}
					{this.renderChannel('Closed Hat','808-CH1')}
					{this.renderChannel('Open Hat','808-OH1')}
					{this.renderChannel('Snare','808-Snare1')}
					<input type="submit" value="Save Pattern" />
				</form>
			</div>
		);
	}
}

class Note extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				offset: 0,
				transpose: 0,
				pan: 0,
				volume: 0,
				bar: props.bar || null,
				beat: props.beat || null,
				tick: props.tick || null
			};
		}
}

class Song extends React.Component {
	render() {
		return (
			<div className="song">
				<div className="song-pattern">
					<Pattern />
				</div>
				<div className="song-info">
					<div>{/* status */}</div>
					<ol>{/* TODO */}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Pattern />,
	document.getElementById('root')
);
