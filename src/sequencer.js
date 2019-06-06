import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Pattern from './components/Pattern.js';

class Song extends React.Component {
	constructor(props) {
		super(props);
		this.grooveServer = 'http://localhost:8081/';
	}
	render() {
		return (
			<Pattern parentObj={this} />
		);
	}
}

// ========================================

ReactDOM.render(
	<Song />,
	document.getElementById('root')
);