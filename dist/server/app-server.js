/* global Membership */

"use strict";

var npm_path = require('path');
var npm_fs_extra = require('fs-extra');
var npm_http = require('http');


//---------------------------------------------------------------------
function AppServer(Membership) {
	return AppServer;
}


//---------------------------------------------------------------------
var ERR_AppServerError = new Error("Application Server Error.");


//---------------------------------------------------------------------
AppServer.OnConnection =
	function OnConnection(Membership) {

		Membership.Socket.on('my_function',
			function(Param1, Param2) {
				var response = {};
				try {
					response.Param1 = Param1;
					response.Param2 = Param2;
					Membership.Socket.emit('my_function_response', response);
				}
				catch (err) {
					console.error('Error in [my_function]: ', err);
					Membership.Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
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
