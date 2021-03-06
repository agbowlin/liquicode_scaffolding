/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */
/* global DocDatabaseClient */
/* global AppClient */

'use strict';


//=====================================================================
// Define the main AngularJS module.
var TheApplication = angular.module('TheApplication', [
	'ngCookies',
	'ngAnimate',
	'mgcrea.ngStrap'
]);


//=====================================================================
// Define the main AngularJS controller.
var TheController = TheApplication.controller('TheController',
	function(
		$rootScope, $scope,
		$http,
		$compile, $injector, $sce,
		$cookies,
		$alert
	) {


		//=====================================================================
		//=====================================================================
		//
		//		Initialize the main Scope services and variables.
		//
		//=====================================================================
		//=====================================================================

		var Svcs = {};
		$scope.Svcs = Svcs;

		Svcs.Http = $http;
		Svcs.Cookies = $cookies;
		Svcs.AppClient = AppClient; // Initialized in 'Application Initialization' section below.
		Svcs.AppConfig = null; // Initialized in 'Application Initialization' section below.
		Svcs.Logger = null;
		Svcs.Socket = null; // Initialized in 'Socket' section below.
		Svcs.Member = null; // Initialized during Svcs.Socket.on('connect') below.
		Svcs.SharedDocDatabase = null; // Initialized during Svcs.Socket.on('connect') below.
		Svcs.MemberDocDatabase = null; // Initialized during Svcs.Framework.OnMemberConnect() below.

		//==========================================
		// Application configuration.
		// Values are overriden in app-client.js during AppClient.OnInitialize
		Svcs.AppConfig = {
			app_title: 'application',
			content_selector: '#content',
			initial_view: 'app-home',
			partials_path: '/partials',
			alert_on_server_error: false
		};


		//=====================================================================
		//=====================================================================
		//
		//		Socket
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		// Connect to the server with SocketIO.
		Svcs.Socket = io.connect();


		//==========================================
		Svcs.Socket.on('connect', function() {
			$scope.notice = "... connected";
			// Membership functions.
			Svcs.Member = MembershipClient.OnInitialize(Svcs.AppConfig.app_title, Svcs.Socket, Svcs.Cookies);
			Svcs.Member = Promise.promisifyAll(Svcs.Member);
			// Database functions.
			Svcs.SharedDocDatabase = DocDatabaseClient.GetSharedDatabase(Svcs.Socket);
			Svcs.SharedDocDatabase = Promise.promisifyAll(Svcs.SharedDocDatabase);
			// Ready the application.
			Svcs.AppClient.OnConnect($scope);
			// Automatically reconnect if our session is cached.
			if (Svcs.Member.member_name && Svcs.Member.session_id && !Svcs.Member.member_logged_in) {
				Svcs.Framework.DoMemberReconnect();
			}
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
					Svcs.Framework.ReportError(Error(message));
				}
				$scope.$apply();
				return;
			});


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


		//=====================================================================
		//		Theme
		//=====================================================================

		Svcs.Framework.ThemeNull = { url: "", name: "" };

		Svcs.Framework.Themes = [
			Svcs.Framework.ThemeNull,
			// Bootswatch Themes
			{ url: "https://bootswatch.com/3/cerulean/bootstrap.min.css", name: "cerulean" },
			{ url: "https://bootswatch.com/3/cosmo/bootstrap.min.css", name: "cosmo" },
			{ url: "https://bootswatch.com/3/cyborg/bootstrap.min.css", name: "cyborg" },
			{ url: "https://bootswatch.com/3/darkly/bootstrap.min.css", name: "darkly" },
			{ url: "https://bootswatch.com/3/flatly/bootstrap.min.css", name: "flatly" },
			{ url: "https://bootswatch.com/3/journal/bootstrap.min.css", name: "journal" },
			{ url: "https://bootswatch.com/3/lumen/bootstrap.min.css", name: "lumen" },
			{ url: "https://bootswatch.com/3/paper/bootstrap.min.css", name: "paper" },
			{ url: "https://bootswatch.com/3/readable/bootstrap.min.css", name: "readable" },
			{ url: "https://bootswatch.com/3/sandstone/bootstrap.min.css", name: "sandstone" },
			{ url: "https://bootswatch.com/3/simplex/bootstrap.min.css", name: "simplex" },
			{ url: "https://bootswatch.com/3/slate/bootstrap.min.css", name: "slate" },
			{ url: "https://bootswatch.com/3/solar/bootstrap.min.css", name: "solar" },
			{ url: "https://bootswatch.com/3/spacelab/bootstrap.min.css", name: "spacelab" },
			{ url: "https://bootswatch.com/3/superhero/bootstrap.min.css", name: "superhero" },
			{ url: "https://bootswatch.com/3/united/bootstrap.min.css", name: "united" },
			{ url: "https://bootswatch.com/3/yeti/bootstrap.min.css", name: "yeti" }
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
		//		Predefined Callbacks
		//=====================================================================

		Svcs.Framework.ScopeApplyCallback =
			function(err, response) {
				if (err) { Svcs.Framework.ReportError(err); }
				$scope.$apply();
				return;
			};


		//=====================================================================
		//		Alerts
		//=====================================================================

		Svcs.Framework.Alert =
			function Alert(Message) {
				console.log('Alert: ' + Message);
				var alert_window = $alert({
					content: Message,
					container: Svcs.AppConfig.content_selector,
					placement: 'top',
					type: 'info',
					duration: 3,
					show: true
				});
				return;
			};


		//=====================================================================
		//		Error Handling
		//=====================================================================

		Svcs.Framework.ReportError =
			function ReportError(err) {
				console.log('Error: ' + err.message, err);
				if (Svcs.AppConfig.alert_on_server_error) {
					// alert('Error: ' + err.message);
					var alert_window = $alert({
						// title: 'Error',
						content: err.message,
						container: Svcs.AppConfig.content_selector,
						placement: 'top',
						type: 'info',
						duration: 5,
						show: true
					});

				}
				return;
			};


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
		//		Membership
		//
		//=====================================================================
		//=====================================================================

		//==========================================
		Svcs.Framework.OnMemberConnect =
			function() {
				// Database functions.
				Svcs.MemberDocDatabase = DocDatabaseClient.GetMemberDatabase(Svcs.Socket, Svcs.Member);
				Svcs.MemberDocDatabase = Promise.promisifyAll(Svcs.MemberDocDatabase);
				// Initialize the application.
				Svcs.AppClient.OnLogin($scope);
				// Load the initial view.
				Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);
				$scope.$apply();
				return;
			};


		//==========================================
		Svcs.Framework.DoMemberSignup =
			function() {
				Svcs.Member.MemberSignup(
					function(err, Response) {
						if (err) {
							Svcs.Framework.ReportError(err)
							return;
						}
						Svcs.Member.member_data.signup_time = Date.now();
						Svcs.Member.PutMemberData();
						Svcs.Framework.OnMemberConnect();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberLogin =
			function() {
				Svcs.Member.MemberLogin(
					function(err, Response) {
						if (err) {
							Svcs.Framework.ReportError(err)
							return;
						}
						Svcs.Member.member_data.login_time = Date.now();
						Svcs.Member.PutMemberData();
						Svcs.Framework.OnMemberConnect();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberReconnect =
			function() {
				Svcs.Member.MemberReconnect(
					function(err, Response) {
						if (err) {
							Svcs.Framework.ReportError(err)
							return;
						}
						Svcs.Framework.OnMemberConnect();
						return;
					});
			};


		//==========================================
		Svcs.Framework.DoMemberLogout =
			function() {
				Svcs.Member.MemberLogout(
					function(err, Response) {
						if (err) {
							Svcs.Framework.ReportError(err)
							return;
						}
						Svcs.AppClient.OnLogout($scope);
						Svcs.MemberDocDatabase = null;
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

		// Apply the user theme.
		if (Svcs.Cookies) {
			Svcs.Framework.UserThemeUrl = Svcs.Cookies.get('Framework.UserThemeUrl') || '';
			Svcs.Framework.ApplyUserTheme();
		}

		// Set the window title.
		window.document.title = Svcs.AppConfig.app_title;

		// Display the initial view.
		Svcs.Framework.LoadPartial(Svcs.AppConfig.initial_view);


	});
