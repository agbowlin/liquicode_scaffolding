"use strict";


var Membership = require('./Membership.js');


// function MembershipSocketIO() {
// 	return;

// }


//---------------------------------------------------------------------
var ERR_AuthenticationRequired = "Authentication required.";
var ERR_SessionRequired = "Session required.";
var ERR_InvalidSession = "Invalid session.";


//---------------------------------------------------------------------
Membership.OnConnection =
	function OnConnection(Socket) {


		var Logger = Membership.Logger;


		//=====================================================================
		//	Common Error Reporting
		//=====================================================================

		function report_error(Err, EventName, CallbackID) {
			// Construct the error object that we will be returning.
			var error = {
				event: EventName,
				callback_id: CallbackID,
				timestamp: Date.now(),
				message: ''
			};
			if (!Err) { error.message = 'Unknown error.'; }
			else if (Err.message) { error.message = Err.message; }
			else { error.message = Err; }
			// Output to the logger.
			if (Logger) { Logger.LogError('Error in [' + EventName + ']: ', error); }
			// Always send using the 'server_error' message.
			Socket.emit('server_error', error);
			// Propagate the error downstream to the caller.
			if (CallbackID) { Socket.emit(EventName + '.' + CallbackID, error, null); }
			// Return the error object.
			return error;
		}


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
						// Socket.emit('Membership.MemberSignup.' + Request.control.transaction_id, 'MemberSignup failed.', null);
						report_error('MemberSignup failed.', 'Membership.MemberSignup', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.MemberSignup', Request.control.transaction_id); }
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
						// Socket.emit('Membership.MemberLogin.' + Request.control.transaction_id, 'MemberLogin failed.', null);
						report_error('MemberLogin failed.', 'Membership.MemberLogin', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.MemberLogin', Request.control.transaction_id); }
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
						// Socket.emit('Membership.MemberReconnect.' + Request.control.transaction_id, 'MemberReconnect failed.', null);
						report_error('MemberReconnect failed.', 'Membership.MemberReconnect', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.MemberReconnect', Request.control.transaction_id); }
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
						// Socket.emit('Membership.MemberLogout.' + Request.control.transaction_id, 'MemberLogout failed.', null);
						report_error('MemberLogout failed.', 'Membership.MemberLogout', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.MemberLogout', Request.control.transaction_id); }
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
						// Socket.emit('Membership.GetMemberData.' + Request.control.transaction_id, 'GetMemberData failed.', null);
						report_error('GetMemberData failed.', 'Membership.GetMemberData', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.GetMemberData', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PutMemberData.' + Request.control.transaction_id, 'PutMemberData failed.', null);
						report_error('PutMemberData failed.', 'Membership.PutMemberData', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PutMemberData', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathList.' + Request.control.transaction_id, 'PathList failed.', null);
						report_error('PathList failed.', 'Membership.PathList', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathList', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathRead.' + Request.control.transaction_id, 'PathRead failed.', null);
						report_error('PathRead failed.', 'Membership.PathRead', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathRead', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathWrite.' + Request.control.transaction_id, 'PathWrite failed.', null);
						report_error('PathWrite failed.', 'Membership.PathWrite', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathWrite', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathMake.' + Request.control.transaction_id, 'PathMake failed.', null);
						report_error('PathMake failed.', 'Membership.PathMake', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathMake', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathClean.' + Request.control.transaction_id, 'PathClean failed.', null);
						report_error('PathClean failed.', 'Membership.PathClean', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathClean', Request.control.transaction_id); }
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
						// Socket.emit('Membership.PathDelete.' + Request.control.transaction_id, 'PathDelete failed.', null);
						report_error('PathDelete failed.', 'Membership.PathDelete', Request.control.transaction_id);
					}
					return;
				}
				catch (err) { report_error(err, 'Membership.PathDelete', Request.control.transaction_id); }
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
