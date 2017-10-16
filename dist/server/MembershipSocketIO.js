"use strict";


var Membership = require('./Membership.js');


// function MembershipSocketIO() {
// 	return;

// }


//---------------------------------------------------------------------
var ERR_AuthenticationRequired = new Error("Authentication required.");
var ERR_SessionRequired = new Error("Session required.");
var ERR_InvalidSession = new Error("Invalid session.");


//---------------------------------------------------------------------
Membership.OnConnection =
	function OnConnection(Socket, Logger) {


		Membership.Socket = Socket;
		Membership.Logger = Logger;
		

		//=====================================================================
		//	Member Signup
		//=====================================================================

		Socket.on('Membership.MemberSignup',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberSignup] ... '); }
					var result = Membership.MemberSignup(Request.member_name, Request.member_email, Request.member_password);
					if (result) {
						Socket.MemberName = result.member_name;
						Socket.SessionID = result.session_id;
						Socket.emit('Membership.MemberSignup.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: result.session_id
							},
							member_data: result.member_data
						});
					}
					else {
						Socket.emit('Membership.MemberSignup.' + Request.control.transaction_id, new Error('MemberSignup failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberSignup]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.MemberSignup.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Member Login
		//=====================================================================

		Socket.on('Membership.MemberLogin',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogin] ... '); }
					var result = Membership.MemberLogin(Request.member_name, Request.member_password);
					if (result) {
						Socket.MemberName = result.member_name;
						Socket.SessionID = result.session_id;
						Socket.emit('Membership.MemberLogin.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: result.session_id
							},
							member_data: result.member_data
						});
					}
					else {
						Socket.emit('Membership.MemberLogin.' + Request.control.transaction_id, new Error('MemberLogin failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogin]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.MemberLogin.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Member Reconnect
		//=====================================================================

		Socket.on('Membership.MemberReconnect',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberReconnect] ... '); }
					var result = Membership.MemberReconnect(Request.member_name, Request.control.session_id);
					if (result) {
						Socket.MemberName = result.member_name;
						Socket.SessionID = result.session_id;
						Socket.emit('Membership.MemberReconnect.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: result.session_id,
							},
							member_data: result.member_data
						});
					}
					else {
						Socket.emit('Membership.MemberReconnect.' + Request.control.transaction_id, new Error('MemberReconnect failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberReconnect]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.MemberReconnect.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Member Logout
		//=====================================================================

		Socket.on('Membership.MemberLogout',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.MemberLogout] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.MemberLogout(Socket.MemberName);
					if (result) {
						Socket.MemberName = '';
						Socket.SessionID = '';
						Socket.emit('Membership.MemberLogout.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: result.session_id,
							},
							success: result.success
						});
					}
					else {
						Socket.emit('Membership.MemberLogout.' + Request.control.transaction_id, new Error('MemberLogout failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.MemberLogout]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.MemberLogout.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Get Member Data
		//=====================================================================

		Socket.on('Membership.GetMemberData',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.GetMemberData] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.GetMemberDataObject(Socket.MemberName);
					if (result) {
						Socket.emit('Membership.GetMemberData.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							member_data: result
						});
					}
					else {
						Socket.emit('Membership.GetMemberData.' + Request.control.transaction_id, new Error('GetMemberData failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.GetMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.GetMemberData.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Put Member Data
		//=====================================================================

		Socket.on('Membership.PutMemberData',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PutMemberData] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PutMemberDataObject(Socket.MemberName, Request.member_data);
					if (result) {
						Socket.emit('Membership.PutMemberData.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							success: result
						});
					}
					else {
						Socket.emit('Membership.PutMemberData.' + Request.control.transaction_id, new Error('PutMemberData failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PutMemberData]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PutMemberData.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path List
		//=====================================================================

		Socket.on('Membership.PathList',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathList] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathList(Socket.MemberName, Request.path, Request.recurse);
					if (result) {
						Socket.emit('Membership.PathList.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							items: result.items
						});
					}
					else {
						Socket.emit('Membership.PathList.' + Request.control.transaction_id, new Error('PathList failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathList]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathList.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path Read
		//=====================================================================

		Socket.on('Membership.PathRead',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathRead] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathRead(Socket.MemberName, Request.path);
					if (result) {
						Socket.emit('Membership.PathRead.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							content: result.content
						});
					}
					else {
						Socket.emit('Membership.PathRead.' + Request.control.transaction_id, new Error('PathRead failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathRead]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathRead.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path Write
		//=====================================================================

		Socket.on('Membership.PathWrite',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathWrite] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathWrite(Socket.MemberName, Request.path, Request.content);
					if (result) {
						Socket.emit('Membership.PathWrite.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							success: result.success
						});
					}
					else {
						Socket.emit('Membership.PathWrite.' + Request.control.transaction_id, new Error('PathWrite failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathWrite]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathWrite.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path Make
		//=====================================================================

		Socket.on('Membership.PathMake',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathMake] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathMake(Socket.MemberName, Request.path);
					if (result) {
						Socket.emit('Membership.PathMake.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							success: result.success
						});
					}
					else {
						Socket.emit('Membership.PathMake.' + Request.control.transaction_id, new Error('PathMake failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathMake]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathMake.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path Clean
		//=====================================================================

		Socket.on('Membership.PathClean',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathClean] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathClean(Socket.MemberName, Request.path);
					if (result) {
						Socket.emit('Membership.PathClean.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							success: result.success
						});
					}
					else {
						Socket.emit('Membership.PathClean.' + Request.control.transaction_id, new Error('PathClean failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathClean]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathClean.' + Request.control.transaction_id, err, null);
				}
			});


		//=====================================================================
		//	Path Delete
		//=====================================================================

		Socket.on('Membership.PathDelete',
			function(Request) {
				try {
					if (Logger) { Logger.LogTrace('Processing [Membership.PathDelete] ... '); }
					if (!Socket.MemberName) { throw ERR_AuthenticationRequired; }
					if (!Socket.SessionID) { throw ERR_SessionRequired; }
					if (Socket.SessionID != Request.control.session_id) { throw ERR_InvalidSession; }
					var result = Membership.PathDelete(Socket.MemberName, Request.path);
					if (result) {
						Socket.emit('Membership.PathDelete.' + Request.control.transaction_id, null, {
							control: {
								transaction_id: Request.control.transaction_id,
								session_id: Request.control.session_id,
							},
							path: result.path,
							success: result.success
						});
					}
					else {
						Socket.emit('Membership.PathDelete.' + Request.control.transaction_id, new Error('PathDelete failed.'), null);
					}
					return;
				}
				catch (err) {
					if (Logger) { Logger.LogError('Error in [Membership.PathDelete]: ', err); }
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
					Socket.emit('Membership.PathDelete.' + Request.control.transaction_id, err, null);
				}
			});


		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['Membership'] = Membership;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = Membership;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = Membership;
	}
}
