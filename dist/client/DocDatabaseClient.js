"use strict";


function DocDatabaseClient() {
	return;
}


//------------------------------------------
function unique_id() {
	return Math.random().toString(36).substr(2, 9);
}


//------------------------------------------
function do_database_call(Socket, DatabaseType, Request, callback) {

	// Start a new transaction.
	var transaction_id = 'TX-' + unique_id();

	// Set up the response handler.
	Socket.once('DocDatabase.' + DatabaseType + '.SubmitQuery.' + transaction_id,
		function(Err, Response) {
			if (callback) { callback(Err, Response); }
			return;
		});

	// Invoke the function.
	Request.control = {};
	Request.control.transaction_id = transaction_id;
	Socket.emit('DocDatabase.' + DatabaseType + '.SubmitQuery', Request);

	return;
}


//------------------------------------------
function get_database(Socket, DatabaseType) {
	return {

		//------------------------------------------
		Count: function(Collection, Query, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter for Count.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Count',
					query: Query
				},
				callback);
			return;
		},

		//------------------------------------------
		Find: function(Collection, Query, Projection, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter for Find.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Find',
					query: Query,
					projection: Projection
				},
				callback);
			return;
		},

		//------------------------------------------
		FindOne: function(Collection, Query, Projection, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter for FindOne.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'FindOne',
					query: Query,
					projection: Projection
				},
				callback);
			return;
		},

		//------------------------------------------
		Insert: function(Collection, Query, Options, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter Insert.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Insert',
					query: Query,
					options: Options
				},
				callback);
			return;
		},

		//------------------------------------------
		Remove: function(Collection, Query, Options, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter Remove.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Remove',
					query: Query,
					options: Options
				},
				callback);
			return;
		},

		//------------------------------------------
		RemoveAll: function(Collection, Options, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter for RemoveAll.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'RemoveAll',
					options: Options
				},
				callback);
			return;
		},

		//------------------------------------------
		Update: function(Collection, Query, Update, Options, callback) {
			if (typeof callback !== 'function') { throw Error('The callback function is a required parameter for Update.'); }
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Update',
					query: Query,
					update: Update,
					options: Options
				},
				callback);
			return;
		}
	};
}


//------------------------------------------
DocDatabaseClient.GetSharedDatabase =
	function GetSharedDatabase(Socket) {
		return get_database(Socket, 'Shared');
	};


//------------------------------------------
DocDatabaseClient.GetMemberDatabase =
	function GetMemberDatabase(Socket) {
		return get_database(Socket, 'Member');
	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['DocDatabaseClient'] = DocDatabaseClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = DocDatabaseClient;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = DocDatabaseClient;
	}
}
