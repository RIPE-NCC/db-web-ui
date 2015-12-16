'use strict';

describe('textUpdates: TextModifyController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var AlertService;
    var OBJECT_TYPE = 'person';
    var SOURCE = 'RIPE';
    var OBJECT_NAME = 'TP-RIPE';

    var testPersonRpsl =
        'person:        test person\n' +
        'address:       Amsterdam\n' +
        'phone:         +316\n' +
        'nic-hdl:       TP-RIPE\n' +
        'mnt-by:        TEST-MNT\n' +
        'source:        RIPE\n';

    var testPersonRpslNoPad =
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

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$window_, _MessageStore_, _WhoisResources_, _AlertService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;

            $stateParams.source = SOURCE;
            $stateParams.objectType = OBJECT_TYPE;
            $stateParams.name = OBJECT_NAME;

            _$controller_('TextModifyController', {
                $scope: $scope, $state: $state, $stateParams: $stateParams, AlertService: AlertService
            });


            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.whenGET('api/whois/RIPE/person/TP-RIPE?unfiltered=true').respond(
                function(method,url) {
                    return [200, testPersonObject, {}];
                });

            $httpBackend.flush();

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {
        expect($scope.object.source).toBe(SOURCE);
        expect($scope.object.type).toBe(OBJECT_TYPE);
        expect($scope.object.name).toBe(OBJECT_NAME);
    });


    it('should populate fetched person object in rpsl area', function() {
        expect($scope.object.rpsl).toEqual(testPersonRpslNoPad); // temp object with no padding, to fix
    });

    it('should navigate to display after successful submit', function () {

        $scope.object.rpsl = testPersonRpsl;
        $scope.submit();

        $httpBackend.expectPUT('api/whois/RIPE/person/TP-RIPE').respond(testPersonObject);
        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.display');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('person');
        expect($stateParams.name).toBe('TP-RIPE');
    });


    it('should show error after submit failure with incorrect attr', function () {

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

            },
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
