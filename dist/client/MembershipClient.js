"use strict";


function MembershipClient() {
	return;
}


//---------------------------------------------------------------------
MembershipClient.GetMember =
	function GetMember(ScopeName, Socket, Cookies, MaxSessionLifetime) {

		var Member = {};

		//=====================================================================
		//	Initialize
		//=====================================================================

		Member.member_logged_in = '';
		Member.member_name = '';
		Member.session_id = '';
		Member.member_password = '';
		Member.member_data = null;

		if (Cookies) {
			Member.member_logged_in = Cookies.get(ScopeName + '.member_logged_in') || false;
			Member.member_name = Cookies.get(ScopeName + '.member_name') || '';
			Member.session_id = Cookies.get(ScopeName + '.session_id') || '';
		}


		//------------------------------------------
		function unique_id() {
			return Math.random().toString(36).substr(2, 9);
		}


		//=====================================================================
		//	Member Signup
		//=====================================================================

		Member.MemberSignup =
			function MemberSignup(callback) {

				// Check for requirements.
				if (!Member.member_name || !Member.member_password) {
					if (callback) { callback(new Error('No membership credentials provided.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.MemberSignup.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}

						if (!Response || !Response.control || !Response.control.session_id) {
							if (callback) { callback(new Error('Unable to establish a session.'), null); }
							return;
						}

						Member.member_logged_in = true;
						Member.session_id = Response.control.session_id;
						Member.member_data = Response.member_data;

						if (Cookies) {
							Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ScopeName + '.member_name', Member.member_name);
							Cookies.put(ScopeName + '.session_id', Member.session_id);
						}

						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.MemberSignup', {
					control: {
						transaction_id: transaction_id
					},
					member_name: Member.member_name,
					member_password: Member.member_password,
					member_email: Member.member_email
				});

				return;
			};


		//=====================================================================
		//	Member Login
		//=====================================================================

		Member.MemberLogin =
			function MemberLogin(callback) {

				// Check for requirements.
				if (!Member.member_name || !Member.member_password) {
					if (callback) { callback('No membership credentials provided.', null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.MemberLogin.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}

						if (!Response || !Response.control || !Response.control.session_id) {
							Member.member_logged_in = false;
							if (callback) { callback(new Error('Unable to establish a session.'), null); }
							return;
						}

						Member.member_logged_in = true;
						Member.session_id = Response.control.session_id;
						Member.member_data = Response.member_data;

						if (Cookies) {
							Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ScopeName + '.member_name', Member.member_name);
							Cookies.put(ScopeName + '.session_id', Member.session_id);
						}

						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.MemberLogin', {
					control: {
						transaction_id: transaction_id
					},
					member_name: Member.member_name,
					member_password: Member.member_password
				});

				return;
			};


		//=====================================================================
		//	Member Reconnect
		//=====================================================================

		Member.MemberReconnect =
			function MemberReconnect(callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.MemberReconnect.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}

						if (!Response || !Response.control || !Response.control.session_id) {
							Member.member_logged_in = false;
							if (callback) { callback(new Error('Unable to establish a session.'), null); }
							return;
						}

						Member.member_logged_in = true;
						Member.session_id = Response.control.session_id;
						Member.member_data = Response.member_data;

						if (Cookies) {
							Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ScopeName + '.member_name', Member.member_name);
							Cookies.put(ScopeName + '.session_id', Member.session_id);
						}

						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.MemberReconnect', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					member_name: Member.member_name
				});

				return;
			};


		//=====================================================================
		//	Member Logout
		//=====================================================================

		Member.MemberLogout =
			function MemberLogout(callback) {

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.MemberLogout.' + transaction_id,
					function(Err, Response) {
						// if (Err) {
						// 	if (callback) { callback(Err, null); }
						// 	return;
						// }

						Member.member_logged_in = false;
						Member.session_id = '';
						Member.member_password = '';
						Member.member_data = null;

						if (Cookies) {
							Cookies.remove(ScopeName + '.member_logged_in');
							Cookies.remove(ScopeName + '.session_id');
						}

						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.MemberLogout', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					}
				});

				return;
			};


		//=====================================================================
		//	Get Member Data
		//=====================================================================

		Member.GetMemberData =
			function GetMemberData(callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.GetMemberData.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}

						Member.member_data = Response.member_data;

						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.GetMemberData', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					}
				});

				return;
			};


		//=====================================================================
		//	Put Member Data
		//=====================================================================

		Member.PutMemberData =
			function PutMemberData(callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PutMemberData.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PutMemberData', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					member_data: Member.member_data
				});

				return;
			};


		//=====================================================================
		//	Path List
		//=====================================================================

		Member.PathList =
			function PathList(Path, Recurse, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathList.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(Err, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathList', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path,
					recurse: Recurse
				});

				return;
			};


		//=====================================================================
		//	Path Read
		//=====================================================================

		Member.PathRead =
			function PathRead(Path, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathRead.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathRead', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path
				});

				return;
			};


		//=====================================================================
		//	Path Write
		//=====================================================================

		Member.PathWrite =
			function PathWrite(Path, Content, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathWrite.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathWrite', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path,
					content: Content
				});

				return;
			};


		//=====================================================================
		//	Path Make
		//=====================================================================

		Member.PathMake =
			function PathMake(Path, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathMake.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathMake', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path
				});

				return;
			};


		//=====================================================================
		//	Path Clean
		//=====================================================================

		Member.PathClean =
			function PathClean(Path, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathClean.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathClean', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path
				});

				return;
			};


		//=====================================================================
		//	Path Delete
		//=====================================================================

		Member.PathDelete =
			function PathDelete(Path, callback) {

				// Check for requirements.
				if (!Member.session_id) {
					if (callback) { callback(new Error('No existing session found. Login required.'), null); }
					return;
				}

				// Start a new transaction.
				var transaction_id = 'TX-' + unique_id();

				// Set up the response handler.
				Socket.once('Membership.PathDelete.' + transaction_id,
					function(Err, Response) {
						if (Err) {
							if (callback) { callback(Err, null); }
							return;
						}
						if (callback) { callback(null, Response); }
						return;
					});

				// Invoke the function.
				Socket.emit('Membership.PathDelete', {
					control: {
						transaction_id: transaction_id,
						session_id: Member.session_id
					},
					path: Path
				});

				return;
			};


		return Member;
	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['MembershipClient'] = MembershipClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = MembershipClient;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = MembershipClient;
	}
}
