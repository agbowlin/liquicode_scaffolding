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
		//		Theme
		//=====================================================================

		Svcs.Framework.ThemeNull = { url: "", name: "" };

		Svcs.Framework.Themes = [
			Svcs.Framework.ThemeNull,
			// Bootswatch Themes
			{ url: "https://bootswatch.com/cerulean/bootstrap.min.css", name: "cerulean" },
			{ url: "https://bootswatch.com/cosmo/bootstrap.min.css", name: "cosmo" },
			{ url: "https://bootswatch.com/cyborg/bootstrap.min.css", name: "cyborg" },
			{ url: "https://bootswatch.com/darkly/bootstrap.min.css", name: "darkly" },
			{ url: "https://bootswatch.com/flatly/bootstrap.min.css", name: "flatly" },
			{ url: "https://bootswatch.com/journal/bootstrap.min.css", name: "journal" },
			{ url: "https://bootswatch.com/lumen/bootstrap.min.css", name: "lumen" },
			{ url: "https://bootswatch.com/paper/bootstrap.min.css", name: "paper" },
			{ url: "https://bootswatch.com/readable/bootstrap.min.css", name: "readable" },
			{ url: "https://bootswatch.com/sandstone/bootstrap.min.css", name: "sandstone" },
			{ url: "https://bootswatch.com/simplex/bootstrap.min.css", name: "simplex" },
			{ url: "https://bootswatch.com/slate/bootstrap.min.css", name: "slate" },
			{ url: "https://bootswatch.com/solar/bootstrap.min.css", name: "solar" },
			{ url: "https://bootswatch.com/spacelab/bootstrap.min.css", name: "spacelab" },
			{ url: "https://bootswatch.com/superhero/bootstrap.min.css", name: "superhero" },
			{ url: "https://bootswatch.com/united/bootstrap.min.css", name: "united" },
			{ url: "https://bootswatch.com/yeti/bootstrap.min.css", name: "yeti" }
		];


		Svcs.Framework.UserThemeUrl = '';

		Svcs.Framework.ApplyUserTheme =
			function ApplyUserTheme() {
				if (Svcs.Framework.UserThemeUrl == null) { return; }
				if ($('#user-theme').length) {
					$('#user-theme').remove();
				}
				if (Svcs.Framework.UserThemeUrl != '') {
					var elem = document.createElement("link");
					elem.id = 'user-theme';
					elem.rel = "stylesheet";
					elem.type = "text/css";
					elem.href = Svcs.Framework.UserThemeUrl;
					document.getElementsByTagName("head")[0].appendChild(elem);
				}
				$cookies.put('Framework.UserThemeUrl', Svcs.Framework.UserThemeUrl);
				return;
			};


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
		Svcs.Framework.CompileHtml =
			function(Html) {
				var linker = $compile(Html);
				var linked_html = linker($scope);
				return linked_html;
			};


		//==========================================
		Svcs.Framework.LoadPartial =
			function(PartialName) {
				var url = Svcs.AppConfig.partials_path + '/' + PartialName + '.html';
				$http.get(url)
					.then(
						function(http_get_result) {
							var html = Svcs.Framework.CompileHtml(http_get_result.data);
							$('#content-partial-container').html(html).show();
						});
				return;
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


		// Apply the user theme.
		Svcs.Framework.UserThemeUrl = $cookies.get('Framework.UserThemeUrl') || '';
		Svcs.Framework.ApplyUserTheme();

		// Initialize the application.
		Svcs.AppClient.OnInitialize($scope);

		// Set the window title.
		window.document.title = Svcs.AppConfig.app_title;

		// Get the user data if our login is cached.
		if (Svcs.Member.member_name && Svcs.Member.session_id && !Svcs.Member.member_logged_in) {
			Svcs.Framework.DoMemberReconnect();
		}

		// Display the initial view.
		Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);

		// Return
		return;
	});
