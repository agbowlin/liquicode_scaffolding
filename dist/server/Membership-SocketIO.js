"use strict";

// var npm_path = require('path');
// var npm_fs = require('fs');
// var npm_exec = require('child_process').exec;

// For generating session ids and hashing passwords.
// var npm_crypto = require('crypto');

// var npm_string = require('string');

// For creating a folder name from a user name.
// var npm_sanitize = require('sanitize-filename');

// For some filesystem functions.
// var npm_fs_extra = require('fs-extra');

// For filesystem search functions.
// var npm_klaw_sync = require('klaw-sync');


function Membership_SocketIO() {
	return;

}


//---------------------------------------------------------------------
var ERR_AuthenticationRequired = new Error("Authentication required.");


//---------------------------------------------------------------------
Membership_SocketIO.WireSocketEvents =
	function WireSocketEvents(Membership, Socket, Logger) {


		//=====================================================================
		//	Member Signup, Login, Reconnect, Logout
		//=====================================================================

		Socket.on('Membership.MemberSignup',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberSignup] ... '); }
					var result = Membership.MemberSignup(MemberName, MemberEmail, MemberPassword);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberSignup_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberSignup]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberLogin',
			function(MemberName, MemberPassword) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogin] ... '); }
					var result = Membership.MemberLogin(MemberName, MemberPassword);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberLogin_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogin]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberReconnect',
			function(MemberName, SessionID) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberReconnect] ... '); }
					var result = Membership.MemberReconnect(MemberName, SessionID);
					if (result) {
						Socket.MemberName = MemberName;
					}
					Socket.emit('Membership.MemberReconnect_response', result.session_id, result.member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberReconnect]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.MemberLogout',
			function() {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogout] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var success = Membership.MemberLogout(Socket.MemberName);
					if (success) {
						Socket.MemberName = '';
					}
					Socket.emit('Membership.MemberLogout_response', success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogout]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Data
		//=====================================================================

		Socket.on('Membership.GetMemberData',
			function() {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.GetMemberData] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var member_data = Membership.GetMemberDataObject(Socket.MemberName);
					Socket.emit('Membership.GetMemberData_response', member_data);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.GetMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PutMemberData',
			function(MemberData) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PutMemberData] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var success = Membership.PutMemberDataObject(Socket.MemberName, MemberData);
					Socket.emit('Membership.PutMemberData_response', success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PutMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Path
		//=====================================================================

		Socket.on('Membership.PathList',
			function(Path, Recurse) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathList] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathList(Socket.MemberName, Path, Recurse);
					Socket.emit('Membership.PathList_response', result.path, result.items);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathList]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathRead',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathRead] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathRead(Socket.MemberName, Path);
					Socket.emit('Membership.PathRead_response', result.path, result.content);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathRead]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathWrite',
			function(Path, Content) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathWrite] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathWrite(Socket.MemberName, Path, Content);
					Socket.emit('Membership.PathWrite_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathWrite]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathMake',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathMake] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathMake(Socket.MemberName, Path);
					Socket.emit('Membership.PathMake_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathMake]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathClean',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathClean] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathClean(Socket.MemberName, Path);
					Socket.emit('Membership.PathClean_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathClean]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('Membership.PathDelete',
			function(Path) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathDelete] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					var result = Membership.PathDelete(Socket.MemberName, Path);
					Socket.emit('Membership.PathDelete_response', result.path, result.success);
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathDelete]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	End of WireSocketEvents
		//=====================================================================

		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['Membership_SocketIO'] = Membership_SocketIO;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = Membership_SocketIO;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = Membership_SocketIO;
	}
}
