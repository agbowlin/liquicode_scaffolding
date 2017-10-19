"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_sanitize = require('sanitize-filename');

var npm_tingodb = require('tingodb')();
var npm_nedb = require('nedb');


//---------------------------------------------------------------------
var ERR_DocDatabaseError = "Document Database Error.";


//---------------------------------------------------------------------
function DocDatabase(Services) {
	DocDatabase.Services = Services;
	DocDatabase.DatabaseEngine = null;
	DocDatabase.Database = null;
	return DocDatabase;
}


//=====================================================================
//=====================================================================
//
//		SOCKET
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
DocDatabase.OnConnection =
	function OnConnection(Socket) {


		//=====================================================================
		//	Common Error Reporting
		//=====================================================================

		function report_error(Err, Operation, EventName, CallbackID) {
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
			if (DocDatabase.Services.Logger) { DocDatabase.Services.Logger.LogError('Error in [' + EventName + '] during [' + Operation + ']: ', error); }
			// Always send using the 'server_error' message.
			Socket.emit('server_error', error);
			// Propagate the error downstream to the caller.
			if (CallbackID) { Socket.emit(EventName + '.' + CallbackID, error, null); }
			// Return the error object.
			return error;
		}


		//=====================================================================
		//	Get Database
		//=====================================================================

		function get_database() {
			if (DocDatabase.Database) {
				return DocDatabase.Database;
			}

			if (DocDatabase.Services.ServerConfig.database_engine == 'mongodb') {
				if (DocDatabase.Services.Logger) { DocDatabase.Services.Logger.LogTrace('Initializing database engine: MongoDB'); }
				DocDatabase.DatabaseEngine = require('mongodb');
				var engine_config = DocDatabase.Services.ServerConfig.database_engines.mongodb;
				DocDatabase.Database =
					new DocDatabase.DatabaseEngine.Db(
						engine_config.db,
						new DocDatabase.DatabaseEngine.Server(
							engine_config.host,
							engine_config.port,
							engine_config.opts
						), {
							native_parser: false,
							safe: true
						}
					);
				return DocDatabase.Database;
			}

			else if (DocDatabase.Services.ServerConfig.database_engine == 'nedb') {
				if (DocDatabase.Services.Logger) { DocDatabase.Services.Logger.LogTrace('Initializing database engine: NeDB'); }
				DocDatabase.DatabaseEngine = require('nedb');
				var engine_config = DocDatabase.Services.ServerConfig.database_engines.nedb;
				DocDatabase.Database =
					new DocDatabase.DatabaseEngine.Db(
						engine_config.path,
						engine_config.options
					);
				npm_fs_extra.ensureDirSync(engine_config.path);
				return DocDatabase.Database;
			}

			else if (DocDatabase.Services.ServerConfig.database_engine == 'tingodb') {
				if (DocDatabase.Services.Logger) { DocDatabase.Services.Logger.LogTrace('Initializing database engine: TingoDB'); }
				DocDatabase.DatabaseEngine = require('tingodb')({});
				var engine_config = DocDatabase.Services.ServerConfig.database_engines.tingodb;
				DocDatabase.Database =
					new DocDatabase.DatabaseEngine.Db(
						engine_config.path,
						engine_config.options
					);
				npm_fs_extra.ensureDirSync(engine_config.path);
				return DocDatabase.Database;
			}

			else {
				return null;
			}
		}


		//=====================================================================
		//	Get Collection
		//=====================================================================

		function get_collection(CollectionName, callback) {
			var logger = DocDatabase.Services.Logger;
			if (logger) { logger.LogTrace('Opening database collection [' + CollectionName + ']'); }

			if (DocDatabase.Services.ServerConfig.database_engine == 'mongodb') {
				if (logger) { logger.LogTrace('Database engine = MongoDB'); }
				try {
					// Ready the database engine.
					var engine_config = DocDatabase.Services.ServerConfig.database_engines.mongodb;
					DocDatabase.DatabaseEngine = require('mongodb');
					// Get the database server.
					var database_server = new DocDatabase.DatabaseEngine.Db(
						engine_config.db,
						new DocDatabase.DatabaseEngine.Server(
							engine_config.host,
							engine_config.port,
							engine_config.opts
						), {
							native_parser: false,
							safe: true
						}
					);
					// Open the database.
					database_server.open(
						function(err, database) {
							if (err) {
								callback(err, null);
								return;
							}
							// Open the collection
							database.collection(CollectionName,
								function(err, collection) {
									if (err) {
										callback(err, null);
										return;
									}
									// Return the collection.
									callback(null, collection);
								});
						});
				}
				catch (err) {
					callback(err, null);
				}
			}

			else if (DocDatabase.Services.ServerConfig.database_engine == 'nedb') {
				if (logger) { logger.LogTrace('Database engine = NeDB'); }
				try {
					// Ready the database engine.
					var engine_config = DocDatabase.Services.ServerConfig.database_engines.nedb;
					var engine = require('nedb');
					// Get the collection.
					var collection_path = npm_path.join(engine_config.path, CollectionName);
					npm_fs_extra.ensureDirSync(collection_path);
					var collection = new DocDatabase.DatabaseEngine({
						filename: collection_path,
						autoload: true
					});
					//***NOTE: We dont do anything with options for nedb at this point.
					// Return the collection.
					callback(null, collection);
				}
				catch (Err) {
					callback(Err, null);
				}
			}

			// else if (DocDatabase.Services.ServerConfig.database_engine == 'tingodb') {
			// 	if (logger) { logger.LogTrace('Initializing database engine: TingoDB'); }
			// 	DocDatabase.DatabaseEngine = require('tingodb')({});
			// 	var engine_config = DocDatabase.Services.ServerConfig.database_engines.tingodb;
			// 	DocDatabase.Database =
			// 		new DocDatabase.DatabaseEngine.Db(
			// 			engine_config.path,
			// 			engine_config.options
			// 		);
			// 	npm_fs_extra.ensureDirSync(engine_config.path);
			// 	return DocDatabase.Database;
			// }

			else {
				callback(new Error('Unknown database engine: [' + DocDatabase.Services.ServerConfig.database_engine + '].'), null);
			}
		}


		//=====================================================================
		//	Submit Query
		//	Supports selected Mongo commands from v2.4
		//	see: https://docs.mongodb.com/v2.4/reference/method/js-collection/
		//	- Count
		//	- Find
		//	- FindAndModify
		//	- FindOne
		//	- Insert
		//	- Remove
		//	- RemoveAll (custom)
		//	- Save
		//	- Update
		//=====================================================================

		function submit_query(EventName, CollectionName, Request) {
			try {
				get_database();

				if (DocDatabase.Services.Logger) {
					DocDatabase.Services.Logger.LogDebug('Performing database operation in collection [' + CollectionName + ']:', Request);
				}

				// Open Database
				DocDatabase.Database.open(
					function(err, database) {
						if (err) {
							report_error(err, Request.operation, EventName, Request.control.transaction_id);
							return;
						}

						// Open Collection
						database.collection(CollectionName,
							function(err, collection) {
								if (err) {
									report_error(err, Request.operation, EventName, Request.control.transaction_id);
									return;
								}

								// Perform Operation
								var operation_name = Request.operation.toLowerCase();

								if (operation_name == 'count') {
									collection.count(Request.query, Request.options,
										function(err, response) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												options: Request.options,
												results: response
											});
											return;
										});
								}

								else if (operation_name == 'find') {
									collection.find(Request.query,
										function(err, cursor) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											cursor.toArray(
												function(err, documents) {
													if (err) {
														report_error(err, Request.operation, EventName, Request.control.transaction_id);
														return;
													}
													Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
														control: Request.control,
														operation: Request.operation,
														query: Request.query,
														results: documents
													});
													return;
												});
											return;
										});
								}

								else if (operation_name == 'findandmodify') {
									collection.findAndModify(Request.query, Request.sort, Request.update, Request.options,
										function(err, cursor) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											cursor.toArray(
												function(err, documents) {
													if (err) {
														report_error(err, Request.operation, EventName, Request.control.transaction_id);
														return;
													}
													Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
														control: Request.control,
														operation: Request.operation,
														query: Request.query,
														sort: Request.sort,
														update: Request.update,
														options: Request.options,
														results: documents
													});
													return;
												});
											return;
										});
								}

								else if (operation_name == 'findone') {
									collection.findOne(Request.query,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'insert') {
									collection.insert(Request.query, Request.options,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												options: Request.options,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'remove') {
									if (!Request.query ||
										((Object.keys(Request.query).length == 0) &&
											(Request.query.constructor == Object)
										)
									) {
										report_error('Using Remove with an empty query is forbidden. Use RemoveAll instead.', Request.operation, EventName, Request.control.transaction_id);
										return;
									}
									collection.remove(Request.query, Request.options,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												options: Request.options,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'removeall') {
									collection.remove({}, Request.options,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												options: Request.options,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'save') {
									collection.save(Request.query, Request.options,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												options: Request.options,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'update') {
									collection.update(Request.query, Request.update, Request.options,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
												update: Request.update,
												options: Request.options,
												results: results
											});
											return;
										});
								}

								else {
									report_error('Unknown operation.', Request.operation, EventName, Request.control.transaction_id);
								}
							});
					});
			}
			catch (err) {
				report_error(err, Request.operation, EventName, Request.control.transaction_id);
				return;
			}

			return;
		}


		function get_collection_path(ApplicationName, MemberName, CollectionName) {
			var collection_path = '';
			collection_path = npm_sanitize(ApplicationName.toLowerCase());
			collection_path += '.' + npm_sanitize(MemberName.toLowerCase());
			if (CollectionName) {
				collection_path += '.' + npm_sanitize(CollectionName);
			}
			return collection_path;
		}


		//=====================================================================
		//	Database Functions
		//=====================================================================

		Socket.on('DocDatabase.Shared.SubmitQuery',
			function(Request) {
				var event_name = 'DocDatabase.Shared.SubmitQuery';
				try {
					var collection_path = get_collection_path(
						DocDatabase.Services.ServerConfig.Application.application_name,
						'_shared',
						Request.collection
					);
					submit_query(event_name, collection_path, Request);
				}
				catch (err) {
					report_error(err, Request.operation, event_name, Request.control.transaction_id);
				}
				return;
			});


		Socket.on('DocDatabase.Member.SubmitQuery',
			function(Request) {
				var event_name = 'DocDatabase.Member.SubmitQuery';
				if (!Socket.MemberName) {
					report_error('Authentication Required', Request.operation, event_name, Request.control.transaction_id);
					return;
				}
				try {
					var collection_path = get_collection_path(
						DocDatabase.Services.ServerConfig.application_name,
						Socket.MemberName,
						Request.collection
					);
					submit_query(event_name, collection_path, Request);
				}
				catch (err) {
					report_error(err, Request.operation, event_name, Request.control.transaction_id);
				}
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
