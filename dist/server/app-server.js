/* global Membership */

"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');
var npm_http = require('http');

var npm_sanitize = require('sanitize-filename');


//---------------------------------------------------------------------
var ERR_AppServerError = Error("Application Server Error.");


//---------------------------------------------------------------------
function AppServer(Services) {
	AppServer.Services = Services;
	return AppServer;
}


AppServer.Routers = [];


//=====================================================================
//=====================================================================
//
//		SOCKET
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
AppServer.OnConnection =
	function OnConnection(Socket) {


		//---------------------------------------------------------------------
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
			if (AppServer.Services.Logger) { AppServer.Services.Logger.LogError('Error in [' + EventName + ']: ', error); }
			// Always send using the 'server_error' message.
			Socket.emit('server_error', error);
			// Propagate the error downstream to the caller.
			if (CallbackID) { Socket.emit(EventName + '.' + CallbackID, error, null); }
			// Return the error object.
			return error;
		}


		//---------------------------------------------------------------------
		Socket.on('my_function',
			function(Request) {
				try {
					var temp = Request.Param1;
					Request.Param1 = Request.Param2;
					Request.Param2 = temp;
					Socket.emit('my_function.' + Request.control.transaction_id, null, {
						control: {
							transaction_id: Request.control.transaction_id,
							session_id: Request.control.session_id,
						},
						Param1: Request.Param1,
						Param2: Request.Param2,
						success: true
					});
					return;
				}
				catch (err) { report_error(err, 'my_function', Request.control.transaction_id); }
			});


		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['AppServer'] = AppServer;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = AppServer;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = AppServer;
	}
}
