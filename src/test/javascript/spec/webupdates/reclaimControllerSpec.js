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

    var INETNUM='111 - 255';
    var SOURCE='RIPE';

    var createReclaimController;

    var objectToDisplay;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_, _AlertService_, _MntnerService_, _CredentialsService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            ModalService = _ModalService_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            MntnerService = _MntnerService_;
            CredentialsService = _CredentialsService_;
            $log = {
                debug: function(msg) {
                    //console.log('info:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
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

                $httpBackend.whenGET('api/user/mntners').respond([
                    {key:'TEST-MNT', type: 'mntner', auth:['SSO'], mine:true}
                ]);

                $httpBackend.expectGET('api/whois/RIPE/inetnum/111%20-%20255?password=@123&unfiltered=true').respond(
                    function(method,url) {
                        return [200, objectToDisplay, {}];
                    });

                $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                    function(method,url) {
                        return [200, [ {key:'TEST-MNT', type:'mntner', auth:['MD5-PW','SSO']} ], {}];
                    });

                CredentialsService.setCredentials('TEST-MNT', '@123');

                $stateParams.source = SOURCE;
                $stateParams.objectType = 'inetnum';
                $stateParams.name = '111%20-%20255';

                _$controller_('ReclaimController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });

                $httpBackend.flush();
            };

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {

        createReclaimController();

        expect($scope.objectType).toBe('inetnum');
        expect($scope.objectSource).toBe(SOURCE);
        expect($scope.objectName).toBe(INETNUM);
    });

    it('should go to delete controler on reclaim', function() {

        createReclaimController();

        $scope.reclaim();
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.delete');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe('inetnum');
        expect($stateParams.name).toBe('111%20-%20255');
        expect($stateParams.onCancel).toBe('webupdates.reclaim');

    });

    it('should populate the ui with attributes', function () {
        createReclaimController();

        expect($scope.attributes.getSingleAttributeOnName('inetnum').value).toBe(INETNUM);
        expect($scope.attributes.getSingleAttributeOnName('descr').value).toEqual('description');
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);
    });

    it('should transition to display state if cancel is pressed', function() {
        createReclaimController();
        spyOn($state, 'transitionTo');

        $scope.cancel();

        expect($state.transitionTo).toHaveBeenCalledWith('webupdates.display', { source: SOURCE, objectType: 'inetnum', name: INETNUM, method: undefined});
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

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _MntnerService_, _$q_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            MntnerService = _MntnerService_;
            $q = _$q_;

            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.source = SOURCE;
            $stateParams.name = NAME;

            $httpBackend.whenGET('api/user/mntners').respond([
                {key: 'TEST-MNT', type: 'mntner', auth: ['SSO'], mine: true}
            ]);

            $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true').respond(
                function (method, url) {
                    return [200,
                        {
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

                        }, {}];
                });

            $httpBackend.whenGET('api/whois/autocomplete?attribute=auth&extended=true&field=mntner&query=TEST-MNT').respond(
                function (method, url) {
                    return [200, [{key: 'TEST-MNT', type: 'mntner', auth: ['MD5-PW']}], {}];
                });

            _$controller_('ReclaimController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams
            });

            $httpBackend.whenGET(/.*.html/).respond(200);

        });
    });

});

