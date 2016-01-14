'use strict';

describe('webUpdates: ReclaimController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var ModalService;
    var AlertService;
    var MntnerService;
    var CredentialsService;

    var $rootScope;
    var $log;
    var $controller;

    var INETNUM = '111 - 255';
    var SOURCE = 'RIPE';

    var createReclaimController;

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
            $log = {
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

            createReclaimController = function () {

                $httpBackend.whenGET(/.*.html/).respond(200);

                $httpBackend.expectGET('api/whois/RIPE/inetnum/111%20-%20255?unfiltered=true').respond(
                    function (method, url) {
                        return [200, objectToDisplay, {}];
                    });

                $httpBackend.whenGET('api/user/mntners').respond([
                    {key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO'], mine: true}
                ]);

                $httpBackend.expectGET('api/reclaim/RIPE/inetnum/111%2520-%2520255').respond(
                    function (method, url) {
                        return [200, [{key: 'TESTSSO-MNT', type: 'mntner', mine: false}], {}];
                    });

                $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TESTSSO-MNT').respond(
                    function (method, url) {
                        return [200, [{key: 'TESTSSO-MNT', type: 'mntner', auth: ['MD5-PW', 'SSO']}], {}];
                    });

                $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                    function (method, url) {
                        return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                    });

                $httpBackend.expectDELETE('api/whois/RIPE/inetnum/111%20-%20255?dry-run=true&reason=dry-run').respond(
                    function (method, url) {
                        return [200, objectToDisplay, {}];
                    });

                CredentialsService.setCredentials('TEST-MNT', '@123');

                $stateParams.source = SOURCE;
                $stateParams.objectType = 'inetnum';
                $stateParams.name = '111%20-%20255';

                _$controller_('ReclaimController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams, $log: $log
                });

                $httpBackend.flush();
            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {

        createReclaimController();

        expect($scope.object.type).toBe('inetnum');
        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.name).toBe(INETNUM);
    });

    it('should populate the ui with attributes', function () {
        createReclaimController();

        expect($scope.object.attributes.getSingleAttributeOnName('inetnum').value).toBe(INETNUM);
        expect($scope.object.attributes.getSingleAttributeOnName('descr').value).toEqual('description');
        expect($scope.object.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);
    });

    it('should transition to display state if cancel is pressed', function () {
        createReclaimController();
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

        $controller('ReclaimController', {
            $scope: $scope, $state: $state, $stateParams: $stateParams
        });

        $httpBackend.flush();

        //console.log('attributes::::' + JSON.stringify($scope.attributes));
        //expect($scope.attributes).toBe([]);
        expect($rootScope.errors[0].plainText)
            .toBe('Only inetnum, inet6num, route, route6, domain object types are reclaimable');
    });


    it('should show error on missing object key', function () {

        $httpBackend.whenGET(/.*.html/).respond(200);

        $stateParams.source = SOURCE;
        $stateParams.objectType = 'inetnum';
        $stateParams.name = undefined;

        $controller('ReclaimController', {
            $scope: $scope, $state: $state, $stateParams: $stateParams
        });

        $httpBackend.flush();

        //expect($scope.attributes).toBe(undefined);
        expect($rootScope.errors[0].plainText).toBe('Object key is missing');
    });

    it('should show error on missing source', function () {

        $httpBackend.whenGET(/.*.html/).respond(200);

        $stateParams.source = undefined;
        $stateParams.objectType = 'inetnum';
        $stateParams.name = 'asdf';

        $controller('ReclaimController', {
            $scope: $scope, $state: $state, $stateParams: $stateParams
        });

        $httpBackend.flush();

        //expect($scope.attributes).toBe(undefined);
        expect($rootScope.errors[0].plainText).toBe('Source is missing');
    });


    it('should go to delete controler on reclaim', function () {

        createReclaimController();

        $scope.reclaim();

        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.delete');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe('inetnum');
        expect($stateParams.name).toBe('111%20-%20255');
        expect($stateParams.onCancel).toBe('webupdates.reclaim');

    });

    it('should present auth popup upon reclaim', function () {
        createReclaimController();
        // TODO: expect auth popup
    });

});

describe('webUpdates: ReclaimController should be able to handle escape objected with slash', function () {

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

                _$controller_('ReclaimController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
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

        $httpBackend.whenGET('api/reclaim/RIPE/route/12.235.32.0%252F19AS1680').respond([
            {key: 'TEST-MNT', type: 'mntner', mine: false},
            {key: 'TESTSSO-MNT', type: 'mntner', mine: false},

        ]);

        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
            function (method, url) {
                return [200,objectToDisplay, {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TESTSSO-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO', 'MD5-PW']}], {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });

        $httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
            function (method, url) {
                return [200, objectToDisplay, {}];
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

        $httpBackend.whenGET('api/reclaim/RIPE/route/12.235.32.0%252F19AS1680').respond([
            {key: 'TEST-MNT', type: 'mntner', mine: false},
            {key: 'TEST2-MNT', type: 'mntner', mine: false},
            {key: 'TEST3-MNT', type: 'mntner', mine: false},
        ]);

        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
            function (method, url) {
                return [200,objectToDisplay, {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TESTSSO-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TESTSSO-MNT', type: 'mntner', auth: ['SSO', 'MD5-PW']}], {}];
            });

        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST2-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TEST2-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });
        $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST3-MNT').respond(
            function (method, url) {
                return [200, [{key: 'TEST3-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
            });

        $httpBackend.expectDELETE('api/whois/RIPE/route/12.235.32.0%2F19AS1680?dry-run=true&reason=dry-run').respond(
            function (method, url) {
                return [200, objectToDisplay, {}];
            });

        $httpBackend.flush();

        $scope.reclaim();

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

});


