/* global $ */

"use strict";

//---------------------------------------------------------------------
function AppClient() {
	return;
}


//---------------------------------------------------------------------
var ERR_AppClientError = new Error("Application Client Error.");


//---------------------------------------------------------------------
AppClient.Connect =
	function Connect(Scope, ThisApp, Member, Socket, Logger) {


		//==========================================
		Scope.MyData = {};
		var MyData = Scope.MyData;

		MyData.sample_data = 'Hello, World!';

		// Add navigation items to the sidebar.

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-hello-item',
				caption: 'Hello',
				partial_name: 'site-home',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
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
