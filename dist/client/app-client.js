/* global $ */
/* global Promise */

"use strict";

//---------------------------------------------------------------------
function AppClient() {
	return;
}


//---------------------------------------------------------------------
var ERR_AppClientError = Error("Application Client Error.");


//=====================================================================
//=====================================================================
//
//		AppClient.OnInitialize
//
//=====================================================================
//=====================================================================

//---------------------------------------------------------------------
AppClient.OnInitialize =
	function OnInitialize(Scope) {

		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================

		//TODO: Make Services object to hold all these.
		var Svcs = Scope.Svcs;

		// Promisify working objects,
		Svcs.Member = Promise.promisifyAll(Svcs.Member);
		Svcs.SharedDocDatabase = Promise.promisifyAll(Svcs.SharedDocDatabase);
		Svcs.MemberDocDatabase = Promise.promisifyAll(Svcs.MemberDocDatabase);

		Svcs.AppConfig.app_title = 'Scaffolding';
		// Svcs.AppConfig.content_selector = '#content';
		// Svcs.AppConfig.intiial_view = 'app-home';
		// Svcs.AppConfig.partials_path = '/partials';
		Svcs.AppConfig.alert_on_server_error = true;


		//=====================================================================
		//=====================================================================
		//
		//		Application
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		Scope.MyData = {};
		var MyData = Scope.MyData;
		MyData.sample_data = 'Hello, World!';

		// Add navigation items to the sidebar.

		$('#app-sidebar-list').html('');

		$('#app-sidebar-list').append(
			Svcs.Framework.NewSidebarItem({
				item_name: 'app-hello-item',
				caption: 'Hello',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					Svcs.Framework.Alert(MyData.sample_data);
				}
			})
		);

		var testing_group_id = 'app-test-group';
		$('#app-sidebar-list').append(
			Svcs.Framework.NewSidebarItem({
				item_name: testing_group_id,
				caption: 'Tests',
				is_group: true,
				is_collapsable: false,
				requires_login: false,
				icon_class: 'glyphicon glyphicon-folder-open',
				on_click: function(Item) {}
			})
		);

		$('#' + testing_group_id + '_items').append(
			Svcs.Framework.NewSidebarItem({
				item_name: 'app-test-docdatabase',
				caption: 'DocDatabase',
				partial_name: 'tests/test-docdatabase',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					Svcs.Framework.LoadPartial(Item.partial_name);
				}
			})
		);

		return;
	};


//=====================================================================
//=====================================================================
//
//		AppClient.OnLogin
//
//=====================================================================
//=====================================================================

//---------------------------------------------------------------------
AppClient.OnLogin =
	function OnLogin(Scope) {
		// Svcs.Framework.Alert('Welcome ' + Scope.Member.member_name + '!');
		return;
	};


//=====================================================================
//=====================================================================
//
//		AppClient.OnLogout
//
//=====================================================================
//=====================================================================

//---------------------------------------------------------------------
AppClient.OnLogout =
	function OnLogout(Scope) {
		// Svcs.Framework.Alert('Goodbye ' + Scope.Member.member_name + '!');
		return;
	};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['AppClient'] = AppClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = AppClient;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = AppClient;
	}
}
