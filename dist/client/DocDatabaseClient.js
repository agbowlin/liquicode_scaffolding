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
		SubmitQuery: function(Collection, Operation, Query, Sort, Projection, Update, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: Operation,
					query: Query,
					sort: Sort,
					projection: Projection,
					update: Update,
					options: Options
				},
				callback);
			return;
		},
		Count: function(Collection, Query, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Count',
					query: Query
				},
				callback);
			return;
		},
		Find: function(Collection, Query, Projection, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Find',
					query: Query,
					projection: Projection
				},
				callback);
			return;
		},
		FindOne: function(Collection, Query, Projection, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'FindOne',
					query: Query,
					projection: Projection
				},
				callback);
			return;
		},
		FindAndModify: function(Collection, Query, Sort, Update, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'FindAndModify',
					query: Query,
					sort: Sort,
					update: Update,
					options: Options
				},
				callback);
			return;
		},
		Insert: function(Collection, Query, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Insert',
					query: Query,
					options: Options
				},
				callback);
			return;
		},
		Remove: function(Collection, Query, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Remove',
					query: Query,
					options: Options
				},
				callback);
			return;
		},
		RemoveAll: function(Collection, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'RemoveAll',
					options: Options
				},
				callback);
			return;
		},
		Save: function(Collection, Query, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Save',
					query: Query,
					options: Options
				},
				callback);
			return;
		},
		Update: function(Collection, Query, Update, Options, callback) {
			do_database_call(Socket, DatabaseType, {
					collection: Collection,
					operation: 'Update',
					query: Query,
					update: Update,
					options: Options
				},
				callback);
			return;
		},
		_end_of_list_: true
	};
}


//------------------------------------------
DocDatabaseClient.GetSharedDatabase =
	function GetSharedDatabase(Socket) {
		return get_database(Socket, 'Shared');
		// return {
		// 	SubmitQuery: function SubmitQuery(Operation, Query, callback) {

		// 		// Start a new transaction.
		// 		var transaction_id = 'TX-' + unique_id();

		// 		// Set up the response handler.
		// 		Socket.once('DocDatabase.Shared.SubmitQuery.' + transaction_id,
		// 			function(Err, Response) {
		// 				if (callback) { callback(Err, Response); }
		// 				return;
		// 			});

		// 		// Invoke the function.
		// 		Socket.emit('DocDatabase.Shared.SubmitQuery', {
		// 			control: {
		// 				transaction_id: transaction_id,
		// 			},
		// 			operation: Operation,
		// 			query: Query
		// 		});

		// 		return;
		// 	}
		// }
	}


//------------------------------------------
DocDatabaseClient.GetMemberDatabase =
	function GetMemberDatabase(Socket) {
		return get_database(Socket, 'Member');
		// return {
		// 	SubmitQuery: function SubmitQuery(Operation, Query, callback) {

		// 		// Start a new transaction.
		// 		var transaction_id = 'TX-' + unique_id();

		// 		// Set up the response handler.
		// 		Socket.once('DocDatabase.Member.SubmitQuery.' + transaction_id,
		// 			function(Err, Response) {
		// 				if (callback) { callback(Err, Response); }
		// 				return;
		// 			});

		// 		// Invoke the function.
		// 		Socket.emit('DocDatabase.Member.SubmitQuery', {
		// 			control: {
		// 				transaction_id: transaction_id,
		// 			},
		// 			operation: Operation,
		// 			query: Query
		// 		});

		// 		return;
		// 	}
		// }
	}


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
