//=====================================================================
//=====================================================================
/*
	Adds RSVP promises to the Membership Client API.
	
	Include this file and call WireMembershipWithRsvpPromises()
	on new Member objects.
*/
//=====================================================================
//=====================================================================

"use strict";

/* global RSVP */
// var RSVP = require('rsvp');


function MembershipClientRsvp() {
	return;
}

MembershipClientRsvp.WireMembershipWithRsvpPromises =
	function WireMembershipWithRsvpPromises(Member) {

		Member.MemberSignup_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.OnMemberSignup = function(Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
					Member.MemberSignup();
				}
			);
		};

		Member.MemberLogin_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberLogin();
					Member.OnMemberLogin = function(Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.MemberReconnect_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberReconnect();
					Member.OnMemberReconnect = function(Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.MemberLogout_Promise = function() {
			return new Promise(
				function(resolve, reject) {
					Member.MemberLogout();
					Member.OnMemberLogout = function(Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.GetMemberData_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.GetMemberData();
					Member.OnGetMemberData = function(MemberData) {
						if (MemberData) {
							resolve(MemberData);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PutMemberData_Promise = function() {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PutMemberData();
					Member.OnPutMemberData = function(Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathList_Promise = function(Path, Recurse) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathList(Path, Recurse);
					Member.OnPathList = function(Path, Items) {
						if (Items) {
							resolve(Items);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathRead_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathRead(Path);
					Member.OnPathRead = function(Path, Content) {
						if (Content) {
							resolve(Content);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathWrite_Promise = function(Path, Content) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathWrite(Path, Content);
					Member.OnPathWrite = function(Path, Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathMake_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathMake(Path);
					Member.OnPathMake = function(Path, Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathClean_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathClean(Path);
					Member.OnPathClean = function(Path, Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

		Member.PathDelete_Promise = function(Path) {
			return new RSVP.Promise(
				function(resolve, reject) {
					Member.PathDelete(Path);
					Member.OnPathDelete = function(Path, Success) {
						if (Success) {
							resolve(true);
						}
						else {
							reject(false);
						}
					};
				}
			);
		};

	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['MembershipClientRsvp'] = MembershipClientRsvp;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = MembershipClientRsvp;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = MembershipClientRsvp;
	}
}
