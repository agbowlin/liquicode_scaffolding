//=====================================================================
//=====================================================================
/*
	server.js

	A simple example of how to use the liquicode_membership module.
	
	Run with: nodejs server.js {port}
*/
//=====================================================================
//=====================================================================

"use strict";

// Enable socket.io logging.
// process.env['DEBUG'] = 'socket.io* node myapp';

// Standard Includes
var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');
var npm_http = require('http');

// 3rd Party Includes
var npm_express = require('express');
var npm_socketio = require('socket.io');


//=====================================================================
//=====================================================================
//
//		Server Configuration
//
//=====================================================================
//=====================================================================

var Services = {
	ServerConfig: null,
	Logger: null,
	Membership: null,
	DocDatabase: null
};

// Load the server configuration from a file.
Services.ServerConfig = npm_fs_extra.readJsonSync('./app-server.config');


//=====================================================================
//=====================================================================
//
//		Logger
//
//=====================================================================
//=====================================================================

// Include the Logger module.
// Use the application name as the log group.
Services.Logger = require('./Logger.js').Logger(Services.ServerConfig.Application.application_name);

// Configure the logger with fields from the server configuration object.
if (Services.ServerConfig.Logger && Services.ServerConfig.Logger.LogTargets) {
	for (var index = 0; index < Services.ServerConfig.Logger.LogTargets.length; index++) {
		var log_definition = Services.ServerConfig.Logger.LogTargets[index];
		var log_target = Services.Logger.AddLogTarget(log_definition.log_device, log_definition.log_levels);
		// Options for all log targets.
		if (typeof log_definition.output_group != 'undefined') { log_target.output_group = log_definition.output_group; }
		if (typeof log_definition.output_date != 'undefined') { log_target.output_date = log_definition.output_date; }
		if (typeof log_definition.output_time != 'undefined') { log_target.output_time = log_definition.output_time; }
		if (typeof log_definition.output_milliseconds != 'undefined') { log_target.output_milliseconds = log_definition.output_milliseconds; }
		if (typeof log_definition.output_timezone != 'undefined') { log_target.output_timezone = log_definition.output_timezone; }
		if (typeof log_definition.output_severity != 'undefined') { log_target.output_severity = log_definition.output_severity; }
		if (typeof log_definition.output_severity_words != 'undefined') { log_target.output_severity_words = log_definition.output_severity_words; }
		// Options for 'file' log targets.
		if (typeof log_definition.log_path != 'undefined') { log_target.log_path = log_definition.log_path; }
		if (typeof log_definition.log_filename != 'undefined') { log_target.log_filename = log_definition.log_filename; }
		if (typeof log_definition.log_extension != 'undefined') { log_target.log_extension = log_definition.log_extension; }
		if (typeof log_definition.use_hourly_logfiles != 'undefined') { log_target.use_hourly_logfiles = log_definition.use_hourly_logfiles; }
		if (typeof log_definition.use_daily_logfiles != 'undefined') { log_target.use_daily_logfiles = log_definition.use_daily_logfiles; }
	}
}


//=====================================================================
//=====================================================================
//
//		Membership
//
//=====================================================================
//=====================================================================

// Include the membership module.
Services.Membership = require('./MembershipSocketIO.js');

// Configure Membership with fields from the server configuration object.
Services.Membership.ApplicationName = Services.ServerConfig.Application.application_name;
Services.Membership.RootFolder = npm_path.resolve(__dirname, Services.ServerConfig.Membership.members_folder);


//=====================================================================
//=====================================================================
//
//		Document Database
//
//=====================================================================
//=====================================================================

Services.DocDatabase = require('./DocDatabase.js')(Services);


//=====================================================================
//=====================================================================
//
//		Application Server
//
//=====================================================================
//=====================================================================

Services.AppServer = require('./app-server.js')(Services);


//=====================================================================
//=====================================================================
//
//		HTTP Server
//
//=====================================================================
//=====================================================================

// Create an Express router.
var ExpressRouter = npm_express();

// Define a static route for serving the client application files.
var ClientFolder = npm_path.resolve(__dirname, Services.ServerConfig.NodeServer.client_folder);
ExpressRouter.use(npm_express.static(ClientFolder));

// Create the HTTP server.
var HttpServer = npm_http.createServer(ExpressRouter);


//=====================================================================
//=====================================================================
//
//		Socket.IO Connections
//
//=====================================================================
//=====================================================================


// Socket.IO uses HttpServer as a transport.
var SocketIo = npm_socketio.listen(HttpServer);

// Maintain a list of connected sockets.
var HttpSockets = [];


//=====================================================================
//	Initialize a socket connection.
SocketIo.on('connection',
	function(Socket) {

		// Register this socket connection.
		HttpSockets.push(Socket);

		// Socket disconnection.
		Socket.on('disconnect',
			function() {
				// Unregister the socket.
				HttpSockets.splice(HttpSockets.indexOf(Socket), 1);
			});

		// Connect the services.
		Services.Membership.OnConnection(Socket);
		Services.DocDatabase.OnConnection(Socket);
		Services.AppServer.OnConnection(Socket);

		return;
	});


//=====================================================================
//	Broadcast a message to all connected sockets.
function broadcast(event, data) {
	HttpSockets.forEach(
		function(socket) {
			socket.emit(event, data);
		});
}


//=====================================================================
//=====================================================================
//
//		Run Http Server
//
//=====================================================================
//=====================================================================


// NodeJS startup settings.
var NodeJS_Address = process.env.IP ||Services. ServerConfig.NodeServer.server_address || "0.0.0.0";
var NodeJS_Port = process.env.PORT || Services.ServerConfig.NodeServer.server_port || 3000;

// Check override settings from command line parameters.
if (process.argv.length > 2) {
	NodeJS_Port = process.argv[2];
}


//==========================================
// Begin accepting connections.
HttpServer.listen(
	NodeJS_Port, NodeJS_Address,
	function() {
		var addr = HttpServer.address();
		console.log("Server listening at", addr.address + ":" + addr.port);
		console.log('Access application here: ' + addr.address + ":" + addr.port + '/index.html');
	});
