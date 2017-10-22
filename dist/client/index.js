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

			// jQuery-UI Themes
			// <option value="bower_components/jquery-ui/themes/base/jquery-ui.min.css">base</option>
			// <option value="bower_components/jquery-ui/themes/black-tie/jquery-ui.min.css">black-tie</option>
			// <option value="bower_components/jquery-ui/themes/blitzer/jquery-ui.min.css">blitzer</option>
			// <option value="bower_components/jquery-ui/themes/cupertino/jquery-ui.min.css">cupertino</option>
			// <option value="bower_components/jquery-ui/themes/dark-hive/jquery-ui.min.css">dark-hive</option>
			// <option value="bower_components/jquery-ui/themes/dot-luv/jquery-ui.min.css">dot-luv</option>
			// <option value="bower_components/jquery-ui/themes/eggplant/jquery-ui.min.css">eggplant</option>
			// <option value="bower_components/jquery-ui/themes/excite-bike/jquery-ui.min.css">excite-bike</option>
			// <option value="bower_components/jquery-ui/themes/flick/jquery-ui.min.css">flick</option>
			// <option value="bower_components/jquery-ui/themes/hot-sneaks/jquery-ui.min.css">hot-sneaks</option>
			// <option value="bower_components/jquery-ui/themes/humanity/jquery-ui.min.css">humanity</option>
			// <option value="bower_components/jquery-ui/themes/le-frog/jquery-ui.min.css">le-frog</option>
			// <option value="bower_components/jquery-ui/themes/mint-choc/jquery-ui.min.css">mint-choc</option>
			// <option value="bower_components/jquery-ui/themes/overcast/jquery-ui.min.css">overcast</option>
			// <option value="bower_components/jquery-ui/themes/pepper-grinder/jquery-ui.min.css">pepper-grinder</option>
			// <option value="bower_components/jquery-ui/themes/redmond/jquery-ui.min.css">redmond</option>
			// <option value="bower_components/jquery-ui/themes/smoothness/jquery-ui.min.css">smoothness</option>
			// <option value="bower_components/jquery-ui/themes/south-street/jquery-ui.min.css">south-street</option>
			// <option value="bower_components/jquery-ui/themes/start/jquery-ui.min.css">start</option>
			// <option value="bower_components/jquery-ui/themes/sunny/jquery-ui.min.css">sunny</option>
			// <option value="bower_components/jquery-ui/themes/swanky-purse/jquery-ui.min.css">swanky-purse</option>
			// <option value="bower_components/jquery-ui/themes/trontastic/jquery-ui.min.css">trontastic</option>
			// <option value="bower_components/jquery-ui/themes/ui-darkness/jquery-ui.min.css">ui-darkness</option>
			// <option value="bower_components/jquery-ui/themes/ui-lightness/jquery-ui.min.css">ui-lightness</option>
			// <option value="bower_components/jquery-ui/themes/vader/jquery-ui.min.css">vader</option>
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
