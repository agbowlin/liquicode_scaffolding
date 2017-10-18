"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_sanitize = require('sanitize-filename');

var npm_tingodb = require('tingodb')();


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
			else if (DocDatabase.Services.ServerConfig.database_engine == 'tingodb') {
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
									collection.count(Request.query,
										function(err, response) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												query: Request.query,
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
									report_error('Function not implemented!', Request.operation, EventName, Request.control.transaction_id);
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
									collection.insert(Request.query,
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

								else if (operation_name == 'remove') {
									if (!Request.query ||
										((Object.keys(Request.query).length == 0) &&
											(Request.query.constructor == Object)
										)
									) {
										report_error('Using Remove with an empty query is forbidden. Use RemoveAll instead.', Request.operation, EventName, Request.control.transaction_id);
										return;
									}
									collection.remove(Request.query,
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

								else if (operation_name == 'removeall') {
									collection.remove({},
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'save') {
									collection.update(Request.query,
										function(err, results) {
											if (err) {
												report_error(err, Request.operation, EventName, Request.control.transaction_id);
												return;
											}
											Socket.emit(EventName + '.' + Request.control.transaction_id, null, {
												control: Request.control,
												operation: Request.operation,
												document: Request.document,
												results: results
											});
											return;
										});
								}

								else if (operation_name == 'update') {
									collection.update(Request.query, Request.update,
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


		//=====================================================================
		//	Database Functions
		//=====================================================================

		Socket.on('DocDatabase.Shared.SubmitQuery',
			function(Request) {
				var event_name = 'DocDatabase.Shared.SubmitQuery';
				try {
					var collection_name = "system.shared";
					submit_query(event_name, collection_name, Request);
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
					var collection_name = 'member.' + npm_sanitize(Socket.MemberName.toLowerCase());
					submit_query(event_name, collection_name, Request);
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
