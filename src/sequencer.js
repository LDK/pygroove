import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import Pattern from './components/Pattern.js';

class Song extends React.Component {
	render() {
		return (
			<Pattern />
		);
	}
}

// ========================================

ReactDOM.render(
	<Song />,
	document.getElementById('root')
);