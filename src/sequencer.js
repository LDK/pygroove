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
					tabIndex="-1" >
				</input>
				<span className={'meter-display ' + (this.props.inputClass || '') + ' ' + (this.props.meterClass || '')}>{this.state.value}</span>
			</div>
		)
	}
}

class PowerButton extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			switchedOn: props.switchedOn || false,
			label: props.label || '',
			labelButton: props.labelButton || false
		};
		this.state.inputClass = this.state.switchedOn ? 'switchedOn' : '';
	}
	callback(event) {
		event.preventDefault();
		var switchedOn = !this.state.switchedOn;
		this.setState({ switchedOn: switchedOn });
		if (this.props.callback) {
			this.props.callback(switchedOn);
		}
	}
	render() {
		var buttonClass = this.state.switchedOn ? 'switchedOn' : '';
		var divClass = "powerButton " + (this.props.className || '');
		var wrapperClass = "powerButton-wrapper d-inline-block " + (this.props.wrapperClass || '');
		wrapperClass = wrapperClass.trim();
		divClass = divClass.trim();
		if (this.state.labelButton) {
			divClass += " labelButton";
		}
		return (
			<div className={wrapperClass}>
				<label className={'powerButton-display ' + (this.props.inputClass || '') + ' ' + (this.props.displayClass || '')}>{!this.state.labelButton ? this.state.label : ''}</label>
				<div className={divClass}>
					<button className={buttonClass}
						value={this.state.switchedOn ? 1 : 0}
						onClick={this.callback}
						tabIndex="-1" 
					>{this.state.labelButton ? this.state.label : ''}</button>
				</div>
			</div>
		)
	}
}

class ContextMenu extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			isOpen: props.open || false,
			icon: props.icon || 'see-more-vertical',
			items: props.items || []
		};
	}
	componentWillMount() {
		document.addEventListener('mousedown', this.handleClick, false);
	}
	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClick, false);
	}
	handleClick(event) {
		if (event.target.classList.contains('contextMenu-option')) {
			// Do nothing
		}
		else {
			this.setState({ isOpen: false })
		}
	}
	callback(event) {
		event.preventDefault();
		var opn = !this.state.isOpen;
		this.setState({ isOpen: opn });
		if (this.props.callback) {
			this.props.callback(event);
		}
		this.render();
	}
	render() {
		var wrapperClass = "contextMenu-wrapper d-inline-block " + (this.props.wrapperClass || '');
		wrapperClass = wrapperClass.trim();
		if (this.state.isOpen) {
			wrapperClass += ' open';
		}
		const options = this.props.items.map((item,i) => 
			<option className="contextMenu-option" key={i} value={item.value}>{item.label}</option>
			);
		return (
			<div className={wrapperClass}>
				<a onClick={this.callback} href="javascript:;" className={this.state.icon}></a>
				<select size={this.state.items.length} onClick={this.callback} tabIndex="-1">
					{options}
				</select>
			</div>
		)
	}
}

class OptionIndicator extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || null,
			label: props.label || '',
			layout: props.layout || 'horizontal'
		};
	}
	callback(event) {
		var val = event.currentTarget.value;
		this.setState({value: val});
		if (this.props.callback) {
			this.props.callback(event.currentTarget.value);
		}
		this.render();
	}
	render() {
		var props = this.props;
		var state = this.state;
		var cb = this.callback;
		var layout = state.layout;
		const radios = this.props.options.map((opt,i) => 
			<li className={"px-0 mx-2 pt-3 "} key={i}>
				<label>{opt.key}
					<input type="radio" defaultChecked={opt.value === state.value}
					tabIndex="-1" value={opt.value} name={props.name} disabled={props.disabled} onClick={cb} />
					<span className="checkmark"></span>
				</label>
			</li>
		);
		var listClass = "text-center px-0 mb-0 " + layout;
		var wrapperClass = "optionIndicator text-center" +  (props.disabled ? ' disabled ' : ' ') + (this.props.className || '');
		return (
			<div className={wrapperClass}>
				<label>{this.state.label}</label>
				<ul className={listClass}>
					{radios}
				</ul>
			</div>
		)
	}
}

class FileSelector extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || null,
			label: props.label || ''
		};
	}
	callback(event) {
		var val = event.currentTarget.value;
		this.setState({value: val});
		if (this.props.callback) {
			this.props.callback(event.currentTarget.value);
		}
		this.render();
	}
	render() {
		var props = this.props;
		var state = this.state;
		var wrapperClass = "fileSelector" +  (props.disabled ? ' disabled ' : ' ') + (this.props.className || '');
		return (
			<div className={wrapperClass}>
				<label>{this.state.label}</label>
				<input type="file" tabIndex="-1" name={props.name} disabled={props.disabled} />
			</div>
		)
	}
}

class Incrementer extends React.Component {
	constructor(props) {
		super(props);
		this.callback = this.callback.bind(this);
		this.state = {
			value: props.value || '',
			label: props.label || '',
			min: props.min || false,
			max: props.max || false,
			typeMode: props.typeMode || false
		};
		this.increment = this.increment.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.typeModeOn = this.typeModeOn.bind(this);
		this.typeModeOff = this.typeModeOff.bind(this);
		this.keyPress = this.keyPress.bind(this);
	}
	callback(event) {
		var val = event.currentTarget.value;
		this.setState({value: val});
		if (this.props.callback) {
			this.props.callback(event.currentTarget.value);
		}
		this.render();
	}
	increment(val) {
		var newVal = parseInt(this.state.value) || 0;
		newVal += val;
		newVal = this.sanitizeValue(newVal);
		this.setState({value: newVal, typeMode: false});
		if (this.props.callback) {
			this.props.callback(newVal);
		}
		this.render();
	}
	focusOn() {
		this.textInput.focus();
	}
	typeModeOn(event) {
		this.setState({ typeMode: true });
		this.render();
		this.focusOn();
	}
	typeModeOff(event) {
		var val = parseInt(event.target.value);
		if (val) {
			this.setState({value:val});
		}
		this.setState({ typeMode: false });
		if (this.props.callback) {
			this.props.callback(val);
		}
		this.render();
	}
	handleChange(event) {
		var val = this.sanitizeValue(event.target.value);
		this.setState({ value: val });
		if (this.props.callback) {
			this.props.callback(val);
		}
	}
	sanitizeValue(value) {
		var finalValue = value || 0;
		if (this.state.min !== false) {
			finalValue = Math.max(finalValue, this.state.min);
		}
		if (this.state.max !== false) {
			finalValue = Math.min(finalValue, this.state.max);
		}
		if (isNaN(finalValue)) {
			finalValue = 0;
		}
		return finalValue;
	}
	handleBlur(event) {
		var finalValue = this.sanitizeValue(event.target.value);
		this.setState({ value: finalValue, typeMode: false });
		if (this.props.callback) {
			this.props.callback(finalValue);
		}
	}
	keyPress(e){
		if(e.keyCode == 13 || e.keyCode == 10){
			e.preventDefault();
			var value = this.sanitizeValue(e.target.value);
			this.setState({ value: value, typeMode: false });
			if (this.props.callback) {
				this.props.callback(value);
			}
		}
	}
	render() {
		return (
			<div className={"incrementer text-center" + ' ' + (this.props.className || '') }>
				<label className="d-block">{this.state.label}</label>
			<span onClick={() => this.increment(1)} >^</span>
			<span onClick={() => this.increment(12)} >^^</span>
				<div onClick={this.typeModeOn}>
					<input type="text" onKeyDown={this.keyPress} tabIndex="-1" value={this.state.value} name={this.props.name} 
						ref={elem => (this.textInput = elem)} 
						className={"mx-auto text-center w-50 d-block " + (this.props.disabled || !this.state.typeMode ? ' disabled' : '')}
						disabled={this.props.disabled || !this.state.typeMode}
						onBlur={this.handleBlur}
						onChange={this.handleChange} />
				</div>
						<span onClick={() => this.increment(-1)}>v</span>
						<span onClick={() => this.increment(-12)} >vv</span>
			</div>
		)
	}
}

class Channel extends React.Component {
	constructor(props) {
		super(props);
		var steps = Array(33).fill(null);
		delete steps[0];
		this.state = {
			disabled: props.disabled || false,
			disabledClass: props.disabled ? 'disabled' : '',
			settingsOpen: props.settingsOpen || false,
			settingsClass: props.settingsOpen ? '' : ' d-none',
			settingsMode: props.settingsMode || 'chan',
			trackName: props.trackName || 'New Channel',
			steps: steps,
			reverse: props.reverse || false,
			trim: props.trim || false,
			pitch: {
				
			},
			transpose: 0,
			panDisplay: 'C',
			pan: 0,
			filter: {
				type: 'lp',
				frequency: 22000
			},
			filter2: {
				type: 'lp',
				frequency: 22000
			},
			filterOn: false,
			filter2On: false,
			filterType: 'lp',
			filter2Type: 'lp',
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
		this.state.actions = {
			fill: function(chan) {
				for (var i=1;i<chan.state.steps.length;i++) {
					chan.fillCell(i);
				}
			},
			fill2: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+2) {
					chan.fillCell(i);
				}
			},
			fill4: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+4) {
					chan.fillCell(i);
				}
			},
			fill8: function(chan) {
				for (var i=1;i<chan.state.steps.length;i=i+8) {
					chan.fillCell(i);
				}
			},
			clear: function(chan) {
				for (var i=1;i<chan.state.steps.length;i++) {
					chan.emptyCell(i);
				}
			},
			copy: function() {

			},
			paste: function() {

			}
		}
		var pattern = props.pattern;
		var tracks = pattern.state.tracks;
		tracks[this.state.trackName] = this.state;
		pattern.setState({tracks: tracks});
		this.toggleCell = this.toggleCell.bind(this);
		this.fillCell = this.fillCell.bind(this);
		this.emptyCell = this.emptyCell.bind(this);
		this.updatePan = this.updatePan.bind(this);
		this.updateSettingsMode = this.updateSettingsMode.bind(this);
		this.updateFilterType = this.updateFilterType.bind(this);
		this.updateFilterFrequency = this.updateFilterFrequency.bind(this);
		this.updateVolume = this.updateVolume.bind(this);
		this.updatePitch = this.updatePitch.bind(this);
		this.updateActive = this.updateActive.bind(this);
		this.toggleSettings = this.toggleSettings.bind(this);
		this.toggleFilter = this.toggleFilter.bind(this);
		this.toggleReverse = this.toggleReverse.bind(this);
		this.toggleTrim = this.toggleTrim.bind(this);
		this.toggleFilter2 = this.toggleFilter2.bind(this);
		this.updateFilter2Type = this.updateFilter2Type.bind(this);
		this.updateFilter2Frequency = this.updateFilter2Frequency.bind(this);
		this.runChannelAction = this.runChannelAction.bind(this);
		}
		updatePan(value) {
			this.setState({ pan: value, panDisplay: panFormat(value) }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilterType(value) {
			var fil = this.state.filter;
			fil.type = value;
			this.setState({ filter: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilterFrequency(value) {
			var fil = this.state.filter;
			fil.frequency = value;
			this.setState({ filter: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilter2Type(value) {
			var fil = this.state.filter2;
			fil.type = value;
			this.setState({ filter2: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateFilter2Frequency(value) {
			var fil = this.state.filter2;
			fil.frequency = value;
			this.setState({ filter2: fil }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updateActive(value) {
			this.setState({ disabled: !value, disabledClass: !value ? 'disabled' : '' }, 
				function () {
					this.props.updateTrack(this.state.trackName,this.state);
				}
			);
		}
		updateVolume(value) {
			var amp = this.state.amp;
			amp.volume = value;
			this.setState({ amp: amp }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		updatePitch(value) {
			this.setState({ transpose: value }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleSettings(value) {
			var opn = this.state.settingsOpen;
			opn = !opn;
			this.setState({ settingsOpen: opn, settingsClass: opn ? '' : ' d-none' });
		}
		updateSettingsMode(value) {
			this.setState({ settingsMode: value || 'chan' });
		}
		toggleFilter(value) {
			this.setState({ filterOn: !this.state.filterOn }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleFilter2(value) {
			this.setState({ filter2On: !this.state.filter2On }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleReverse(value) {
			this.setState({ reverse: !this.state.reverse }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		toggleTrim(value) {
			this.setState({ trim: !this.state.trim }, function () {
				this.props.updateTrack(this.state.trackName,this.state);
			});
		}
		renderCell(i) {
			var indicator = '';
			var loc = stepFormat(i);
			if (this.state.steps[i]) { indicator = 'X'; }
			return <Cell bar={loc.bar} beat={loc.beat} tick={loc.tick} value={this.state.steps[i]} indicator={indicator} onClick={() => this.toggleCell(i)} key={i}/>;
		}
		cellRow(start,end) {
			var cells = [];
			for (var i = start; i <= end; i++) {
				cells.push(this.renderCell(i));
			}
			return cells;
		}
		toggleCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = !steps[i];
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
			// this.setState({pattern: pattern});
		}
		fillCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = true;
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
		}
		emptyCell(i) {
			const steps = this.state.steps.slice();
			steps[i] = false;
			this.setState({steps: steps});
			var track = this.state;
			track.steps = steps;
			this.props.updateTrack(track.trackName,track);
		}
		runChannelAction(event) {
			if (event.currentTarget.value) {
				this.state.actions[event.currentTarget.value](this);
			}
		}
		render() {
			return (
			<div className={this.state.disabledClass + " channel row no-gutters mb-3"}>
				<div className="col-1 d-none d-md-block text-left">
					<PowerButton switchedOn={true} className="d-inline-block" callback={this.updateActive} />
					<PowerButton switchedOn={false} className="d-inline-block gearIcon" callback={this.toggleSettings} />
					<ContextMenu open={false} className="d-inline-block channelActions"
						callback={this.runChannelAction}
					 	items={[
							{value: 'fill', label: 'Fill All Notes'},
							{value: 'fill2', label: 'Fill Every 2 Notes'},
							{value: 'fill4', label: 'Fill Every 4 Notes'},
							{value: 'fill8', label: 'Fill Every 8 Notes'},
							{value: 'clear', label: 'Clear All Notes', prompt: 'Are you Sure?'},
							{value: 'copy', label: 'Copy Pattern'},
							{value: 'paste', label: 'Paste Pattern'},
						]} />
				</div>
				<input className="col-12 col-sm-1" type="button" tabIndex="-1"  value={this.state.trackName} />
				<div className="col-1 d-none d-md-block text-center">
					<Range label="Pan" inputClass="pan col-8 px-0 mx-auto" meterClass="hidden" callback={this.updatePan} min="-100" value={this.state.pan} />
					<span className="pan-display">{this.state.panDisplay}</span>
				</div>
				<div className="col-1 d-none d-sm-block text-center">
					<Range label="Vol" min="-36" max="12" step=".1" value={this.state.amp.volume} orient="vertical" inputClass="volume px-0 mx-auto col-12 col-md-3 d-md-inline-block" meterClass="px-0 mx-auto col-12 col-md-9 d-block mt-2 mt-md-0 d-md-inline-block" callback={this.updateVolume} />
				</div>
				<div className="pattern-row col-12 col-sm-9 col-md-8">
					{this.cellRow(1,this.state.pattern.state.bars * 16)}
				</div>
				<div className="col-1 d-none d-md-block text-center">
				</div>
				<div className="col-12 d-none d-md-block">
					<div className={"container-fluid px-0 channel-options " + this.state.settingsClass + (this.state.filterOn ? ' filterOn' : '')}>
						<div className="row mx-auto">
							<div className="col-3">
								<label>Current Sample: {this.state.wav}</label>
								<FileSelector name="test-file" />
							</div>
							<div className="col-1 text-center">
								<PowerButton switchedOn={this.state.filterOn} label="Filter 1"  callback={this.toggleFilter} className="mx-auto" />
								<PowerButton switchedOn={this.state.filter2On} label="Filter 2"  callback={this.toggleFilter2} wrapperClass="mt-3" className="mx-auto" />
							</div>
				<div className="col-2">
					<OptionIndicator value={this.state.filter.type} disabled={!this.state.filterOn} options={[
						{key: 'LP', value: 'lp'},
						{key: 'BP', value: 'bp'},
						{key: 'HP', value: 'hp'}
					]} name={"filterType-"+this.state.trackName} label="Filter 1 Type" callback={this.updateFilterType} />
					<hr className="mb-4 mt-1" />
					<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilterFrequency} disabled={!this.state.filterOn} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter.frequency} />
				</div>
				<div className="col-2">
					<OptionIndicator value={this.state.filter2.type} disabled={!this.state.filter2On} options={[
						{key: 'LP', value: 'lp'},
						{key: 'BP', value: 'bp'},
						{key: 'HP', value: 'hp'}
					]} name={"filter2Type-"+this.state.trackName} label="Filter 2 Type" callback={this.updateFilter2Type} />
					<hr className="mb-4 mt-1" />
					<Range label="Cutoff Freq" className="mt-4 text-center" callback={this.updateFilter2Frequency} disabled={!this.state.filter2On} inputClass="freq col-8 px-0 mx-auto" min="30" max="22000" value={this.state.filter2.frequency} />
				</div>
							<div className="col-2 text-center">
								<Incrementer label="Transpose" callback={this.updatePitch} inputClass="transpose col-8 px-0 mx-auto" min="-48" max="48" value={this.state.transpose || "0"} />
								<PowerButton className="mt-2" switchedOn={this.state.reverse} label="Reverse" labelButton={true} callback={this.toggleReverse} />
								<PowerButton className="mt-2" switchedOn={this.state.trim} label="Trim" labelButton={true} callback={this.toggleTrim} />
							</div>
							<div className="col-2">
								<OptionIndicator layout="vertical" value={this.state.settingsMode} options={[
									{key: 'Chan', value: 'chan'},
									{key: 'Step', value: 'step'}
								]} name={"settingsMode-"+this.state.trackName} label="Settings Mode" callback={this.updateSettingsMode} />
							</div>
						</div>
					</div>
				</div>
			</div>
			);
		}

}

class AudioOut extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			source: props.source || null
		};
		this.updateSource = this.updateSource.bind(this);
	}
	updateSource(value) {
		this.setState({source: value});
	}
	render() {
		return (
			<div>
				<audio ref="audio" controls tabIndex="-1">
					<source src={this.state.source} />
				</audio>
			</div>
		)
	}
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
		var pattern = this;
		window.fetch('http://localhost:8081/', {
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
				<form onSubmit={this.handleSubmit} action="http://localhost:8081/">
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
				<AudioOut source={this.state.audioSource} ref={this.patternOut} />
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
			<div>
				<Pattern />
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Song />,
	document.getElementById('root')
);
