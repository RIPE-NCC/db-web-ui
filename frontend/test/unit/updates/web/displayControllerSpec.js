/*global afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: DisplayController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var OBJECT_NAME = 'MY-AS-BLOCK';
    var MNTNER = 'TEST-MNT';
    var objectToDisplay;
    var createDisplayController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;

            objectToDisplay = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: OBJECT_NAME}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: OBJECT_NAME},
                                    {name: 'mnt-by', value: MNTNER},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        }
                    ]
                }
            });


            createDisplayController = function() {

                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = OBJECT_NAME;


                _$controller_('DisplayController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });
            };

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function expectUserInfo(withFlush) {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, {
                user: {
                    username: 'test@ripe.net',
                    displayName: 'Test User',
                    expiryDate: [2015, 9, 9, 14, 9, 27, 863],
                    uuid: 'aaaa-bbbb-cccc-dddd',
                    active: true
                }
            }, {}];
        });
        if(withFlush) {
            $httpBackend.flush();
        }
    }

    it('should get source from url', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        expect($scope.objectSource).toBe(SOURCE);
    });

    it('should get objectType from url', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get objectName from url', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        expect($scope.objectName).toBe(OBJECT_NAME);
    });

    it('should detect logged in', function() {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        expect($scope.loggedIn).toBe(true);
    });

    it('should populate the ui from message-store', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBe(OBJECT_NAME);
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER);
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should populate the ui from rest ok', function () {
        // no objects in message store
        createDisplayController();

        expectUserInfo(false);

        $httpBackend.expectGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(function() {
            return [200, objectToDisplay, {}];
        });

        $httpBackend.flush();

        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBe(OBJECT_NAME);
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER);
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should populate the ui from rest failure', function () {
        // no objects in message store
        createDisplayController();

        expectUserInfo(false);

        $httpBackend.expectGET('api/whois/RIPE/as-block/MY-AS-BLOCK?unfiltered=true').respond(function() {
            return [403, {
                errormessages: {
                    errormessage: [
                        {
                            severity: 'Error',
                            text: 'Unrecognized source: %s',
                            'args': [{value: 'INVALID_SOURCE'}]
                        },
                        {
                            severity: 'Warning',
                            text: 'Not authenticated'
                        }
                    ]
                }
            }, {}];
        });

        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($scope.warnings[0].plainText).toEqual('Not authenticated');

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should navigate to select screen', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        $scope.navigateToSelect().then(function() {
            expect($state.current.name).toBe('webupdates.select');
        });

    });

    it('should navigate to modify screen', function () {
        MessageStore.add(objectToDisplay.getPrimaryKey(), objectToDisplay);
        createDisplayController();

        expectUserInfo(true);

        $httpBackend.whenGET(/.*.html/).respond(200);
        $scope.navigateToModify().then(function() {
            expect($state.current.name).toBe('webupdates.modify');
            expect($stateParams.source).toBe(SOURCE);
            expect($stateParams.objectType).toBe(OBJECT_TYPE);
            expect($stateParams.name).toBe(OBJECT_NAME);
        });
        $httpBackend.flush();


    });


});


describe('webUpdates: DisplayController with object containing slash', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var SOURCE = 'RIPE';
    var OBJECT_TYPE = 'route';
    var OBJECT_NAME = '212.235.32.0/19AS1680';
    var MNTNER = 'TEST-MNT';
    var objectToDisplay;
    var createDisplayController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state = _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;

            objectToDisplay = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: OBJECT_TYPE, value: OBJECT_NAME}]},
                            attributes: {
                                attribute: [
                                    {name: 'route', value: OBJECT_NAME},
                                    {name: 'mnt-by', value: MNTNER},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        }
                    ]
                }
            });


            createDisplayController = function () {

                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = OBJECT_NAME;


                _$controller_('DisplayController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });

                $httpBackend.whenGET(/.*.html/).respond(200);
                //$httpBackend.flush();

            };

        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function expectUserInfo(withFlush) {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, {
                user: {
                    username: 'test@ripe.net',
                    displayName: 'Test User',
                    uuid: 'aaaa-bbbb-cccc-dddd',
                    active: true
                }
            }, {}];
        });
        if(withFlush) {
            $httpBackend.flush();
        }
    }

    it('should populate the ui from rest ok', function () {

        // no objects in message store
        createDisplayController();

        expectUserInfo(false);

        $httpBackend.expectGET('api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true').respond(function() {
            return [200, objectToDisplay, {}];
        });

        $httpBackend.flush();

        expect($scope.attributes.getSingleAttributeOnName('route').value).toBe(OBJECT_NAME);
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER);
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

    });

    it('should navigate to modify', function () {
        // no objects in message store
        createDisplayController();

        expectUserInfo(false);

        $httpBackend.expectGET('api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true').respond(function() {
            return [200, objectToDisplay, {}];
        });

        $httpBackend.flush();

        $scope.navigateToModify();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.modify');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
        expect($stateParams.name).toBe('212.235.32.0%2F19AS1680');

    });

    it('should navigate to select', function () {
        // no objects in message store
        createDisplayController();

        expectUserInfo(false);

        $httpBackend.expectGET('api/whois/RIPE/route/212.235.32.0%2F19AS1680?unfiltered=true').respond(function() {
            return [200, objectToDisplay, {}];
        });

        $httpBackend.flush();

        $scope.navigateToSelect().then(function() {
            expect($state.current.name).toBe('webupdates.select');
        });

    });

});


