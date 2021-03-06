/* global $ */
/* global TheApplication */
/* global Promise */

TheApplication.controller(
	'test-docdatabase',
	function($rootScope, $scope, $http, $compile, $injector, $sce, $cookies) {

		const NoQuery = {};
		const NoProjection = {};
		const NoOptions = {};

		//------------------------------------------
		$scope.log =
			function log(Message) {
				console.log(Message);
				$('#log').append('<li>' + Message + '</li>');
				return;
			};


		//------------------------------------------
		$scope.log_line =
			function log_line() {
				$scope.log('==========================================');
			};


		//------------------------------------------
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


		//------------------------------------------
		var test_data = [{
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
			},
			{
				name: "Sarah",
				age: 22,
				is_married: false,
				favorites: [
					"Pilates",
					"Purple",
					"Painting"
				]
			},
			{
				name: "Joe",
				age: 18,
				is_married: false,
				favorites: [
					"Action Movies",
					"Spy Novels",
					"Apple Pie"
				]
			}
		];


		//------------------------------------------
		$scope.RunTests =
			function RunTests() {

				$('#log').empty();
				$scope.log('Starting tests ...');

				var database = $scope.Svcs.SharedDocDatabase;

				$scope.log('==========================================');
				$scope.log('Inserting 3 documents ...');
				database.Insert(
					'test', test_data, NoOptions,
					function(Err, Response) {
						if (Err) { $scope.log(Err); return; }

						$scope.log('Inserted ' + Response.results.length + ' documents.');
						$scope.log_object(Response.results);

						$scope.log('==========================================');
						$scope.log('Counting all documents ...');
						database.Count(
							'test',
							NoQuery,
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
											NoProjection,
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
													NoProjection,
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

																		$scope.log('==========================================');
																		$scope.log('Testing completed.');

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

						return;
					});
			};


		//------------------------------------------
		$scope.RunTestsPromises =
			function RunTestsPromises() {

				$('#log').empty();
				$scope.log('Starting tests ...');

				var database = Promise.promisifyAll($scope.Svcs.SharedDocDatabase);

				$scope.log('==========================================');
				$scope.log('Inserting ' + test_data.length + ' documents ...');
				database.InsertAsync('test', test_data, NoOptions)
					.then(function(Response) {
						$scope.log('Inserted ' + Response.results.length + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Counting all documents ...');
						return database.CountAsync('test', NoQuery);
					})
					.then(function(Response) {
						$scope.log('Counted ' + Response.results + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Counting documents (age >= 25) ...');
						return database.CountAsync('test', { age: { $gte: 25 } });
					})
					.then(function(Response) {
						$scope.log('Counted ' + Response.results + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Finding documents (age >= 25) ...');
						return database.FindAsync('test', { age: { $gte: 25 } }, NoProjection);
					})
					.then(function(Response) {
						$scope.log('Found ' + Response.results.length + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Finding one document (age >= 25) ...');
						return database.FindOneAsync('test', { age: { $gte: 25 } }, NoProjection);
					})
					.then(function(Response) {
						$scope.log('Found one document.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Updating documents (age >= 20) set (age = 25) ...');
						return database.UpdateAsync('test', { age: { $gte: 20 } }, { $set: { age: 25 } }, { multi: true, upsert: false });
					})
					.then(function(Response) {
						$scope.log('Updated ' + Response.results.nModified + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Finding documents (age >= 25) ...');
						return database.FindAsync('test', { age: { $gte: 25 } }, { name: 1, age: 1, is_married: 1 });
					})
					.then(function(Response) {
						$scope.log('Found ' + Response.results.length + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Removing documents (age >= 25) ...');
						return database.RemoveAsync('test', { age: { $gte: 25 } }, NoOptions);
					})
					.then(function(Response) {
						$scope.log('Removed ' + Response.results.n + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Removing all documents ...');
						return database.RemoveAllAsync('test', NoOptions);
					})
					.then(function(Response) {
						$scope.log('Removed ' + Response.results.n + ' documents.');
						$scope.log_object(Response.results);
						$scope.log('==========================================');
						$scope.log('Counting all documents ...');
						return database.CountAsync('test', NoQuery);
					})
					.then(function(Response) {
						$scope.log('Counted ' + Response.results + ' documents.');
						$scope.log_object(Response.results);
					})
					.catch(function(Err) {
						$scope.log('Error returned.');
						$scope.log_object(Err);
					})
					.finally(function() {
						$scope.log('==========================================');
						$scope.log('Testing completed.');
					});
				return;
			};


	});
