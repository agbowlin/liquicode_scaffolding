/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */
/* global AppClient */

'use strict';


// Define the main AngularJS module.
var TheApplication = angular.module('TheApplication', ['ngCookies']);


// Define the main AngularJS controller.
var TheController = TheApplication.controller('TheController',
	function($rootScope, $scope, $http, $compile, $injector, $sce, $cookies) {


		//=====================================================================
		//=====================================================================
		//
		//		Initialize the main Scope services and variables.
		//
		//=====================================================================
		//=====================================================================

		//==========================================
		// Main scaffolding framework functionality.
		// Rename to 'Framework'
		var Framework = {};
		$scope.Framework = Framework;

		//==========================================
		// Application configuration.
		// Values to be set in app-client.js
		var AppConfig = {
			app_title: 'Application',
			content_selector: '#content',
			initial_view: 'app-home',
			partials_path: '/partials',
			alert_on_server_error: false
		};
		$scope.AppConfig = AppConfig;

		//==========================================
		// Logging functions.
		var Logger = {};
		$scope.Logger = Logger;

		//==========================================
		// Connect to the server with SocketIO.
		var Socket = io.connect();
		$scope.Socket = Socket;

		//==========================================
		// Membership functions.
		var Member = MembershipClient.GetMember('work-time', Socket, $cookies);
		$scope.Member = Member;
		$rootScope.Member = Member; // Do we need this ???


		//=====================================================================
		//=====================================================================
		//
		//		Framework
		//
		//=====================================================================
		//=====================================================================

		//=====================================================================
		//		Content Injection
		//=====================================================================

		//==========================================
		Framework.InjectContent =
			function(ContentSelector, ContentUrl) {
				$http.get(ContentUrl)
					.then(
						function(http_get_result) {
							var linker = $compile(http_get_result.data);
							var linker_result = linker($scope);
							$(ContentSelector).html(linker_result).show();
						});
			};


		//==========================================
		Framework.LoadContent =
			function(ContentUrl) {
				Framework.InjectContent('#content-partial-container', ContentUrl);
			};


		//==========================================
		Framework.LoadPartial =
			function(PartialName) {
				var url = AppConfig.partials_path + '/' + PartialName + '.html';
				Framework.InjectContent('#content-partial-container', url);
			};


		//=====================================================================
		//=====================================================================
		//
		//		Sidebar
		//
		//=====================================================================
		//=====================================================================

		//==========================================
		Framework.SidebarItems = [];


		//==========================================
		Framework.IsSidebarCollapsed = false;
		Framework.ToggleSidebarCollapsed =
			function() {
				Framework.IsSidebarCollapsed = !Framework.IsSidebarCollapsed;
				if (Framework.IsSidebarCollapsed) {
					$('#sidebar').addClass('collapsed');
				}
				else {
					$('#sidebar').removeClass('collapsed');
				}
			};


		//==========================================
		Framework.OnSidebarItemClick =
			function(ItemName) {
				var item = Framework.SidebarItems[ItemName];
				if (item) {
					if (item.on_click) {
						item.on_click(item);
					}
				}
			};


		//==========================================
		Framework.NewSidebarItem =
			function(Item) {
				Framework.SidebarItems[Item.item_name] = Item;

				var html = '<li';
				html += ' id="' + Item.item_name + '"';
				html += ' class="sidebar-item"';
				html += '>';

				html += '<a';
				html += ' class="sidebar-item"';
				if (Item.is_group) {
					if (Item.is_collapsable) {
						html += ' href="#' + Item.item_name + '_items"';
						html += ' data-toggle="collapse"';
						html += ' aria-expanded="false"';
					}
				}
				if (Item.requires_login) {
					html += ' ng-show="Member.member_logged_in"';
				}
				if (Item.on_click) {
					html += ' ng-click="Framework.OnSidebarItemClick(\'' + Item.item_name + '\')"';
				}
				html += '>';

				if (Item.icon_class) {
					html += '<i class="' + Item.icon_class + '"></i>';
				}

				html += Item.caption;


				if (Item.is_group) {
					if (Item.is_collapsable) {
						html += '<ul class="collapse list-unstyled" id="' + Item.item_name + '_items">';
					}
					else {
						html += '<ul class="list-unstyled" id="' + Item.item_name + '_items">';
					}
					html += '</ul>';
				}

				html += '</a>';
				html += '</li>';
				var linker = $compile(html);
				var linker_result = linker($scope);
				return linker_result;
			};


		//==========================================
		Framework.AddSidebarItem =
			function(Item) {
				$('#app-sidebar-list').append(
					Framework.NewSidebarItem(Item)
				);
			};


		//=====================================================================
		//=====================================================================
		//
		//		Socket.IO Messages
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		Socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});


		$scope.errors = [];


		//==========================================
		Socket.on('server_error',
			function(Err) {
				console.log('> server_error', Err);
				var message = 'Error in "' + Err.event + '": ' + Err.message;
				$scope.errors.push(message);
				if (AppConfig.alert_on_server_error) {
					alert(message);
				}
				$scope.$apply();
				return;
			});


		//=====================================================================
		//=====================================================================
		//
		//		Membership Messages
		//
		//=====================================================================
		//=====================================================================


		function intiialize_session() {
			// Initialize the application.
			AppClient.OnInitialize($scope);
			window.document.title = AppConfig.app_title;
			Framework.LoadPartial(AppConfig.initial_view);
			return;
		}


		Framework.DoMemberSignup =
			function() {
				Member.MemberSignup(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Member.member_data.signup_time = Date.now();
						Member.PutMemberData();
						intiialize_session();
						Framework.LoadPartial(AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		Framework.DoMemberLogin =
			function() {
				Member.MemberLogin(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Member.member_data.login_time = Date.now();
						Member.PutMemberData();
						intiialize_session();
						Framework.LoadPartial(AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		Framework.DoMemberReconnect =
			function() {
				Member.MemberReconnect(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						intiialize_session();
						$scope.$apply();
						return;
					});
			};


		Framework.DoMemberLogout =
			function() {
				Member.MemberLogout(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						$scope.$apply();
						return;
					});
			};


		//=====================================================================
		//=====================================================================
		//
		//		Application
		//
		//=====================================================================
		//=====================================================================


		// Initialize the application.
		AppClient.OnInitialize($scope);

		// Set the window title.
		window.document.title = AppConfig.app_title;

		// Get the user data if our login is cached.
		if (Member.member_logged_in) {
			Framework.DoMemberReconnect();
		}

		// Display the initial view.
		Framework.LoadPartial(AppConfig.initial_view);


		// Return
		return;
	});
