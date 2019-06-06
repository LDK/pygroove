import React, { Component } from 'react';
import PowerButton from '../PowerButton.js';
import DropZone from '../DropZone.js';
import PitchSelector from '../PitchSelector.js';
import MultiModePowerButton from '../MultiModePowerButton.js';
import Range from '../Range.js';

class SampleSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		var parentObj = this.props.parentObj;
		var props = this.props;
		return (
			<div className={props.containerClass}>
				<div className={(parentObj.state.settingsMode == 'step' ? 'd-none' : '')}>
					<label>Current Sample: {parentObj.state.wavName || parentObj.state.wav}</label>
					<DropZone parentObj={parentObj} onFilesAdded={parentObj.filesAdded} label="Upload Sample" />
				</div>
				<div className={(parentObj.state.settingsMode != 'step' ? 'd-none' : '')}>
					<label>Pitch: </label> {parentObj.state.steps[parentObj.state.selectedStep] ? parentObj.state.steps[parentObj.state.selectedStep].pitch : 'N/A'}
					<PitchSelector parentObj={parentObj} />
				</div>
				<div className="buttons-row text-center">
					<MultiModePowerButton 
						className="mt-2 mr-2"
						settingsMode={parentObj.state.settingsMode} 
						switchedOn={
							(
								parentObj.state.settingsMode == 'step' 
							) 
							? 
								(
									parentObj.state.steps[parentObj.state.selectedStep]
									? parentObj.state.steps[parentObj.state.selectedStep].reverse
									: false
								)
							: parentObj.state.reverse
						} 
						disabled={parentObj.state.settingsMode == 'step' && !parentObj.state.steps[parentObj.state.selectedStep]}
						label={(parentObj.state.reverse && parentObj.state.settingsMode=='step' ? 'Cancel ': '') + 'Rev.'}
						labelButton={true} callback={parentObj.toggleReverse}
					 />
					<PowerButton
						className={"mt-2 mr-2" + (parentObj.state.settingsMode=='step' ? ' d-none' : '')}
						switchedOn={parentObj.state.trim}
						label="Trim"
						labelButton={true}
						callback={parentObj.toggleTrim} 
					/>
					<PowerButton
						className={"mt-2" + (parentObj.state.settingsMode=='step' ? ' d-none' : '')}
						switchedOn={parentObj.state.normalize}
						label="Normalize"
						labelButton={true}
						callback={parentObj.toggleNormalize} 
					/>
				</div>
			</div>
		)
	}
}

export default SampleSection;
