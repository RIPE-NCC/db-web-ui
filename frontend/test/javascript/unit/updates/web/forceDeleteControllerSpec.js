/*global beforeEach, describe, inject, it, module*/
'use strict';

var logger = {
	debug: function (msg) {
		//console.log('info:'+msg);
	},
	info: function (msg) {
		//console.log('info:'+msg);
	},
	error: function (msg) {
		//console.log('error:'+msg);
	}
};

describe('webUpdates: ForceDeleteController', function () {
	var $scope, $state, $stateParams, $httpBackend;
	var WhoisResources;
	var ModalService;
	var AlertService;
	var MntnerService;
	var CredentialsService;

	var $rootScope;
	var $controller;

	var INETNUM = '111 - 255';
	var SOURCE = 'RIPE';

	var createForceDeleteController;

	var objectToDisplay;

	beforeEach(function () {
		module('webUpdates');

		inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_, _AlertService_, _MntnerService_, _CredentialsService_) {

			$rootScope = _$rootScope_;
			$scope = $rootScope.$new();

			$state = _$state_;
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$controller = _$controller_;
			ModalService = _ModalService_;
			WhoisResources = _WhoisResources_;
			AlertService = _AlertService_;
			MntnerService = _MntnerService_;
			CredentialsService = _CredentialsService_;


			objectToDisplay = WhoisResources.wrapWhoisResources(
				{
					objects: {
						object: [
							{
								'primary-key': {attribute: [{name: 'inetnum', value: INETNUM}]},
								attributes: {
									attribute: [
										{name: 'inetnum', value: INETNUM},
										{name: 'mnt-by', value: 'TEST-MNT'},
										{name: 'descr', value: 'description'},
										{name: 'source', value: 'RIPE'}
									]
								}
							}
						]
					}

				});

			createForceDeleteController = function () {

				$httpBackend.whenGET(/.*.html/).respond(200);

				$httpBackend.expectGET('api/whois/RIPE/inetnum/111%20-%20255?unfiltered=true').respond(
					function (method, url) {
						return [200, objectToDisplay, {}];
					});

				$httpBackend.whenGET('api/user/mntners').respond([
					{key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
				]);

				$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TESTSSO-MNT').respond(
					function (method, url) {
						return [200, [{key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
					});

				$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
					function (method, url) {
						return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
					});

				$httpBackend.expectDELETE('api/whois/RIPE/inetnum/111%20-%20255?dry-run=true&reason=dry-run').respond(
					function () {
						return [200, {
							errormessages: {
								errormessage: [
									{
										severity: 'Error',
										text: 'Authorisation for [%s] %s failed\nusing \'%s:\'\nnot authenticated by: %s',
										args: [
											{value: 'inetnum'}, {value: '194.219.52.240 - 194.219.52.243'},
											{value: 'mnt-by'}, {value: 'TESTSSO-MNT'}
										]
									},
									{
										severity: 'Error',
										text: 'Authorisation for [%s] %s failed\nusing \'%s:\'\nnot authenticated by: %s',
										args: [
											{value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
											{value: 'mnt-lower'}, {value: 'TEST1-MNT'}
										]
									},
									{
										severity: 'Error',
										text: 'Authorisation for [%s] %s failed\nusing \'%s:\'\nnot authenticated by: %s',
										args: [{value: 'inetnum'}, {value: '194.219.0.0 - 194.219.255.255'},
											{value: 'mnt-by'}, {value: 'RIPE-NCC-HM-MNT, TEST2-MNT'}
										]
									},
									{
										severity: 'Info',
										text: 'Dry-run performed, no changes to the database have been made'
									}
								]
							}
						}, {}];
					});

				CredentialsService.setCredentials('TEST-MNT', '@123');

				$stateParams.source = SOURCE;
				$stateParams.objectType = 'inetnum';
				$stateParams.name = '111%20-%20255';

				_$controller_('ForceDeleteController', {
					$scope: $scope, $state: $state, $stateParams: $stateParams, $log: logger
				});

				$httpBackend.flush();
			};

		});
	});

	afterEach(function () {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should get objectType, source and name from url', function () {

		createForceDeleteController();

		expect($scope.object.type).toBe('inetnum');
		expect($scope.object.source).toBe(SOURCE);
		expect($scope.object.name).toBe(INETNUM);
	});

	it('should populate the ui with attributes', function () {
		createForceDeleteController();

		expect($scope.object.attributes.getSingleAttributeOnName('inetnum').value).toBe(INETNUM);
		expect($scope.object.attributes.getSingleAttributeOnName('descr').value).toEqual('description');
		expect($scope.object.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);
	});

	it('should transition to display state if cancel is pressed', function () {
		createForceDeleteController();
		spyOn($state, 'transitionTo');

		$scope.cancel();

		expect($state.transitionTo).toHaveBeenCalledWith('webupdates.display', {
			source: SOURCE,
			objectType: 'inetnum',
			name: INETNUM,
			method: undefined
		});
	});

	it('should have errors on wrong type', function () {

		$httpBackend.whenGET(/.*.html/).respond(200);

		$stateParams.source = SOURCE;
		$stateParams.objectType = 'mntner';
		$stateParams.name = 'TPOLYCHNIA-MNT';

		$controller('ForceDeleteController', {
			$scope: $scope, $state: $state, $stateParams: $stateParams
		});

		$httpBackend.flush();

		expect($rootScope.errors[0].plainText)
			.toBe('Only inetnum, inet6num, route, route6, domain object types are force-deletable');
	});


	it('should show error on missing object key', function () {

		$httpBackend.whenGET(/.*.html/).respond(200);

		$stateParams.source = SOURCE;
		$stateParams.objectType = 'inetnum';
		$stateParams.name = undefined;

		$controller('ForceDeleteController', {
			$scope: $scope, $state: $state, $stateParams: $stateParams
		});

		$httpBackend.flush();

		expect($rootScope.errors[0].plainText).toBe('Object key is missing');
	});

	it('should show error on missing source', function () {

		$httpBackend.whenGET(/.*.html/).respond(200);

		$stateParams.source = undefined;
		$stateParams.objectType = 'inetnum';
		$stateParams.name = 'asdf';

		$controller('ForceDeleteController', {
			$scope: $scope, $state: $state, $stateParams: $stateParams
		});

		$httpBackend.flush();

		expect($rootScope.errors[0].plainText).toBe('Source is missing');
	});


	it('should go to delete controler on reclaim', function () {

		createForceDeleteController();

		$scope.forceDelete();

		$httpBackend.whenGET(/.*.html/).respond(200);
		$httpBackend.flush();

		expect($state.current.name).toBe('webupdates.delete');
		expect($stateParams.source).toBe(SOURCE);
		expect($stateParams.objectType).toBe('inetnum');
		expect($stateParams.name.replace(/%20/g, '')).toBe('111-255');
		expect($stateParams.onCancel).toBe('webupdates.forceDelete');

	});

});

describe('webUpdates: ForceDeleteController should be able to handle escape objected with slash', function () {

	var $scope, $state, $stateParams, $httpBackend;
	var MessageStore;
	var WhoisResources;
	var MntnerService;
	var ModalService;
	var SOURCE = 'RIPE';
	var OBJECT_TYPE = 'route';
	var NAME = '12.235.32.0%2f19AS1680';
	var $q;
	var do_create_controller;

	beforeEach(function () {

		module('webUpdates');

		inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _$q_, _ModalService_) {

			var $rootScope = _$rootScope_;
			$scope = $rootScope.$new();

			$state = _$state_;
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			MessageStore = _MessageStore_;
			WhoisResources = _WhoisResources_;
			MntnerService = _MntnerService_;
			ModalService = _ModalService_;
			$q = _$q_;

			do_create_controller = function () {

				$stateParams.objectType = OBJECT_TYPE;
				$stateParams.source = SOURCE;
				$stateParams.name = NAME;

				_$controller_('ForceDeleteController', {
					$scope: $scope, $state: $state, $stateParams: $stateParams, $log: logger
				});

				$httpBackend.whenGET(/.*.html/).respond(200);
			}

		});
	});

	it('should get parameters from url', function () {

		do_create_controller();

		$httpBackend.whenGET('api/user/mntners').respond([
			{key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
		]);

		$httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
			function (method, url) {
				return [200, objectToDisplay, {}];
			});

		$httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
			function (method, url) {
				return [403, dryRunDeleteFailure, {}];
			});

		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});

		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});
		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});


		$httpBackend.flush();

		expect($scope.object.source).toBe(SOURCE);
		expect($scope.object.type).toBe('route');
		expect($scope.object.name).toBe('12.235.32.0/19AS1680');
	});

	it('should present auth popup', function () {

		spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
			return $q.defer().promise;
		});

		do_create_controller();

		$httpBackend.whenGET('api/user/mntners').respond([
			{key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
		]);

		$httpBackend.whenGET('api/forceDelete/RIPE/route/12.235.32.0%252F19AS1680').respond([
			{key: 'TEST-MNT', type: 'mntner', mine: false},
			{key: 'TEST2-MNT', type: 'mntner', mine: false},
			{key: 'TEST3-MNT', type: 'mntner', mine: false},
		]);

		$httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
			function (method, url) {
				return [200, objectToDisplay, {}];
			});

		$httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
			function (method, url) {
				return [403, dryRunDeleteFailure, {}];
			});

		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});
		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST1-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST1-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});
		$httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT').respond(
			function (method, url) {
				return [200, [{key: 'TEST2-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
			});

		$httpBackend.flush();

		$scope.forceDelete();

		expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

	});

	var objectToDisplay = {
		objects: {
			object: [
				{
					'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
					attributes: {
						attribute: [
							{name: 'route', value: '12.235.32.0/19AS1680'},
							{name: 'mnt-by', value: 'TEST-MNT'},
							{name: 'source', value: 'RIPE'}
						]
					}
				}
			]
		}

	};

	var dryRunDeleteFailure = {
		errormessages: {
			errormessage: [
				{
					severity: "Error",
					text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
					args: [
						{value: "inetnum"}, {value: "194.219.52.240 - 194.219.52.243"},
						{value: "mnt-by"}, {value: "TEST-MNT"}
					]
				},
				{
					severity: "Error",
					text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
					args: [
						{value: "inetnum"}, {value: "194.219.0.0 - 194.219.255.255"},
						{value: "mnt-lower"}, {value: "TEST1-MNT"}
					]
				},
				{
					severity: "Error",
					text: "Authorisation for [%s] %s failed\nusing \"%s:\"\nnot authenticated by: %s",
					args: [{value: "inetnum"}, {value: "194.219.0.0 - 194.219.255.255"},
						{value: "mnt-by"}, {value: "RIPE-NCC-HM-MNT, TEST2-MNT"}
					]
				},
				{
					severity: "Info",
					text: "Dry-run performed, no changes to the database have been made"
				}
			]
		}

	};


});


