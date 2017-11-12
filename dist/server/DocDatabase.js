"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_sanitize = require('sanitize-filename');



//---------------------------------------------------------------------
var ERR_DocDatabaseError = "Document Database Error.";


//---------------------------------------------------------------------
function DocDatabase(Services) {
	DocDatabase.Services = Services;
	return DocDatabase;
}


//=====================================================================
//=====================================================================
//
//		OnConnection
//
//=====================================================================
//=====================================================================

DocDatabase.OnInitialize =
	function OnInitialize() {
		var Logger = DocDatabase.Services.Logger;
		var ServerConfig = DocDatabase.Services.ServerConfig;

		// Ready the database engine.
		if (Logger) { Logger.LogTrace('Initializing database engine [' + ServerConfig.database_engine + ']'); }
		if (ServerConfig.database_engine == 'mongodb') {
			var engine_config = ServerConfig.database_engines.mongodb;
			DocDatabase.DocDatabaseEngine = require('./DocDatabaseEngine-MongoDB')(DocDatabase.Services, engine_config);
		}
		else if (DocDatabase.Services.ServerConfig.database_engine == 'nedb') {
			var engine_config = ServerConfig.database_engines.nedb;
			DocDatabase.DocDatabaseEngine = require('./DocDatabaseEngine-NeDB')(DocDatabase.Services, engine_config);
		}
		else {
			throw Error('Unknown database engine: [' + DocDatabase.Services.ServerConfig.database_engine + '].');
		}

		return;
	}


//=====================================================================
//=====================================================================
//
//		ReportError
//
//=====================================================================
//=====================================================================

//---------------------------------------------------------------------
DocDatabase.ReportError =
	function ReportError(Err, Operation, EventName, Socket, CallbackID) {
		var Logger = DocDatabase.Services.Logger;
		// Construct the error object that we will be returning.
		var error = {
			event: EventName,
			callback_id: CallbackID,
			operation: Operation,
			timestamp: Date.now(),
			message: ''
		};
		if (!Err) { error.message = 'Unknown error.'; }
		else if (Err.message) { error.message = Err.message; }
		else { error.message = Err; }
		// Output to the logger.
		if (Logger) { Logger.LogError('Error in [' + EventName + '] during [' + Operation + ']: ', error); }
		// Always send using the 'server_error' message.
		Socket.emit('server_error', error);
		// Propagate the error downstream to the caller.
		if (CallbackID) { Socket.emit(EventName + '.' + CallbackID, error, null); }
		// Return the error object.
		return error;
	};


//=====================================================================
//=====================================================================
//
//		OnConnection
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
DocDatabase.OnConnection =
	function OnConnection(Socket) {
		var Logger = DocDatabase.Services.Logger;


		//=====================================================================
		//	Database Functions
		//=====================================================================

		//---------------------------------------------------------------------
		function submit_query(Socket, EventName, MemberName, Request) {
			try {
				
				// Validate the inputs.
				if (!MemberName) { throw Error('Authentication Required'); }
				if (!Request) { throw Error('Request is missing.'); }
				if (!Request.collection) { throw Error('Collection name is missing.'); }
				if (typeof Request.collection != 'string') { throw Error('Collection name must be provided as a string.'); }
				if (!Request.operation) { throw Error('Operation is missing.'); }
				if (typeof Request.operation != 'string') { throw Error('Operation must be provided as a string.'); }
				Request.query = Request.query || {};
				Request.projection = Request.projection || {};
				Request.update = Request.update || null;
				Request.options = Request.options || null;

				// Construct the collection name.
				var collection_name = npm_sanitize(MemberName.toLowerCase());
				if (Request.collection) {
					collection_name += '@' + npm_sanitize(Request.collection.toLowerCase());
				}

				// Report.
				if (DocDatabase.Services.Logger) { DocDatabase.Services.Logger.LogDebug('Performing database operation [' + Request.operation + '] in collection [' + collection_name + ']:', Request); }

				// Submit the query.
				DocDatabase.DocDatabaseEngine.Query(
					collection_name,
					Request,
					function(err, response) {
						if (err) { throw err; }
						// Return the query result.
						Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
							control: Request.control,
							operation: Request.operation,
							query: Request.query,
							projection: Request.projection,
							update: Request.update,
							options: Request.options,
							results: response
						});
					});

			}
			catch (err) {
				DocDatabase.ReportError(err, Request.operation, EventName, Socket, Request.control.transaction_id);
			}
			return;
		}


		//---------------------------------------------------------------------
		Socket.on('DocDatabase.Shared.SubmitQuery',
			function(Request) {
				submit_query(Socket, 'DocDatabase.Shared.SubmitQuery', '_shared', Request);
				return;
			});


		//---------------------------------------------------------------------
		Socket.on('DocDatabase.Member.SubmitQuery',
			function(Request) {
				submit_query(Socket, 'DocDatabase.Member.SubmitQuery', Socket.MemberName, Request);
				return;
			});


		//---------------------------------------------------------------------
		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['DocDatabase'] = DocDatabase;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = DocDatabase;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = DocDatabase;
	}
}
