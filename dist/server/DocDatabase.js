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
		//	Initialization
		//=====================================================================

		// if (Logger) { Logger.LogTrace('Initializing database engine [' + DocDatabase.Services.ServerConfig.database_engine + ']'); }
		// if (DocDatabase.Services.ServerConfig.database_engine == 'mongodb') {}
		// else if (DocDatabase.Services.ServerConfig.database_engine == 'nedb') {}
		// else {
		// 	throw new Error('Unknown database engine: [' + DocDatabase.Services.ServerConfig.database_engine + '].');
		// }

		//=====================================================================
		//	Common Error Reporting
		//=====================================================================

		// function report_error(Err, Operation, EventName, CallbackID) {
		// 	// Construct the error object that we will be returning.
		// 	var error = {
		// 		event: EventName,
		// 		callback_id: CallbackID,
		// 		operation: Operation,
		// 		timestamp: Date.now(),
		// 		message: ''
		// 	};
		// 	if (!Err) { error.message = 'Unknown error.'; }
		// 	else if (Err.message) { error.message = Err.message; }
		// 	else { error.message = Err; }
		// 	// Output to the logger.
		// 	if (Logger) { Logger.LogError('Error in [' + EventName + '] during [' + Operation + ']: ', error); }
		// 	// Always send using the 'server_error' message.
		// 	Socket.emit('server_error', error);
		// 	// Propagate the error downstream to the caller.
		// 	if (CallbackID) { Socket.emit(EventName + '.' + CallbackID, error, null); }
		// 	// Return the error object.
		// 	return error;
		// }


		//=====================================================================
		//	Get Collection
		//=====================================================================

		// function get_collection(CollectionName, callback) {
		// 	if (Logger) { Logger.LogTrace('Opening database collection [' + CollectionName + ']'); }

		// 	if (DocDatabase.Services.ServerConfig.database_engine == 'mongodb') {
		// 		if (Logger) { Logger.LogTrace('Database engine = MongoDB'); }
		// 		try {
		// 			// Get the database server.
		// 			var database_server = new DocDatabase.DatabaseEngine.Db(
		// 				engine_config.path,
		// 				new DocDatabase.DatabaseEngine.Server(
		// 					engine_config.host,
		// 					engine_config.port,
		// 					engine_config.opts
		// 				), {
		// 					native_parser: false,
		// 					safe: true
		// 				}
		// 			);
		// 			// Open the database.
		// 			database_server.open(
		// 				function(err, database) {
		// 					if (err) {
		// 						callback(err, null);
		// 						return;
		// 					}
		// 					// Open the collection
		// 					database.collection(CollectionName,
		// 						function(err, collection) {
		// 							if (err) {
		// 								callback(err, null);
		// 								return;
		// 							}
		// 							// Return the collection.
		// 							callback(null, collection);
		// 						});
		// 				});
		// 		}
		// 		catch (err) {
		// 			callback(err, null);
		// 		}
		// 	}

		// 	else if (DocDatabase.Services.ServerConfig.database_engine == 'nedb') {
		// 		if (Logger) { Logger.LogTrace('Database engine = NeDB'); }
		// 		try {
		// 			// Get the collection.
		// 			npm_fs_extra.ensureDirSync(engine_config.path);
		// 			var collection_path = npm_path.join(engine_config.path, CollectionName);
		// 			var collection = new DocDatabase.DatabaseEngine({
		// 				filename: collection_path,
		// 				autoload: true
		// 			});
		// 			//***NOTE: We dont do anything with options for nedb at this point.
		// 			// Return the collection.
		// 			callback(null, collection);
		// 		}
		// 		catch (Err) {
		// 			callback(Err, null);
		// 		}
		// 	}

		// 	else {
		// 		callback(new Error('Unknown database engine: [' + DocDatabase.Services.ServerConfig.database_engine + '].'), null);
		// 	}
		// }


		//=====================================================================
		//	Submit Query
		//	Supports selected MongoDB and NeDB commands.
		//---------------------------------------------------------------------
		//	see: https://docs.mongodb.com/v2.4/reference/method/js-collection/
		//	see: https://github.com/louischatriot/nedb
		//---------------------------------------------------------------------
		//	- Count ( query, callback )
		//	- Find ( query, projection, callback )
		//	- FindAndModify ( ??? )
		//	- FindOne ( query, projection, callback )
		//	- Insert ( query, callback )
		//	- Remove ( query, options, callback )
		//	- RemoveAll ( callback ) (custom)
		//	- Save ( ??? )
		//	- Update ( query, update, options, callback )
		//=====================================================================

		// function submit_query(EventName, CollectionName, Request) {
		// 	try {
		// 		if (Logger) { Logger.LogDebug('Performing database operation [' + Request.operation + '] in collection [' + CollectionName + ']:', Request); }

		// 		// Open the Collection
		// 		get_collection(CollectionName,
		// 			function(err, collection) {
		// 				if (err) {
		// 					report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 					return;
		// 				}

		// 				// Perform Operation
		// 				var operation_name = Request.operation.toLowerCase();

		// 				if (operation_name == 'count') {
		// 					try {
		// 						collection.count(Request.query,
		// 							function(err, response) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									options: Request.options,
		// 									results: response
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'find') {
		// 					try {
		// 						collection.find(Request.query, Request.projection,
		// 							function(err, documents) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									projection: Request.projection,
		// 									results: documents
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'findone') {
		// 					try {
		// 						collection.findOne(Request.query, Request.projection,
		// 							function(err, results) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									projection: Request.projection,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'findandmodify') {
		// 					//TODO: This function needs to be tested. Maybe remove.
		// 					//TODO: Need to check the existence of these parameters.
		// 					collection.findAndModify(Request.query, Request.sort, Request.update, Request.options,
		// 						function(err, cursor) {
		// 							if (err) {
		// 								report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 								return;
		// 							}
		// 							cursor.toArray(
		// 								function(err, documents) {
		// 									if (err) {
		// 										report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 										return;
		// 									}
		// 									Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 										control: Request.control,
		// 										operation: Request.operation,
		// 										query: Request.query,
		// 										sort: Request.sort,
		// 										update: Request.update,
		// 										options: Request.options,
		// 										results: documents
		// 									});
		// 									return;
		// 								});
		// 							return;
		// 						});
		// 				}

		// 				else if (operation_name == 'insert') {
		// 					try {
		// 						collection.insert(Request.query,
		// 							function(err, results) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									options: Request.options,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'remove') {
		// 					try {
		// 						if (!Request.query ||
		// 							((Object.keys(Request.query).length == 0) &&
		// 								(Request.query.constructor == Object)
		// 							)
		// 						) {
		// 							report_error('Using Remove with an empty query is forbidden. Use RemoveAll instead.', Request.operation, EventName, Request.control.transaction_id);
		// 							return;
		// 						}
		// 						collection.remove(Request.query, { multi: true },
		// 							function(err, results) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									options: Request.options,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'removeall') {
		// 					try {
		// 						collection.remove({}, { multi: true },
		// 							function(err, results) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									options: Request.options,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'save') {
		// 					try {
		// 						collection.save(Request.query, Request.options,
		// 							function(err, results) {
		// 								if (err) { throw err; }
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									options: Request.options,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else if (operation_name == 'update') {
		// 					try {
		// 						collection.update(Request.query, Request.update, Request.options,
		// 							function(err, results) {
		// 								if (err) {
		// 									report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 									return;
		// 								}
		// 								Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
		// 									control: Request.control,
		// 									operation: Request.operation,
		// 									query: Request.query,
		// 									update: Request.update,
		// 									options: Request.options,
		// 									results: results
		// 								});
		// 								return;
		// 							});
		// 					}
		// 					catch (err) {
		// 						report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 						return;
		// 					}
		// 				}

		// 				else {
		// 					report_error('Unknown operation.', Request.operation, EventName, Request.control.transaction_id);
		// 				}
		// 			});
		// 	}
		// 	catch (err) {
		// 		report_error(err, Request.operation, EventName, Request.control.transaction_id);
		// 		return;
		// 	}

		// 	return;
		// }


		// function get_collection_path(MemberName, CollectionName) {
		// 	var collection_path = '';
		// 	collection_path += npm_sanitize(MemberName.toLowerCase());
		// 	if (CollectionName) {
		// 		collection_path += '@' + npm_sanitize(CollectionName.toLowerCase());
		// 	}
		// 	return collection_path;
		// }


		//=====================================================================
		//	Database Functions
		//=====================================================================

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
				Request.projection = Request.projection || null;
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


		Socket.on('DocDatabase.Shared.SubmitQuery',
			function(Request) {
				submit_query(Socket, 'DocDatabase.Shared.SubmitQuery', '_shared', Request);
				return;
			});


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
