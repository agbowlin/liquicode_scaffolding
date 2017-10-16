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
		Member.status_message = '';

		if (Cookies) {
			Member.member_logged_in = Cookies.get(ScopeName + '.member_logged_in') || false;
			Member.member_name = Cookies.get(ScopeName + '.member_name') || '';
			Member.session_id = Cookies.get(ScopeName + '.session_id') || '';
		}

		//=====================================================================
		//	Member Signup
		//=====================================================================

		//==========================================
		Member.MemberSignup = function MemberSignup() {
			if (!Member.member_name) {
				Member.status_message = "No membership credentials provided.";
				return;
			}

			Member.status_message = "Generating membership ...";

			// Authenticate the member with the server.
			Socket.emit('Membership.MemberSignup', Member.member_name, Member.member_email, Member.member_password);
			return;
		};
		Member.OnMemberSignup = function OnMemberSignup(Success) {};
		Socket.on('Membership.MemberSignup_response', function(SessionID, MemberData) {
			if (!SessionID) {
				Member.status_message = "Unable to retrieve membership data.";
				Member.OnMemberSignup(false);
				return;
			}
			Member.status_message = "Signup succeeded for [" + Member.member_name + "].";
			Member.member_logged_in = true;
			Member.session_id = SessionID;
			Member.member_data = MemberData;
			if (Cookies) {
				Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
				Cookies.put(ScopeName + '.member_name', Member.member_name);
				Cookies.put(ScopeName + '.session_id', Member.session_id);
			}
			Member.OnMemberSignup(true);
			return;
		});


		//=====================================================================
		//	Member Login
		//=====================================================================

		//==========================================
		Member.MemberLogin = function MemberLogin() {
			Member.status_message = "Authenticating membership credentials ...";
			if (!Member.member_name) {
				Member.status_message = "No membership credentials provided.";
				return;
			}

			// Authenticate the member with the server.
			Socket.emit('Membership.MemberLogin', Member.member_name, Member.member_password);
			return;
		};
		Member.OnMemberLogin = function OnMemberLogin(Success) {};
		Socket.on('Membership.MemberLogin_response', function(SessionID, MemberData) {
			if (!SessionID) {
				Member.member_logged_in = false;
				Member.status_message = "Login failed.";
				Member.OnMemberLogin(false);
				return;
			}
			Member.status_message = "Logged in as [" + Member.member_name + "].";
			Member.member_logged_in = true;
			Member.session_id = SessionID;
			Member.member_data = MemberData;
			if (Cookies) {
				Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
				Cookies.put(ScopeName + '.member_name', Member.member_name);
				Cookies.put(ScopeName + '.session_id', Member.session_id);
			}
			Member.OnMemberLogin(true);
			return;
		});


		//==========================================
		Member.MemberReconnect = function MemberReconnect() {
			Member.status_message = "Reconnecting to existing session ...";
			if (!Member.session_id) {
				Member.status_message = "No existing session found. Login required.";
				return;
			}

			// Authenticate the member with the server.
			Socket.emit('Membership.MemberReconnect', Member.member_name, Member.session_id);
			return;
		};
		Member.OnMemberReconnect = function OnMemberReconnect(Success) {};
		Socket.on('Membership.MemberReconnect_response', function(SessionID, MemberData) {
			if (!SessionID) {
				Member.member_logged_in = false;
				Member.status_message = "Login failed.";
				Member.OnMemberReconnect(false);
				return;
			}
			Member.status_message = "Connected as [" + Member.member_name + "].";
			Member.member_logged_in = true;
			Member.session_id = SessionID;
			Member.member_data = MemberData;
			if (Cookies) {
				Cookies.put(ScopeName + '.member_logged_in', Member.member_logged_in);
				Cookies.put(ScopeName + '.member_name', Member.member_name);
				Cookies.put(ScopeName + '.session_id', Member.session_id);
			}
			Member.OnMemberReconnect(true);
			return;
		});


		//==========================================
		Member.MemberLogout = function MemberLogout() {
			Member.status_message = "Logging out ...";
			Socket.emit('Membership.MemberLogout');
			return;
		};
		Member.OnMemberLogout = function OnMemberLogout(Success) {};
		Socket.on('Membership.MemberLogout_response', function(Success) {
			if (!Success) {
				Member.status_message = "Logout failed.";
				Member.OnMemberLogout(false);
				return;
			}
			Member.status_message = "Logged out [" + Member.member_name + "].";
			Member.member_logged_in = false;
			Member.session_id = '';
			Member.member_password = '';
			Member.member_data = null;
			if (Cookies) {
				Cookies.remove(ScopeName + '.member_logged_in');
				Cookies.remove(ScopeName + '.session_id');
			}
			Member.OnMemberLogout(true);
			return;
		});


		//=====================================================================
		//	Member Data
		//=====================================================================

		//==========================================
		Member.GetMemberData = function GetMemberData() {
			Member.status_message = "Retrieving membership data ...";
			Socket.emit('Membership.GetMemberData');
			return;
		};
		Member.OnGetMemberData = function OnGetMemberData(MemberData) {};
		Socket.on('Membership.GetMemberData_response', function(MemberData) {
			if (!MemberData) {
				Member.status_message = "Unable to retrieve membership data.";
				Member.OnGetMemberData(false);
				return;
			}
			Member.status_message = "Retrieved membership data for [" + Member.member_name + "].";
			Member.member_data = MemberData;
			Member.OnGetMemberData(MemberData);
			return;
		});


		//==========================================
		Member.PutMemberData = function PutMemberData() {
			Member.status_message = "Updating membership data ...";
			Socket.emit('Membership.PutMemberData', Member.member_data);
			return;
		};
		Member.OnPutMemberData = function OnPutMemberData(Success) {};
		Socket.on('Membership.PutMemberData_response', function(Success) {
			if (!Success) {
				Member.status_message = "Unable to update membership data.";
				Member.OnPutMemberData(false);
				return;
			}
			Member.status_message = "Updated membership data for [" + Member.member_name + "].";
			Member.OnPutMemberData(true);
			return;
		});


		//=====================================================================
		//	Path
		//=====================================================================

		//==========================================
		Member.PathList = function PathList(Path, Recurse) {
			Member.status_message = "Retrieving path listing ...";
			Socket.emit('Membership.PathList', Path, Recurse);
			return;
		};
		Member.OnPathList = function OnPathList(Path, Items) {};
		Socket.on('Membership.PathList_response', function(Path, Items) {
			if (!Items) {
				Member.status_message = "Unable to retrieve path listing.";
				Member.OnPathList(Path, null);
				return;
			}
			Member.status_message = "Retrieved path listing for [" + Path + "].";
			Member.OnPathList(Path, Items);
			return;
		});


		//==========================================
		Member.PathRead = function PathRead(Path) {
			Member.status_message = "Retrieving path content ...";
			Socket.emit('Membership.PathRead', Path);
			return;
		};
		Member.OnPathRead = function OnPathRead(Path, Content) {};
		Socket.on('Membership.PathRead_response', function(Path, Content) {
			if (!Content) {
				Member.status_message = "Unable to retrieve path content.";
				Member.OnPathRead(Path, null);
				return;
			}
			Member.status_message = "Retrieved path content for [" + Path + "].";
			Member.OnPathRead(Path, Content);
			return;
		});


		//==========================================
		Member.PathWrite = function PathWrite(Path, Content) {
			Member.status_message = "Writing content ...";
			Socket.emit('Membership.PathWrite', Path, Content);
			return;
		};
		Member.OnPathWrite = function OnPathWrite(Path, Success) {};
		Socket.on('Membership.PathWrite_response', function(Path, Success) {
			Member.status_message = "Wrote content for [" + Path + "].";
			Member.OnPathWrite(Path, Success);
			return;
		});


		//==========================================
		Member.PathMake = function PathMake(Path) {
			Member.status_message = "Making path ...";
			Socket.emit('Membership.PathMake', Path);
			return;
		};
		Member.OnPathMake = function OnPathMake(Path, Success) {};
		Socket.on('Membership.PathMake_response', function(Path, Success) {
			Member.status_message = "Makeed path [" + Path + "].";
			Member.OnPathMake(Path, Success);
			return;
		});


		//==========================================
		Member.PathClean = function PathClean(Path) {
			Member.status_message = "Cleaning path ...";
			Socket.emit('Membership.PathClean', Path);
			return;
		};
		Member.OnPathClean = function OnPathClean(Path, Success) {};
		Socket.on('Membership.PathClean_response', function(Path, Success) {
			Member.status_message = "Cleaned path [" + Path + "].";
			Member.OnPathClean(Path, Success);
			return;
		});


		//==========================================
		Member.PathDelete = function PathDelete(Path) {
			Member.status_message = "Deleting path ...";
			Socket.emit('Membership.PathDelete', Path);
			return;
		};
		Member.OnPathDelete = function OnPathDelete(Path, Success) {};
		Socket.on('Membership.PathDelete_response', function(Path, Success) {
			Member.status_message = "Deleted path [" + Path + "].";
			Member.OnPathDelete(Path, Success);
			return;
		});


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
