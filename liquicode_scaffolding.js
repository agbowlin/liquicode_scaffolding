//=====================================================================
//=====================================================================
//
//		liquicode_scaffolding.js
//
//		Lightweight scaffolding for NodeJS/SocketIO/AngularJS
//
//=====================================================================
//=====================================================================

"use strict";

//---------------------------------------------------------------------
//	Includes
//---------------------------------------------------------------------

var npm_process = require('process');
var npm_child_process = require('child_process');
// var npm_exec = require('exec');
var npm_path = require('path');
var npm_fs = require('fs');
var npm_fs_extra = require('fs-extra');

var npm_command_line_args = require('command-line-args');
var npm_command_line_usage = require('command-line-usage');


//---------------------------------------------------------------------
//	Define the command line arguments
//---------------------------------------------------------------------


const usage_definitions = [{
		name: 'configpath',
		description: 'The config file to use.' +
			' By default, the [underline]{scaffolding.json} file is used.',
		alias: 'c',
		type: String,
		typeLabel: '[underline]{filename}',
		defaultOption: true
	},
	{
		name: 'sourcepath',
		description: 'The path to the liquicode_scaffolding source files.' +
			' By default, the [underline]{dist} folder is used.',
		alias: 's',
		type: String,
		typeLabel: '[underline]{path}'
	},
	{
		name: 'targetpath',
		description: 'The path where the generated scaffolding files will be placed.' +
			'By default, the current folder is used.',
		alias: 't',
		type: String,
		typeLabel: '[underline]{path}'
	},
	{
		name: 'help',
		description: 'Print this help.',
		alias: 'h',
		type: Boolean,
		typeLabel: ''
	}
];


const usage_sections = [{
		header: 'liquicode_scaffolding',
		content: 'Lightweight scaffolding for NodeJS/SocketIO/AngularJS'
	},
	{
		header: 'Synopsis',
		content: '$ node liquicode_scaffolding.js <options>'
	},
	{
		header: 'Options',
		optionList: usage_definitions
	},
	{
		content: 'Project home: [underline]{https://github.com/agbowlin/liquicode_scaffolding}'
	}
];


const app_options = npm_command_line_args(usage_definitions);


//---------------------------------------------------------------------
//	Print Help and Exit
//---------------------------------------------------------------------

if (app_options.help) {
	console.log(npm_command_line_usage(usage_sections));
	npm_process.exit(0);
}


//---------------------------------------------------------------------
//	Get the config
//---------------------------------------------------------------------

var config = {
	app_title: 'Application',
	content_selector: '#content',
	intiial_view: 'site-home', // Loaded when the user is not logged in or initially logs in.
	partials_path: '/partials',
	style: {

		content_backcolor: '#999',
		content_forecolor: '#FAFAFA',

		sidebar_backcolor: '#999',
		sidebar_forecolor: '#FAFAFA',

		sidebar_header_backcolor: '#999',
		sidebar_header_forecolor: '#FAFAFA',

		sidebar_selected_backcolor: '#FAFAFA',
		sidebar_selected_forecolor: '#999'
	}
};
if (app_options.configpath) {
	config = npm_fs_extra.readJsonSync(app_options.configpath);
}


console.log('Running in [' + __dirname + ']');


//---------------------------------------------------------------------
//	Get the source path
//---------------------------------------------------------------------

var sourcepath = npm_path.join(__dirname, 'dist');
if (app_options.sourcepath) {
	sourcepath = app_options.sourcepath;
}

console.log('Checking source [' + sourcepath + ']');
if (!npm_fs_extra.pathExists(sourcepath)) {
	throw new Error('sourcepath does not exist: [' + sourcepath + ']')
}

//---------------------------------------------------------------------
//	Get the target path
//---------------------------------------------------------------------

var targetpath = '.'; // The caller's cwd.
if (app_options.targetpath) {
	targetpath = app_options.targetpath;
}

console.log('Checking target [' + targetpath + ']');
npm_fs_extra.ensureDirSync(targetpath);


//---------------------------------------------------------------------
//	Copy the source files to the target
//---------------------------------------------------------------------

console.log('Copying files');
npm_fs_extra.copySync(sourcepath, targetpath, { "preserveTimestamps": true });


//---------------------------------------------------------------------
//	Install server dependencies
//---------------------------------------------------------------------

console.log('Installing server dependencies');
var command = 'npm install';
var options = {
	'cwd': npm_path.join(targetpath, 'server')
};
npm_child_process.execSync(command, options);


//---------------------------------------------------------------------
//	Install client dependencies
//---------------------------------------------------------------------

console.log('Installing client dependencies');
command = 'npm install';
options = {
	'cwd': npm_path.join(targetpath, 'client')
};
npm_child_process.execSync(command, options);


console.log('Installing more client dependencies');
command = 'bower install';
options = {
	'cwd': npm_path.join(targetpath, 'client')
};
npm_child_process.execSync(command, options);


//---------------------------------------------------------------------
//	Exit
//---------------------------------------------------------------------

console.log('Done.');
npm_process.exit(0);