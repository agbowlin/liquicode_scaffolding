/* global $ */

"use strict";

//---------------------------------------------------------------------
function AppClient() {
	return;
}


//---------------------------------------------------------------------
var ERR_AppClientError = new Error("Application Client Error.");


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


		var Framework = Scope.Framework;
		var AppConfig = Scope.AppConfig;
		var Logger = Scope.Logger;
		var Socket = Scope.Socket;
		var Member = Scope.Member;
		var SharedDocDatabase = Scope.SharedDocDatabase;
		var MemberDocDatabase = Scope.MemberDocDatabase;


		AppConfig.app_title = 'Scaffolding';
		// AppConfig.content_selector = '#content';
		// AppConfig.intiial_view = 'app-home';
		// AppConfig.partials_path = '/partials';
		AppConfig.alert_on_server_error = true;


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
			Framework.NewSidebarItem({
				item_name: 'app-hello-item',
				caption: 'Hello',
				partial_name: 'site-home',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					Framework.LoadPartial(Item.partial_name);
					alert(MyData.sample_data);
				}
			})
		);

		var testing_group_id = 'app-test-group';
		$('#app-sidebar-list').append(
			Framework.NewSidebarItem({
				item_name: testing_group_id,
				caption: 'Tests',
				is_group: true,
				is_collapsable: false,
				requires_login: false,
				icon_class: 'glyphicon glyphicon-th',
				on_click: function(Item) {}
			})
		);

		$('#' + testing_group_id + '_items').append(
			Framework.NewSidebarItem({
				item_name: 'app-test-docdatabase',
				caption: 'DocDatabase',
				partial_name: 'test-docdatabase',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					Framework.LoadPartial(Item.partial_name);
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
		// alert('Welcome ' + Scope.Member.member_name + '!');
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
		alert('Goodbye ' + Scope.Member.member_name + '!');
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
