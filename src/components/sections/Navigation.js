import React, { Component } from 'react';
import cloneDeep from 'lodash/cloneDeep';

class Navigation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userInput: '',
			passInput: ''
		};
		this.sendLogin = this.sendLogin.bind(this);
		this.updateUserInput = this.updateUserInput.bind(this);
		this.updatePassInput = this.updatePassInput.bind(this);
	}
	updateUserInput(event) {
		this.setState({userInput: event.target.value});
	}
	updatePassInput(event) {
		this.setState({passInput: event.target.value});
	}
	sendLogin(event) {
		event.preventDefault();
		console.log('u',this.state.userInput,'p',this.state.passInput);
		var song = this.props.song;
		var state = cloneDeep(this.state);
		var formData = new FormData();
		var props = this.props;
		formData.append('username',state.userInput);
		formData.append('password',state.passInput);
		window.fetch(song.grooveServer+'login', {
			method: 'POST', 
			body: formData
		})
		.then(function(data) {
			data.text().then(function(text) {
				var res = JSON.parse(text);
				if (props.loginCallback) {
					props.loginCallback(res);
				}
			});
		}).catch(function(error) {
			console.log('Request failed', error);
		});
	}
	render() {
		var song = this.props.song;
		var formClass = song.state.currentUser ? 'd-none' : '';
		var userClass = !song.state.currentUser ? 'd-none' : '';
		var username = song.state.currentUser.username;
		return (
			<div className="navigation row py-2 mb-2">
				<div className="col-7">
				</div>
				<div className="col-5 text-right">
					<form onSubmit={this.sendLogin} action={song.grooveServer+'login'} className={formClass}>
						<input type="text" value={this.state.userInput} onChange={this.updateUserInput} size="14" className="mr-2" name="username" placeholder="Username" />
						<input type="password" value={this.passInput} onChange={this.updatePassInput} name="password" size="14" className="mr-2" placeholder="Password" />
						<input type="submit" value="Go" size="3" onClick={this.sendLogin} />
					</form>
					<div className={userClass}>
						<span className="username">{username} is at work.</span>
					</div>
				</div>
			</div>
		)
	}
}

export default Navigation;
