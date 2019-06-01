import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import AudioOut from './components/AudioOut.js';
import Range from './components/Range.js';
import OptionIndicator from './components/OptionIndicator.js';
import MultiModeOptionIndicator from './components/MultiModeOptionIndicator.js';
import ContextMenu from './components/ContextMenu.js';
import PowerButton from './components/PowerButton.js';
import MultiModePowerButton from './components/MultiModePowerButton.js';
import DropZone from './components/DropZone.js';
import DrumPad from './components/DrumPad.js';

class PadGroup extends React.Component {
	constructor(props) {
		super(props);
		this.sampleOut = React.createRef();
		this.state = { wav: null, slices: null, padRefs: {
			1: React.createRef(),
			2: React.createRef(),
			3: React.createRef(),
			4: React.createRef(),
			5: React.createRef(),
			6: React.createRef(),
			7: React.createRef(),
			8: React.createRef(),
			9: React.createRef(),
			10: React.createRef(),
			11: React.createRef(),
			12: React.createRef(),
			13: React.createRef(),
			14: React.createRef(),
			15: React.createRef(),
			16: React.createRef()
			}
		 };
		this.grooveServer = 'http://localhost:8081/';
		this.sendRequest = this.sendRequest.bind(this);
		this.filesAdded = this.filesAdded.bind(this);
	}
	renderDrumPad(i,padClass,wav) {
		var wavName = null;
		if (this.state.slices) {
			wavName = this.state.slices[i];
		}
		return <DrumPad group={this} wav={wavName} key={i} padKey={i} padClass={padClass} origWav={this.state.wav} />;
	}
	drumPadRow(start,end,className) {
		var pads = [];
		for (var i = start; i <= end; i++) {
			pads.push(this.renderDrumPad(i,className,null));
		}
		return pads;
	}
	sendRequest(file) {
		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("file", file);
			formData.append("filename", file.name);
			req.open("POST", this.grooveServer + "upload-splitter");
			req.send(formData);
			var padGroup = this;
			req.onload = function(e) {
				if (this.status == 200) {
					var wavImg = false;
					if (this.responseText) {
						var res = JSON.parse(this.responseText);
						if (res.img) {
							wavImg = res.img;
						}
						if (res.slices) {
							padGroup.setState({slices: res.slices});
							var refs = padGroup.state.padRefs || [];
							for (var i = 1;i < 16;i++) {
								if (res.slices[i]) {
									var padRefs = padGroup.state.padRefs;
									if (!padRefs) {
										padRefs = [];
									}
									// if(!padRefs[i]) {
									// 	padRefs[i] = React.createRef();
									// }
									padGroup.setState({ padRefs: padRefs });
								}
							}
						}
					}
					padGroup.setState({ wav: 'uploaded/' + file.name, wavName: file.name, wavImg: wavImg });
					padGroup.sampleOut.current.src = 'audio/'+padGroup.state.wav;
					padGroup.sampleOut.current.load();
					// padGroup.sampleOut.current.play();
				}
			}
		});
	}
	filesAdded(files) {
		for (var n = 0; n < files.length; n++) {
			this.sendRequest(files[n]);
		}
	}
	render() {
		return (
			<div>
				<DropZone parentObj={this} onFilesAdded={this.filesAdded} label="Upload Sample to Chop" />
				<AudioOut source={this.state.wav} passedRef={this.sampleOut} />
				<div className="container-fluid px-2">
					<div className="row">
						{this.drumPadRow(1,16,"col-3 p-2")}
					</div>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<PadGroup />,
	document.getElementById('root')
);