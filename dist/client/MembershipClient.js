"use strict";


function MembershipClient() {
	return;
}


//---------------------------------------------------------------------
MembershipClient.OnInitialize =
	function OnInitialize(ApplicationName, Socket, Cookies, MaxSessionLifetime) {

		var Member = {};

		//=====================================================================
		//	Initialize
		//=====================================================================

		Member.member_logged_in = false;
		Member.member_name = '';
		Member.session_id = '';
		Member.member_password = '';
		Member.member_data = null;

		if (Cookies) {
			// Member.member_logged_in = Cookies.get(ScopeName + '.member_logged_in') || false;
			Member.member_name = Cookies.get(ApplicationName + '.member_name') || '';
			Member.session_id = Cookies.get(ApplicationName + '.session_id') || '';
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
							// Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ApplicationName + '.member_name', Member.member_name);
							Cookies.put(ApplicationName + '.session_id', Member.session_id);
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
							// Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ApplicationName + '.member_name', Member.member_name);
							Cookies.put(ApplicationName + '.session_id', Member.session_id);
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
							// Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
							Cookies.put(ApplicationName + '.member_name', Member.member_name);
							Cookies.put(ApplicationName + '.session_id', Member.session_id);
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
							// Cookies.remove(ScopeName + '.member_logged_in');
							Cookies.remove(ApplicationName + '.session_id');
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
		//	Send Command
		//=====================================================================

		function send_command(RequiresSession, Command, Parameters, callback) {

			// Check for requirements.
			if (RequiresSession && !Member.session_id) {
				if (callback) { callback(Error('No existing session found. Login required.'), null); }
				return;
			}

			// Start a new transaction.
			var transaction_id = 'TX-' + unique_id();

			// Set up the one time response handler.
			Socket.once(Command + '.' + transaction_id,
				function(Err, Response) {
					if (callback) { callback(Err, Response); }
					return;
				});

			// Clone the command parameters and mark it with our control structure.
			var parameters = JSON.parse(JSON.stringify(Parameters));
			parameters.control = {
				transaction_id: transaction_id,
				session_id: Member.session_id
			};

			// Invoke the function.
			Socket.emit(Command, parameters);

			return;
		}


		//=====================================================================
		//	Path List
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathList =
			function PathList(Path, Recurse, callback) {
				send_command(
					true,
					'Membership.PathList', {
						path: Path,
						recurse: Recurse
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathList =
			function SharedPathList(Path, Recurse, callback) {
				send_command(
					true,
					'Membership.PathList', {
						use_shared_folder: true,
						path: Path,
						recurse: Recurse
					},
					callback
				);
				return;
			};


		//=====================================================================
		//	Path Read
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathRead =
			function PathRead(Path, callback) {
				send_command(
					true,
					'Membership.PathRead', {
						path: Path
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathRead =
			function SharedPathRead(Path, callback) {
				send_command(
					true,
					'Membership.PathRead', {
						use_shared_folder: true,
						path: Path
					},
					callback
				);
				return;
			};


		//=====================================================================
		//	Path Write
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathWrite =
			function PathWrite(Path, Content, callback) {
				send_command(
					true,
					'Membership.PathWrite', {
						path: Path,
						content: Content
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathWrite =
			function SharedPathWrite(Path, Content, callback) {
				send_command(
					true,
					'Membership.PathWrite', {
						use_shared_folder: true,
						path: Path,
						content: Content
					},
					callback
				);
				return;
			};


		//=====================================================================
		//	Path Make
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathMake =
			function PathMake(Path, callback) {
				send_command(
					true,
					'Membership.PathMake', {
						path: Path
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathMake =
			function SharedPathMake(Path, callback) {
				send_command(
					true,
					'Membership.PathMake', {
						use_shared_folder: true,
						path: Path
					},
					callback
				);
				return;
			};


		//=====================================================================
		//	Path Clean
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathClean =
			function PathClean(Path, callback) {
				send_command(
					true,
					'Membership.PathClean', {
						path: Path
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathClean =
			function SharedPathClean(Path, callback) {
				send_command(
					true,
					'Membership.PathClean', {
						use_shared_folder: true,
						path: Path
					},
					callback
				);
				return;
			};


		//=====================================================================
		//	Path Delete
		//=====================================================================

		//---------------------------------------------------------------------
		Member.PathDelete =
			function PathDelete(Path, callback) {
				send_command(
					true,
					'Membership.PathDelete', {
						path: Path
					},
					callback
				);
				return;
			};


		//---------------------------------------------------------------------
		Member.SharedPathDelete =
			function SharedPathDelete(Path, callback) {
				send_command(
					true,
					'Membership.PathDelete', {
						use_shared_folder: true,
						path: Path
					},
					callback
				);
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
