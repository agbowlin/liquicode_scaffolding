/* global $ */

"use strict";

//---------------------------------------------------------------------
function AppClient() {
	return;
}


//---------------------------------------------------------------------
var ERR_AppClientError = new Error("Application Client Error.");


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


		AppConfig.app_title = 'Scaffolding';
		// AppConfig.content_selector = '#content';
		// AppConfig.intiial_view = 'app-home';
		// AppConfig.partials_path = '/partials';


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
