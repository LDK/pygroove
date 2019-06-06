import React from 'react';
import ReactDOM from 'react-dom';
import cloneDeep from 'lodash/cloneDeep';
import 'whatwg-fetch';
import AudioOut from './components/AudioOut.js';
import Range from './components/Range.js';
import Pattern from './components/Pattern.js';

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