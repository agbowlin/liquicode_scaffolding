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
(function(ng) {
	var app = ng.module('ngLoadScript', []);
	app.directive('script', function() {
		return {
			restrict: 'E',
			scope: false,
			link: function(scope, elem, attr) {
				if (attr.type === 'text/javascript-lazy') {
					var s = document.createElement("script");
					s.type = "text/javascript";
					var src = elem.attr('src');
					if (src !== undefined) {
						s.src = src;
					}
					else {
						var code = elem.text();
						s.text = code;
					}
					document.head.appendChild(s);
					elem.remove();
				}
			}
		};
	});
}(angular));


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

		//==========================================
		// Database functions.
		var SharedDocDatabase = DocDatabaseClient.GetSharedDatabase(Socket);
		$scope.SharedDocDatabase = SharedDocDatabase;
		var MemberDocDatabase = DocDatabaseClient.GetMemberDatabase(Socket, Member);
		$scope.MemberDocDatabase = MemberDocDatabase;

		// // === BEGIN TEST ===
		// {
		// 	if (Member.member_name && Member.member_logged_in) {
		// 		MemberDatabase.SubmitQuery(
		// 			'insert', [{
		// 					name: "Alice",
		// 					age: 25,
		// 					is_married: true,
		// 					favorites: [
		// 						"Apple Pie",
		// 						"Hairless Cats",
		// 						"Spy Novels"
		// 					]
		// 				},
		// 				{
		// 					name: "Bob",
		// 					age: 28,
		// 					is_married: false,
		// 					favorites: [
		// 						"Purple",
		// 						"Apple Pie",
		// 						"Action Movies"
		// 					]
		// 				},
		// 				{
		// 					name: "Eve",
		// 					age: 23,
		// 					is_married: false,
		// 					favorites: [
		// 						"Action Movies",
		// 						"Pilates",
		// 						"Painting"
		// 					]
		// 				}
		// 			],
		// 			function(Err, Response) {
		// 				if (Err) { return; }

		// 				console.log(Response);

		// 				MemberDatabase.SubmitQuery(
		// 					'Count', {},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				MemberDatabase.SubmitQuery(
		// 					'Count', {
		// 						age: { $gte: 25 }
		// 					},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				MemberDatabase.SubmitQuery(
		// 					'Find', {
		// 						age: { $gte: 25 }
		// 					},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				MemberDatabase.SubmitQuery(
		// 					'FindOne', {
		// 						age: { $gte: 25 }
		// 					},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				MemberDatabase.SubmitQuery(
		// 					'Remove', {
		// 						age: { $gte: 25 }
		// 					},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				MemberDatabase.SubmitQuery(
		// 					'RemoveAll', {},
		// 					function(Err, Response) {
		// 						if (Err) { return; }

		// 						console.log(Response);

		// 						return;
		// 					});

		// 				return;
		// 			});
		// 	}
		// }
		// // === END TEST ===


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


		//==========================================
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
						AppClient.OnLogin($scope);
						Framework.LoadPartial(AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
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
						AppClient.OnLogin($scope);
						Framework.LoadPartial(AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
		Framework.DoMemberReconnect =
			function() {
				Member.MemberReconnect(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						AppClient.OnLogin($scope);
						Framework.LoadPartial(AppConfig.initial_view);
						$scope.$apply();
						return;
					});
			};


		//==========================================
		Framework.DoMemberLogout =
			function() {
				Member.MemberLogout(
					function(Err, Response) {
						if (Err) {
							alert('ERROR: ' + Err.message);
							$scope.$apply();
							return;
						}
						AppClient.OnLogout($scope);
						Framework.LoadPartial(AppConfig.initial_view);
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
