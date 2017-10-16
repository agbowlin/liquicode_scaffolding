"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
// var npm_exec = require('child_process').exec;

// For generating session ids and hashing passwords.
var npm_crypto = require('crypto');

// var npm_string = require('string');

// For creating a folder name from a user name.
var npm_sanitize = require('sanitize-filename');

// For some filesystem functions.
var npm_fs_extra = require('fs-extra');

// For filesystem search functions.
var npm_klaw_sync = require('klaw-sync');


function Membership() {
	return;
}


//---------------------------------------------------------------------
Membership.ApplicationName = 'default';
Membership.RootFolder = npm_path.resolve(__dirname, 'members');
Membership.PASSWORDS_USE_SALTED_HASH = true;


//---------------------------------------------------------------------
var ERR_IllegalPathAccess = new Error("Illegal path access.");
var ERR_CannotRemoveRootFolder = new Error("Cannot remove root folder.");


//---------------------------------------------------------------------
function get_member_path(MemberName) {
	var name = npm_sanitize(MemberName.toLowerCase());
	var path = npm_path.join(Membership.RootFolder, name);
	return path;
}


//---------------------------------------------------------------------
function get_member_application_path(MemberName) {
	var name = npm_sanitize(Membership.ApplicationName.toLowerCase());
	var path = npm_path.join(get_member_path(MemberName), name);
	return path;
}


//---------------------------------------------------------------------
function get_member_object(MemberName) {
	// Get the Member Object filename.
	var filename = get_member_path(MemberName);
	filename = npm_path.join(filename, 'member.json');
	if (!npm_fs.existsSync(filename)) {
		return null;
	}
	// Read the Member Object.
	var member = JSON.parse(npm_fs.readFileSync(filename));
	return member;
}


//---------------------------------------------------------------------
function put_member_object(MemberName, Member) {
	// Get the Member Object filename.
	var filename = get_member_path(MemberName);
	npm_fs_extra.ensureDirSync(filename);
	// Write the Member Object.
	filename = npm_path.join(filename, 'member.json');
	npm_fs_extra.outputFileSync(filename, JSON.stringify(Member, null, 4));
	return;
}


//---------------------------------------------------------------------
Membership.GetMemberDataObject =
	function GetMemberDataObject(MemberName) {
		// Get the Member Data Object filename.
		var filename = get_member_path(MemberName);
		filename = npm_path.join(filename, 'member-data.json');
		if (!npm_fs.existsSync(filename)) {
			return null;
		}
		// Read the Member Data Object.
		var member = JSON.parse(npm_fs.readFileSync(filename));
		return member;
	};


//---------------------------------------------------------------------
Membership.PutMemberDataObject =
	function PutMemberDataObject(MemberName, MemberData) {
		// Get the Member Data Object filename.
		var filename = get_member_path(MemberName);
		filename = npm_path.join(filename, 'member-data.json');
		// Write the Member Data Object.
		npm_fs_extra.outputFileSync(filename, JSON.stringify(MemberData, null, 4));
		return true;
	};


//---------------------------------------------------------------------
// FROM: https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length) {
	return npm_crypto.randomBytes(Math.ceil(length / 2))
		.toString('hex') /** convert to hexadecimal format */
		.slice(0, length); /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt) {
	var hash = npm_crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	};
};


//---------------------------------------------------------------------
Membership.MemberSignup =
	function MemberSignup(MemberName, MemberEmail, MemberPassword) {

		// Check if member already exists.
		if (get_member_object(MemberName)) {
			return false;
		}

		// Generate a new Member Data object.
		var member = {};
		member.credentials = {};
		member.credentials.member_name = MemberName;
		member.credentials.member_email = MemberEmail;
		if (this.PASSWORDS_USE_SALTED_HASH) {
			var passwordData = sha512(MemberPassword, genRandomString(16));
			member.credentials.member_password_salt = passwordData.salt;
			member.credentials.member_password_hash = passwordData.passwordHash;
		}
		else {
			member.credentials.member_password = MemberPassword;
		}

		// Create a new session.
		member.session = {};
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		put_member_object(MemberName, member);

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": {}
		};
	};


//---------------------------------------------------------------------
Membership.MemberLogin =
	function MemberLogin(MemberName, MemberPassword) {

		// Read the Member object.
		var member = get_member_object(MemberName);
		if (!member) {
			return false;
		}

		// Authenticate
		if (this.PASSWORDS_USE_SALTED_HASH) {
			var passwordData = sha512(MemberPassword, member.credentials.member_password_salt);
			if (member.credentials.member_password_hash != passwordData.passwordHash) {
				return false;
			}
		}
		else {
			if (MemberPassword != member.credentials.member_password) {
				return false;
			}
		}

		// Create a new session.
		member.session = {};
		member.session.session_id = npm_crypto.randomBytes(16).toString("hex");

		// Write the Member object.
		put_member_object(MemberName, member);

		// Read the Member data object.
		var member_data = Membership.GetMemberDataObject(MemberName);
		member_data = member_data || {};

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member_data
		};
	};


//---------------------------------------------------------------------
Membership.MemberReconnect =
	function MemberReconnect(MemberName, SessionID) {

		// Read the Member object.
		var member = get_member_object(MemberName);
		if (!member) {
			return false;
		}

		// Authenticate
		if (SessionID != member.session.session_id) {
			return false;
		}

		// Read the Member data object.
		var member_data = Membership.GetMemberDataObject(MemberName);
		member_data = member_data || {};

		// Return the Member Data object.
		return {
			"session_id": member.session.session_id,
			"member_data": member_data
		};
	};


//---------------------------------------------------------------------
Membership.MemberLogout =
	function MemberLogout(MemberName) {

		// Read the Member object.
		var member = get_member_object(MemberName);
		if (!member) {
			return false;
		}

		// Destroy the session.
		member.session = {};

		// Write the Member object.
		put_member_object(MemberName, member);

		// Return Success
		return true;
	};


//---------------------------------------------------------------------
Membership.PathList =
	function PathList(MemberName, Path, Recurse) {
		var app_path = get_member_application_path(MemberName);
		var item_root = npm_path.join(app_path, Path);
		if (item_root.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		var items = [];
		if (npm_fs.existsSync(item_root)) {
			if (Recurse) {
				npm_klaw_sync(item_root).forEach(
					function(path) {
						if (!path.stats.isFile()) {
							path.path += '/';
						}
						var item = path.path.slice(item_root.length);
						items.push(item);
					});
			}
			else {
				npm_fs.readdirSync(item_root).forEach(
					function(item) {
						var path = npm_path.join(item_root, item);
						var stat = npm_fs.lstatSync(path);
						if (!stat.isFile()) {
							item += '/';
						}
						items.push(item);
					});
			}
		}
		// return items;
		return {
			"path": Path,
			"items": items
		};
	};


//---------------------------------------------------------------------
Membership.PathRead =
	function PathRead(MemberName, Path) {
		var app_path = get_member_application_path(MemberName);
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		// var content = npm_fs.readFileSync(item_path);
		var content = {};
		if (npm_fs.existsSync(item_path)) {
			content = npm_fs_extra.readJsonSync(item_path);
		}
		return {
			"path": Path,
			"content": content
		};
	};


//---------------------------------------------------------------------
Membership.PathWrite =
	function PathWrite(MemberName, Path, Content) {
		var app_path = get_member_application_path(MemberName);
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		// npm_fs_extra.outputFileSync(item_path, Content);
		npm_fs_extra.outputJsonSync(item_path, Content);
		return {
			"path": Path,
			"success": true
		};
	};


//---------------------------------------------------------------------
Membership.PathMake =
	function PathClean(MemberName, Path) {
		var app_path = get_member_application_path(MemberName);
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		npm_fs_extra.ensureDirSync(item_path);
		return {
			"path": Path,
			"success": true
		};
	};


//---------------------------------------------------------------------
Membership.PathClean =
	function PathClean(MemberName, Path) {
		var app_path = get_member_application_path(MemberName);
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		if (npm_fs.existsSync(item_path)) {
			npm_fs_extra.emptyDirSync(item_path);
		}
		return {
			"path": Path,
			"success": true
		};
	};


//---------------------------------------------------------------------
Membership.PathDelete =
	function PathDelete(MemberName, Path) {
		var app_path = get_member_application_path(MemberName);
		var item_path = npm_path.join(app_path, Path);
		if (item_path.indexOf(app_path) != 0) { throw ERR_IllegalPathAccess; }
		if ((app_path == item_path) || (app_path == (item_path + '/'))) { throw ERR_CannotRemoveRootFolder; }
		if (npm_fs.existsSync(item_path)) {
			npm_fs_extra.removeSync(item_path);
		}
		return {
			"path": Path,
			"success": true
		};
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['Membership'] = Membership;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = Membership;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = Membership;
	}
}
