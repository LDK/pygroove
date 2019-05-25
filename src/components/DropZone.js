import React, { Component } from 'react';

class DropZone extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hightlight: false, waveformImg: false };
		this.fileInputRef = React.createRef();
		this.openFileDialog = this.openFileDialog.bind(this);
		this.onFilesAdded = this.onFilesAdded.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}
	openFileDialog() {
		if (this.props.disabled) return;
		this.fileInputRef.current.click();
	}
	fileListToArray(list) {
		const array = [];
		for (var i = 0; i < list.length; i++) {
			array.push(list.item(i));
		}
		return array;
	}
	onFilesAdded(event) {
		if (this.props.disabled) return;
		const files = event.target.files;
		if (this.props.onFilesAdded) {
			const array = this.fileListToArray(files);
			this.props.onFilesAdded(array);
		}
	}
	onDragOver(event) {
		event.preventDefault();
		if (this.props.disabled) return;
		this.setState({ hightlight: true });
	}
	onDragLeave() {
		this.setState({ hightlight: false });
	}
	onDrop(event) {
		event.preventDefault();
		if (this.props.disabled) return;
		const files = event.dataTransfer.files;
		if (this.props.onFilesAdded) {
			const array = this.fileListToArray(files);
			this.props.onFilesAdded(array);
		}
		this.setState({ hightlight: false });
	}
	render() {
		var label = this.props.label || 'Upload File';
		var parentObj = this.props.parentObj;
		return (
			<div
				className={`dropZone ${this.state.hightlight ? "highlight" : ""} ${this.props.parentObj.state.wavImg ? "waveform" : ""}`}
				onDragOver={this.onDragOver}
				onDragLeave={this.onDragLeave}
				onDrop={this.onDrop}
				onClick={this.openFileDialog}
				style={{ cursor: this.props.disabled ? "default" : "pointer" }}
				>
				<img
					alt="upload"
					className="icon"
					src={this.props.parentObj.state.wavImg ? this.props.parentObj.state.wavImg : "img/cloud-upload.svg"}
					width="75%"
				/>
				<input
					ref={this.fileInputRef}
					className="fileInput"
					type="file"
					multiple
					onChange={this.onFilesAdded}
				/>
				<span>{label}</span>
			</div>
		)
	}
}

export default DropZone;
