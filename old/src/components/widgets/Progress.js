import React, { Component } from 'react';
import DropZone from '../components/DropZone'

class Progress extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			progress: 0
		};
		this.onFilesAdded = this.onFilesAdded.bind(this);
	}
	onFilesAdded(files) {
		this.setState(prevState => ({
			files: prevState.files.concat(files)
		}));
	}
	render() {
		// var label = this.props.label || 'Progress File';
		return (
			<div className="ProgressBar">
				<div
					className="Progress"
					style={{ width: this.props.progress + '%' }}
				/>
			</div>
		)
	}
}

export default Progress;
