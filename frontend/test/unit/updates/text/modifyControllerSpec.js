'use strict';

describe('textUpdates: TextModifyController', function () {

    var $scope, $state, $stateParams, $httpBackend, $q;
    var WhoisResources;
    var AlertService;
    var PreferenceService;
    var ModalService;
    var CredentialsService;
    var OBJECT_TYPE = 'person';
    var SOURCE = 'RIPE';
    var OBJECT_NAME = 'TP-RIPE';
    var setupController;
    var initialState;

    var testPersonRpsl =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'last-modified: 2012-02-27T10:11:12Z\n'+
        'source:RIPE\n';


    var testPersonRpslScreen =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'source:RIPE\n';

    var testPersonRpslMissingPhone =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:\n' +
        'nic-hdl:TP-RIPE\n' +
        'mnt-by:TEST-MNT\n' +
        'source:RIPE\n';

    var testPersonObject = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'nic-hdl', value: 'TP-RIPE'}]},
                    attributes: {
                        attribute: [
                            {name: 'person', value: 'test person'},
                            {name: 'address', value: 'Amsterdam'},
                            {name: 'phone', value: '+316'},
                            {name: 'nic-hdl', value: 'TP-RIPE'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }
    }

    beforeEach(function () {
        module('textUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _$q_,
                         _MessageStore_, _WhoisResources_, _AlertService_, _ModalService_, _PreferenceService_, _CredentialsService_) {

            $scope = _$rootScope_.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $q = _$q_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            PreferenceService = _PreferenceService_;
            ModalService = _ModalService_;
            CredentialsService = _CredentialsService_;

            var logger = {
                debug: function (msg) {
                    //console.log('info:' + msg);
                },
                info: function (msg) {
                    //console.log('info:' + msg);
                },
                error: function (msg) {
                    //console.log('error:' + msg);
                }
            };

            PreferenceService.setTextMode();

            setupController = function(objectType, objectName, noRedirect, rpsl) {

                $stateParams.source = SOURCE;
                $stateParams.objectType = (_.isUndefined(objectType) ? OBJECT_TYPE : objectType);
                $stateParams.name = (_.isUndefined(objectName) ? OBJECT_NAME : objectName);
                $stateParams.noRedirect = noRedirect;
                $stateParams.rpsl = rpsl;

                _$controller_('TextModifyController', {
                    $scope: $scope,
                    $state: $state,
                    $stateParams: $stateParams,
                    AlertService: AlertService,
                    $log: logger
                });
                initialState = $state.current.name;
            };

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();


        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {
        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe(OBJECT_TYPE);
        expect($scope.object.name).toBe(OBJECT_NAME);
    });

    it('should get rpsl from url-parameter', function () {
        setupController('inetnum', "1", false, "inetnum:1\inetnum:2\n");

        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe('inetnum');
        expect($scope.object.rpsl).toBe('inetnum:1\inetnum:2\n');
    });

    it('should redirect to webupdates when web-preference is set', function () {

        PreferenceService.setWebMode();

        setupController('person', 'TP-RIPE', false);

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        expect($state.current.name).not.toBe(initialState);
        expect($state.current.name).toBe('webupdates.modify');
    });

    it('should not redirect to webupdates no-redirect is set', function () {

        PreferenceService.setWebMode();

        setupController('person', 'TP-RIPE', true);

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        expect($state.current.name).toBe(initialState);
    });

    it('should populate fetched person object in rpsl area', function () {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        expect($scope.object.rpsl).toEqual(testPersonRpslScreen );
    });

    it('should report an error when mandatory field is missing', function () {
        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        $scope.object.rpsl = testPersonRpslMissingPhone;
        $scope.submit();

        expect(AlertService.getErrors()).toEqual([
            {plainText: 'phone: Mandatory attribute not set'},
        ]);

    });

    it('should navigate to display after successful submit', function () {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        $scope.object.rpsl = testPersonRpsl;
        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE?unformatted=true').respond(testPersonObject);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TP-RIPE');
    });


    it('should navigate to delete after pressing delete button', function () {

        setupController('route', '12.235.32.0%2F19AS1680');

        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        //                    api/whois/RIPE/route/12.235.32.0%252F19AS1680?unfiltered=true&unformatted=true
        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, routeJSON, {}];
            });

        $httpBackend.flush();

        $scope.deleteObject();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.delete');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('route');
        expect($stateParams.name).toBe('12.235.32.0%2F19AS1680');
        expect($stateParams.onCancel).toBe('textupdates.modify');
    });

    it('should navigate to display after successful submit with a slash', function () {

        setupController('route', '12.235.32.0%2F19AS1680');

        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        $httpBackend.whenGET('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, routeJSON, {}];
            });


        $httpBackend.flush();

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/route/12.235.32.0%2F19AS1680?unformatted=true').respond(routeJSON);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('route');
        expect($stateParams.name).toBe('12.235.32.0%2F19AS1680');
    });

    it('should report a fetch failure', function () {
        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(400, {
                "errormessages": {
                    "errormessage": [{
                        "severity": "Error",
                        "text": "ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                        "args": [{"value": "RIPE"}]
                    }]
                }
            }
        );
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);

        $httpBackend.flush();

        var plaintextErrors = _.map(AlertService.getErrors(), function (item) {
            return {plainText: item.plainText};
        });
        expect(plaintextErrors).toEqual([
                {plainText: 'ERROR:101: no entries found\n\nNo entries found in source RIPE.\n'}]
        );
    });

    it('should give warning if fetching SSO mntners fails', function () {
        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function () {
                return [200, testPersonObject, {}];
            });

        $httpBackend.whenGET('api/user/mntners').respond(503);
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toEqual(1);
        var plaintextErrors = _.map(AlertService.getErrors(), function (item) {
            return {plainText: item.plainText};
        });
        expect(plaintextErrors).toEqual([
            {plainText: 'Error fetching maintainers associated with this SSO account'}
        ]);

    });

    it('should show error after submit failure with incorrect attr', function () {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function () {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([{
            key: 'TEST-MNT',
            type: 'mntner',
            auth: ['SSO'],
            mine: true
        }]);
        $httpBackend.flush();

        var stateBefore = $state.current.name;

        $scope.object.rpsl = testPersonRpsl;

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE?unformatted=true').respond(400, {
            objects: {
                object: [
                    {
                        'primary-key': {attribute: [{name: 'nic-hdl', value: 'TP-RIPE'}]},
                        attributes: {
                            attribute: [
                                {name: 'person', value: 'test person'},
                                {name: 'address', value: 'Amsterdam'},
                                {name: 'phone', value: '+316'},
                                {name: 'nic-hdl', value: 'TP-RIPE'},
                                {name: 'mnt-by', value: 'TEST-MNT'},
                                {name: 'source', value: 'RIPE'}
                            ]
                        }
                    }
                ]
            },
            errormessages: {
                errormessage: [
                    {
                        severity: 'Error',
                        text: '"%s" is not valid for this object type',
                        'args': [{value: 'mnt-ref'}]
                    }]

            }
        });
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toEqual(1);
        var plaintextErrors = _.map(AlertService.getErrors(), function (item) {
            return {plainText: item.plainText};
        });
        expect(plaintextErrors).toEqual([
            {plainText: '"mnt-ref" is not valid for this object type'}
        ]);

        expect($scope.object.rpsl).toEqual(testPersonRpsl);

        expect($state.current.name).toBe(stateBefore);

    });

    it('should extract password from rpsl', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
            var deferredObject = $q.defer();
            CredentialsService.setCredentials('TEST-MNT', 'secret');
            deferredObject.resolve({selectedItem:{key:'TEST-MNT', name:'mntner', mine:true}});
            return deferredObject.promise;
        });

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);

        $httpBackend.flush();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

        $scope.object.rpsl = testPersonRpsl + 'password:secret2\n';

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE?password=secret2&password=secret&unformatted=true').respond(testPersonObject);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TP-RIPE');

    });

    it('should present password popup when trying to modify object with no sso mnt-by ', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
            var deferredObject = $q.defer();
            CredentialsService.setCredentials('TEST-MNT', 'secret');
            deferredObject.resolve({selectedItem:{key:'TEST-MNT', name:'mntner', mine:true}});
            return deferredObject.promise;
        });

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, testPersonObject, {}];
            });

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);

        $httpBackend.flush();

        $scope.object.rpsl = testPersonRpsl;

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();
    });

    it('should re-fetch maintainer after authentication', function () {
        spyOn(ModalService, 'openAuthenticationModal').and.callFake(function () {
            var deferredObject = $q.defer();
            CredentialsService.setCredentials('TEST-MNT', 'secret');
            deferredObject.resolve({selectedItem:{key:'TEST-MNT', name:'mntner', mine:true}});
            return deferredObject.promise;
        });

        setupController('mntner', 'TEST-MNT');

        $httpBackend.whenGET('api/whois/RIPE/mntner/TEST-MNT?unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, {
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'mntner', value: 'TEST-MNT'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'mntner', value: 'TEST-MNT'},
                                        {name: 'descr', value: '.'},
                                        {name: 'admin-c', value: 'TP-RIPE'},
                                        {name: 'upd-to', value: 'email@email.com'},
                                        {name: 'auth', value: 'MD5-PW first fetch'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }

                }]
            });

        $httpBackend.whenGET('api/user/mntners').respond([
            {'key': 'TESTSSO-MNT', 'type': 'mntner', 'auth': ['SSO'], 'mine': true}
        ]);


        $httpBackend.whenGET('api/whois/RIPE/mntner/TEST-MNT?password=secret&unfiltered=true&unformatted=true').respond(
            function (method, url) {
                return [200, {
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'mntner', value: 'TEST-MNT'}]},
                                attributes: {
                                    attribute: [
                                        {name: 'mntner', value: 'TEST-MNT'},
                                        {name: 'descr', value: '.'},
                                        {name: 'admin-c', value: 'TP-RIPE'},
                                        {name: 'upd-to', value: 'email@email.com'},
                                        {name: 'auth', value: 'MD5-PW authenticated refetch'},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }
                }]
            });

        $httpBackend.flush();

        expect(ModalService.openAuthenticationModal).toHaveBeenCalled();

        expect($scope.object.rpsl).toEqual('mntner:TEST-MNT\n' +
            'descr:.\n' +
            'admin-c:TP-RIPE\n' +
            'upd-to:email@email.com\n' +
            'auth:MD5-PW authenticated refetch\n' +
            'mnt-by:TEST-MNT\n' +
            'source:RIPE\n');

    });

    var routeJSON = {
        objects: {
            object: [
                {
                    'primary-key': {attribute: [{name: 'route', value: '12.235.32.0/19AS1680'}]},
                    attributes: {
                        attribute: [
                            {name: 'route', value: '12.235.32.0/19AS1680'},
                            {name: 'descr', value: 'My descr'},
                            {name: 'origin', value: 'AS123'},
                            {name: 'mnt-by', value: 'TEST-MNT'},
                            {name: 'source', value: 'RIPE'}
                        ]
                    }
                }
            ]
        }

    };

});
