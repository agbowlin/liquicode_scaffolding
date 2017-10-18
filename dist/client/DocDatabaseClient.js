"use strict";


function DocDatabaseClient() {
	return;
}


//------------------------------------------
function unique_id() {
	return Math.random().toString(36).substr(2, 9);
}


//------------------------------------------
DocDatabaseClient.GetSharedDatabase =
	function GetSharedDatabase(Socket) {
		return {
			SubmitQuery: function SubmitQuery(Operation, Query, callback) {

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('DocDatabase.Shared.SubmitQuery.' + transaction_id,
					function(Err, Response) {
						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('DocDatabase.Shared.SubmitQuery', {
					control: {
						transaction_id: transaction_id,
					},
					operation: Operation,
					query: Query
				});

				return;
			}
		}
	}


//------------------------------------------
DocDatabaseClient.GetMemberDatabase =
	function GetMemberDatabase(Socket) {
		return {
			SubmitQuery: function SubmitQuery(Operation, Query, callback) {

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('DocDatabase.Member.SubmitQuery.' + transaction_id,
					function(Err, Response) {
						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('DocDatabase.Member.SubmitQuery', {
					control: {
						transaction_id: transaction_id,
					},
					operation: Operation,
					query: Query
				});

				return;
			}
		}
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
