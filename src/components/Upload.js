import React, { Component } from 'react';
import DropZone from '../components/DropZone'
import cloneDeep from 'lodash/cloneDeep';

class Upload extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			files: [],
			uploading: false,
			uploadProgress: {},
			successfullyUploaded: false
		};
		this.onFilesAdded = this.onFilesAdded.bind(this);
		this.uploadFiles = this.uploadFiles.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		this.renderActions = this.renderActions.bind(this);
	}
	onFilesAdded(files) {
		this.setState(prevState => ({
			files: prevState.files.concat(files)
		}));
	}
	uploadFiles() {
	  this.setState({ uploadProgress: {}, uploading: true });
	  const promises = [];
	  this.state.files.forEach(file => {
	    promises.push(this.sendRequest(file));
	  });
	  try {
	    // await Promise.all(promises);

	    this.setState({ successfullyUploaded: true, uploading: false });
	  } catch (e) {
	    // Not Production ready! Do some error handling here instead...
	    this.setState({ successfullyUploaded: true, uploading: false });
	  }
	}
	sendRequest(file) {
		return new Promise((resolve, reject) => {
	  const req = new XMLHttpRequest();

	  req.upload.addEventListener("progress", event => {
	   if (event.lengthComputable) {
	    const copy = cloneDeep(this.state.uploadProgress);
	    copy[file.name] = {
	     state: "pending",
	     percentage: (event.loaded / event.total) * 100
	    };
	    this.setState({ uploadProgress: copy });
	   }
	  });
   
	  req.upload.addEventListener("load", event => {
  	    const copy = cloneDeep(this.state.uploadProgress);
	   copy[file.name] = { state: "done", percentage: 100 };
	   this.setState({ uploadProgress: copy });
	   resolve(req.response);
	  });
   
	  req.upload.addEventListener("error", event => {
  	    const copy = cloneDeep(this.state.uploadProgress);
	   copy[file.name] = { state: "error", percentage: 0 };
	   this.setState({ uploadProgress: copy });
	   reject(req.response);
	  });

	  const formData = new FormData();
	  formData.append("file", file, file.name);

	  req.open("POST", "http://localhost:8000/upload");
	  req.send(formData);
	 });
	}
	renderActions() {
	  if (this.state.successfullyUploaded) {
	    return (
	      <button
	        onClick={() =>
	          this.setState({ files: [], successfullyUploaded: false })
	        }
	      >
	        Clear
	      </button>
	    );
	  } else {
	    return (
	      <button
	        disabled={this.state.files.length < 0 || this.state.uploading}
	        onClick={this.uploadFiles}
	      >
	        Upload
	      </button>
	    );
	  }
	}	render() {
		// var label = this.props.label || 'Upload File';
		return (
			<div className="Upload">
				<span className="Title">Upload Files</span>
				<div className="Content">
					<div>
						<DropZone
							onFilesAdded={this.onFilesAdded}
							disabled={this.state.uploading || this.state.successfullyUploaded}
						/>
					</div>
					<div className="Files">
						{this.state.files.map(file => {
							return (
								<div key={file.name} className="Row">
									<span className="Filename">{file.name}</span>
									{this.renderProgress(file)}
								</div>
							);
						})}
					</div>
				</div>
				<div className="Actions">{this.renderActions()}</div>
			</div>
		)
	}
}

export default Upload;
