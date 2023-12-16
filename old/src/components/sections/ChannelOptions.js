import React, { Component } from 'react';
import OptionIndicator from '../widgets/OptionIndicator.js';
import FilterSection from './FilterSection.js';
import SampleSection from './SampleSection.js';
import ChannelPitchSection from './ChannelPitchSection.js';

class ChannelOptions extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var channel = this.props.channel;
		return (
			<section className={this.props.containerClass + " container-fluid px-0"}>
				<div className={"row mx-auto channel-options " + channel.state.settingsClass + ' ' + channel.state.settingsMode}>
					<SampleSection parentObj={channel} containerClass="col-4 text-center" />
					<FilterSection parentObj={channel} containerClass = "col-2 text-center"
						filterNumber={1} label="Filter 1"
						toggleCallback = {channel.toggleFilter}
						typeCallback = {channel.updateFilterType}
						freqCallback = {channel.updateFilterFrequency}
					/>
					<FilterSection parentObj={channel} containerClass = "col-2 text-center"
						filterNumber={2} label="Filter 2"
						toggleCallback = {channel.toggleFilter}
						typeCallback = {channel.updateFilterType}
						freqCallback = {channel.updateFilterFrequency}
					/>
					<ChannelPitchSection parentObj={channel} containerClass="col-2 text-center" />
					<OptionIndicator className="col-2" layout="vertical" 
						value={channel.state.settingsMode} 
						options={[
							{key: 'Chan', value: 'chan'},
							{key: 'Step', value: 'step'}
						]} 
						name={"settingsMode-"+channel.state.trackName} label="Settings Mode" 
						callback={channel.updateSettingsMode} 
					/>
				</div>
			</section>
		)
	}
}

export default ChannelOptions;