'use strict';

describe('textUpdates: TextModifyController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var AlertService;
    var PreferenceService;
    var OBJECT_TYPE = 'person';
    var SOURCE = 'RIPE';
    var OBJECT_NAME = 'TP-RIPE';
    var setupController;
    var setupBackend;
    var initialState;

    var testPersonRpsl =
        'person:test person\n' +
        'address:Amsterdam\n' +
        'phone:+316\n' +
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
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _AlertService_,_PreferenceService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            PreferenceService = _PreferenceService_;

            PreferenceService.setTextMode();

            setupController = function(objectType, objectName, noRedirect, rpsl) {

                $stateParams.source = SOURCE;
                $stateParams.objectType = (_.isUndefined(objectType) ? OBJECT_TYPE : objectType);
                $stateParams.name = (_.isUndefined(objectName) ? OBJECT_NAME : objectName);
                $stateParams.noRedirect = noRedirect;
                $stateParams.rpsl = rpsl;

                _$controller_('TextModifyController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams, AlertService: AlertService
                });
                initialState = $state.current.name;
            }

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

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
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

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($state.current.name).not.toBe(initialState);
        expect($state.current.name).toBe('webupdates.modify');
    });

    it('should not redirect to webupdates no-redirect is set', function () {

        PreferenceService.setWebMode();

        setupController('person', 'TP-RIPE', true);

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($state.current.name).toBe(initialState);
    });

    it('should populate fetched person object in rpsl area', function() {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        expect($scope.object.rpsl).toEqual(testPersonRpsl);
    });

    it('should navigate to display after successful submit', function () {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        $scope.object.rpsl = testPersonRpsl;
        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE').respond(testPersonObject);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TP-RIPE');
    });


    it('should report a fetch failure', function () {



        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(400,{
                "errormessages": {
                    "errormessage": [{
                        "severity":"Error",
                        "text":"ERROR:101: no entries found\n\nNo entries found in source %s.\n",
                        "args": [{"value":"RIPE"}]
                    }]
                }
            }
        );
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        var plaintextErrors = _.map(AlertService.getErrors(), function(item) {
            return {plainText:item.plainText};
        });
        expect(plaintextErrors).toEqual([
            {plainText: 'ERROR:101: no entries found\n\nNo entries found in source RIPE.\n'}]
        );
    });

    it('should show error after submit failure with incorrect attr', function () {

        setupController();

        $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
            function(method,url) {
                return [200, testPersonObject, {}];
            });
        $httpBackend.whenGET('api/user/mntners').respond([]);
        $httpBackend.flush();

        var stateBefore = $state.current.name;

        $scope.object.rpsl = testPersonRpsl + 'mnt-ref: bad\n';

        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE').respond(400,{
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
                    } ]

            }
        });
        $httpBackend.flush();

        expect(AlertService.getErrors().length).toEqual(1);
        var plaintextErrors = _.map(AlertService.getErrors(), function(item) {
            return {plainText:item.plainText};
        });
        expect(plaintextErrors).toEqual([
            {plainText: '"mnt-ref" is not valid for this object type'}
        ]);

        expect($scope.object.rpsl).toEqual(testPersonRpsl + 'mnt-ref: bad\n');

        expect($state.current.name).toBe(stateBefore);

    });


});
