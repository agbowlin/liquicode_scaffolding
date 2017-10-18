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
		SubmitQuery: function(Operation, Query, Update, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: Operation,
					query: Query,
					update: Update
				},
				callback);
			return;
		},
		Count: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Count',
					query: Query
				},
				callback);
			return;
		},
		Find: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Find',
					query: Query
				},
				callback);
			return;
		},
		FindAndModify: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'FindAndModify',
					query: Query
				},
				callback);
			return;
		},
		FindOne: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'FindOne',
					query: Query
				},
				callback);
			return;
		},
		Insert: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Insert',
					query: Query
				},
				callback);
			return;
		},
		Remove: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Remove',
					query: Query
				},
				callback);
			return;
		},
		RemoveAll: function(callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'RemoveAll'
				},
				callback);
			return;
		},
		Save: function(Query, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Save',
					query: Query
				},
				callback);
			return;
		},
		Update: function(Query, Updates, callback) {
			do_database_call(Socket, DatabaseType, {
					operation: 'Save',
					query: Query,
					update: Updates
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
