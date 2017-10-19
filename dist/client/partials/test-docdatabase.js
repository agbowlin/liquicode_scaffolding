/* global $ */
/* global TheApplication */

TheApplication.controller(
	'test-docdatabase',
	function($rootScope, $scope, $http, $compile, $injector, $sce, $cookies) {

		const NoQuery = {};
		const NoOptions = {};

		$scope.log =
			function log(Message) {
				console.log(Message);
				$('#log').append('<li>' + Message + '</li>');
				return;
			};


		$scope.log_line =
			function log_line() {
				$scope.log('==========================================');
			};


		$scope.log_object =
			function log_object(Obj) {
				if (Array.isArray(Obj)) {
					for (var index = 0; index < Obj.length; index++) {
						$scope.log(JSON.stringify(Obj[index]));
					}
				}
				else {
					$scope.log(JSON.stringify(Obj));
				}
				return;
			};


		$scope.RunTests =
			function RunTests() {

				$('#log').empty();
				$scope.log('Starting tests ...');

				var database = $scope.SharedDocDatabase;

				$scope.log('==========================================');
				$scope.log('Inserting 3 documents ...');
				database.Insert(
					'test', [{
							name: "Alice",
							age: 25,
							is_married: true,
							favorites: [
								"Apple Pie",
								"Hairless Cats",
								"Spy Novels"
							]
						},
						{
							name: "Bob",
							age: 28,
							is_married: false,
							favorites: [
								"Purple",
								"Apple Pie",
								"Action Movies"
							]
						},
						{
							name: "Eve",
							age: 23,
							is_married: false,
							favorites: [
								"Action Movies",
								"Pilates",
								"Painting"
							]
						}
					],
					NoOptions,
					function(Err, Response) {
						if (Err) { $scope.log(Err); return; }

						$scope.log('Inserted ' + Response.results.length + ' documents.');
						$scope.log_object(Response.results);

						$scope.log('==========================================');
						$scope.log('Counting all documents ...');
						database.Count(
							'test',
							NoQuery,
							NoOptions,
							function(Err, Response) {
								if (Err) { $scope.log(Err); return; }

								$scope.log('Counted ' + Response.results + ' documents.');
								$scope.log_object(Response.results);

								$scope.log('==========================================');
								$scope.log('Counting documents (age >= 25) ...');
								database.Count(
									'test', {
										age: { $gte: 25 }
									},
									NoOptions,
									function(Err, Response) {
										if (Err) { $scope.log(Err); return; }

										$scope.log('Counted ' + Response.results + ' documents.');
										$scope.log_object(Response.results);

										$scope.log('==========================================');
										$scope.log('Finding documents (age >= 25) ...');
										database.Find(
											'test', {
												age: { $gte: 25 }
											},
											function(Err, Response) {
												if (Err) { $scope.log(Err); return; }

												$scope.log('Found ' + Response.results.length + ' documents.');
												$scope.log_object(Response.results);

												$scope.log('==========================================');
												$scope.log('Finding one document (age >= 25) ...');
												database.FindOne(
													'test', {
														age: { $gte: 25 }
													},
													function(Err, Response) {
														if (Err) { $scope.log(Err); return; }

														$scope.log('Found 1 document.');
														$scope.log_object(Response.results);

														$scope.log('==========================================');
														$scope.log('Removing documents (age >= 25) ...');
														database.Remove(
															'test', {
																age: { $gte: 25 }
															},
															NoOptions,
															function(Err, Response) {
																if (Err) { $scope.log(Err); return; }

																$scope.log('Removed ' + Response.results + ' documents.');
																$scope.log_object(Response.results);

																$scope.log('==========================================');
																$scope.log('Removing all documents ...');
																database.RemoveAll(
																	'test',
																	NoOptions,
																	function(Err, Response) {
																		if (Err) { $scope.log(Err); return; }

																		$scope.log('Removed ' + Response.results + ' documents.');
																		$scope.log_object(Response.results);

																		return;
																	});

																return;
															});

														return;
													});

												return;
											});

										return;
									});

								return;
							});

						return; // Outer
					});
			};


	});
