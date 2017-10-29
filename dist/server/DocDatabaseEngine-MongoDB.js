"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_sanitize = require('sanitize-filename');

var npm_mongodb = require('mongodb');


//=====================================================================
//=====================================================================
//
//		Initialization
//
//=====================================================================
//=====================================================================


function DocDatabaseEngine(Services, EngineConfig) {
	DocDatabaseEngine.Services = Services;
	DocDatabaseEngine.EngineConfig = EngineConfig;
	return DocDatabaseEngine;
}


//=====================================================================
//=====================================================================
//
//		Query
//
//	Supports selected MongoDB commands.
//---------------------------------------------------------------------
//	see: https://docs.mongodb.com/v2.4/reference/method/js-collection/
//---------------------------------------------------------------------
//	- Count ( query, callback )
//	- Find ( query, projection, callback )
//	- FindOne ( query, projection, callback )
//	- Insert ( query, callback )
//	- Remove ( query, options, callback )
//	- RemoveAll ( callback ) (custom)
//	- Update ( query, update, options, callback )
//=====================================================================
//=====================================================================


DocDatabaseEngine.Query =
	function Query(CollectionName, Request, callback) {

		var url = 'mongodb://';
		if (DocDatabaseEngine.EngineConfig.username) {
			url += DocDatabaseEngine.EngineConfig.username;
			if (DocDatabaseEngine.EngineConfig.password) {
				url += ':' + DocDatabaseEngine.EngineConfig.password;
			}
			url += '@';
		}
		url += DocDatabaseEngine.EngineConfig.host;
		url += ':' + DocDatabaseEngine.EngineConfig.port;
		url += '/' + DocDatabaseEngine.EngineConfig.database;

		// //------------------------------------------
		// // Define the database server.
		// var mongo_server = npm_mongodb.Server(
		// 	DocDatabaseEngine.EngineConfig.host,
		// 	DocDatabaseEngine.EngineConfig.port,
		// 	DocDatabaseEngine.EngineConfig.opts
		// );

		// //------------------------------------------
		// // Get a database instance.
		// // var database_name = DocDatabaseEngine.Services.ServerConfig.Application.application_name;
		// // database_name = database_name.toLowerCase();
		// // database_name = database_name.replace('.', "_");
		// // database_name = npm_sanitize(database_name);
		// var database = npm_mongodb.Db(
		// 	database_name,
		// 	mongo_server, {
		// 		native_parser: false,
		// 		safe: true
		// 	});

		// //------------------------------------------
		// // Open the database.
		// database.open(
		npm_mongodb.connect(url,
			function(err, database) {
				if (err) { callback(err, null); return; }

				//------------------------------------------
				// Open the collection.
				database.collection(CollectionName,
					function(err, collection) {
						if (err) {
							callback(err, null);
							database.close();
							return;
						}

						//------------------------------------------
						// Perform the operation.
						var operation_name = Request.operation.toLowerCase();

						//------------------------------------------
						if (operation_name == 'count') {
							collection.count(
								Request.query,
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'find') {
							collection.find(
								Request.query,
								Request.projection,
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										response.toArray(
											function(err, response) {
												callback(err, response);
												database.close();
											});
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'findone') {
							collection.findOne(
								Request.query,
								Request.projection,
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'insert') {
							collection.insert(
								Request.query,
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'remove') {
							if (!Request.query ||
								((Object.keys(Request.query).length == 0) &&
									(Request.query.constructor == Object)
								)
							) {
								database.close();
								callback(Error('Using Remove with an empty query is forbidden. Use RemoveAll instead.'), null);
								return;
							}
							collection.remove(
								Request.query, { multi: true },
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response.result);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'removeall') {
							collection.remove({}, { multi: true },
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response.result);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else if (operation_name == 'update') {
							collection.update(
								Request.query,
								Request.update,
								Request.options,
								function(err, response) {
									if (err) {
										database.close();
										callback(err, null);
									}
									else {
										callback(null, response.result);
										database.close();
									}
									return;
								});
						}

						//------------------------------------------
						else {
							callback(Error('Unknown command [' + Request.operation + ']'));
						}

					});

			});

		return;
	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['DocDatabaseEngine'] = DocDatabaseEngine;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = DocDatabaseEngine;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = DocDatabaseEngine;
	}
}
