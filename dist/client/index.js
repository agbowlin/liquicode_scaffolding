/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */
/* global DocDatabaseClient */
/* global AppClient */

'use strict';


//=====================================================================
// Define the main AngularJS module.
var TheApplication = angular.module('TheApplication', ['ngCookies']);


//=====================================================================
// Define a directive to load and run javascript contained in partials.
// FROM: https://gist.github.com/subudeepak/9617483#file-angular-loadscript-js
// (function(ng) {
// 	var app = ng.module('ngLoadScript', []);
// 	app.directive('script', function() {
// 		return {
// 			restrict: 'E',
// 			scope: false,
// 			link: function(scope, elem, attr) {
// 				if (attr.type === 'text/javascript-lazy') {
// 					var s = document.createElement("script");
// 					s.type = "text/javascript";
// 					var src = elem.attr('src');
// 					if (src !== undefined) {
// 						s.src = src;
// 					}
// 					else {
// 						var code = elem.text();
// 						s.text = code;
// 					}
// 					document.head.appendChild(s);
// 					elem.remove();
// 				}
// 			}
// 		};
// 	});
// }(angular));


//=====================================================================
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

		var Svcs = {};
		// $scope.Services = Svcs;
		$scope.Svcs = Svcs;

		Svcs.AppClient = AppClient;

		//==========================================
		// Application configuration.
		// Values to be set in app-client.js
		Svcs.AppConfig = {
			app_title: 'Application',
			content_selector: '#content',
			initial_view: 'app-home',
			partials_path: '/partials',
			alert_on_server_error: false
		};

		//==========================================
		// Logging functions.
		Svcs.Logger = null;

		//==========================================
		// Connect to the server with SocketIO.
		Svcs.Socket = io.connect();

		//==========================================
		// Membership functions.
		Svcs.Member = MembershipClient.GetMember('work-time', Svcs.Socket, $cookies);
		$scope.Member = Svcs.Member;
		$rootScope.Member = Svcs.Member; // Do we need this ???

		//==========================================
		// Database functions.
		Svcs.SharedDocDatabase = DocDatabaseClient.GetSharedDatabase(Svcs.Socket);
		Svcs.MemberDocDatabase = DocDatabaseClient.GetMemberDatabase(Svcs.Socket, Svcs.Member);


		//=====================================================================
		//=====================================================================
		//
		//		Framework
		//
		//=====================================================================
		//=====================================================================

		//==========================================
		// Main scaffolding framework functionality.
		Svcs.Framework = {};
		var Framework = Svcs.Framework;


		//=====================================================================
		//		Error Handling
		//=====================================================================

		Svcs.Framework.ReportError =
			function ReportError(err) {
				console.log('Error: ' + err.message, err);
				if (Svcs.AppConfig.alert_on_server_error) {
					alert('Error: ' + err.message);
				}
				return;
			}


		//=====================================================================
		//		Content Injection
		//=====================================================================

		//==========================================
		Svcs.Framework.InjectContent =
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
		Svcs.Framework.LoadContent =
			function(ContentUrl) {
				Svcs.Framework.InjectContent('#content-partial-container', ContentUrl);
			};


		//==========================================
		Svcs.Framework.LoadPartial =
			function(PartialName) {
				var url = Svcs.AppConfig.partials_path + '/' + PartialName + '.html';
				Svcs.Framework.InjectContent('#content-partial-container', url);
			};


		//=====================================================================
		//		Sidebar Functions
		//=====================================================================

		//==========================================
		Svcs.Framework.SidebarItems = [];


		//==========================================
		Svcs.Framework.IsSidebarCollapsed = false;
		Svcs.Framework.ToggleSidebarCollapsed =
			function() {
				Svcs.Framework.IsSidebarCollapsed = !Svcs.Framework.IsSidebarCollapsed;
				if (Svcs.Framework.IsSidebarCollapsed) {
					$('#sidebar').addClass('collapsed');
				}
				else {
					$('#sidebar').removeClass('collapsed');
				}
			};


		//==========================================
		Svcs.Framework.OnSidebarItemClick =
			function(ItemName) {
				var item = Svcs.Framework.SidebarItems[ItemName];
				if (item) {
					if (item.on_click) {
						item.on_click(item);
					}
				}
			};


		//==========================================
		Svcs.Framework.NewSidebarItem =
			function(Item) {
				Svcs.Framework.SidebarItems[Item.item_name] = Item;

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
					html += ' ng-show="Svcs.Member.member_logged_in"';
				}
				if (Item.on_click) {
					html += ' ng-click="Svcs.Framework.OnSidebarItemClick(\'' + Item.item_name + '\')"';
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
		Svcs.Framework.AddSidebarItem =
			function(Item) {
				$('#app-sidebar-list').append(
					Svcs.Framework.NewSidebarItem(Item)
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
		Svcs.Socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});


		$scope.errors = [];


		//==========================================
		Svcs.Socket.on('server_error',
			function(Err) {
				console.log('> server_error', Err);
				var message = 'Error in "' + Err.event + '": ' + Err.message;
				$scope.errors.push(message);
				if (Svcs.AppConfig.alert_on_server_error) {
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


		//==========================================
		Svcs.Framework.DoMemberSignup =
			function() {
				Svcs.Member.MemberSignup(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Svcs.Member.member_data.signup_time = Date.now();
						Svcs.Member.PutMemberData();
						Svcs.AppClient.OnLogin($scope);
						Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberLogin =
			function() {
				Svcs.Member.MemberLogin(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Svcs.Member.member_data.login_time = Date.now();
						Svcs.Member.PutMemberData();
						Svcs.AppClient.OnLogin($scope);
						Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberReconnect =
			function() {
				Svcs.Member.MemberReconnect(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Svcs.AppClient.OnLogin($scope);
						Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberLogout =
			function() {
				Svcs.Member.MemberLogout(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						Svcs.AppClient.OnLogout($scope);
						Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);
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
		Svcs.AppClient.OnInitialize($scope);

		// Set the window title.
		window.document.title = Svcs.AppConfig.app_title;

		// Get the user data if our login is cached.
		if (Svcs.Member.member_logged_in) {
			Svcs.Framework.DoMemberReconnect();
		}

		// Display the initial view.
		Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);

		// Return
		return;
	});
