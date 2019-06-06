import React, { Component } from 'react';
import PowerButton from '../PowerButton.js';
import ContextMenu from '../ContextMenu.js';

class ChannelControls extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var channel = this.props.channel;

		return (
			<div className={this.props.containerClass}>
				<PowerButton switchedOn={true} className="d-inline-block" callback={channel.updateActive} />
				<PowerButton switchedOn={false} className="d-inline-block gearIcon" callback={channel.toggleSettings} />
				<ContextMenu open={false} className="d-inline-block channelActions"
					callback={channel.runChannelAction}
				 	items={[
						{value: 'fill', label: 'Fill All Notes'},
						{value: 'fill2', label: 'Fill Every 2 Notes'},
						{value: 'fill4', label: 'Fill Every 4 Notes'},
						{value: 'fill8', label: 'Fill Every 8 Notes'},
						{value: 'clear', label: 'Clear All Notes', prompt: 'Are you Sure?'},
						{value: 'copy', label: 'Copy Pattern'},
						{value: 'cut', label: 'Cut Pattern'},
						{value: 'paste', label: 'Paste Pattern'},
					]} />
			</div>
		)
	}
}

export default ChannelControls;