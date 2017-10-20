"use strict";

var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_nedb = require('nedb');


//=====================================================================
//=====================================================================
//
//		Initialization
//
//=====================================================================
//=====================================================================


function DocDatabaseEngine(Services, EngineConfig) {
	DocDatabaseEngine.Services = Services;
	return DocDatabaseEngine;
}


//=====================================================================
//=====================================================================
//
//		Query
//
//	Supports selected NeDB commands.
//---------------------------------------------------------------------
//	see: https://github.com/louischatriot/nedb
//---------------------------------------------------------------------
//	- Count ( query, callback )
//	- Find ( query, projection, callback )
//	- FindAndModify ( ??? )
//	- FindOne ( query, projection, callback )
//	- Insert ( query, callback )
//	- Remove ( query, options, callback )
//	- RemoveAll ( callback ) (custom)
//	- Save ( ??? )
//	- Update ( query, update, options, callback )
//=====================================================================
//=====================================================================


DocDatabaseEngine.Query =
	function Query(CollectionName, Request, callback) {

		callback(Error('Not implemented.'));

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
