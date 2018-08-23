/*global afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: DisplayPersonMntnerPairController', function () {

    var $scope, $rootScope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var AlertService;
    var RestService;
    var SOURCE = 'RIPE';
    var PERSON_NAME = 'dw-ripe';
    var MNTNER_NAME = 'aardvark-mnt';
    var personToDisplay;
    var mntnerToDisplay;
    var createController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _AlertService_,_RestService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            MessageStore = _MessageStore_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;
            RestService = _RestService_;

           personToDisplay = WhoisResources.wrapWhoisResources({
               objects: {
                   object: [
                       {
                           'primary-key': {attribute: [{name: 'person', value: PERSON_NAME}]},
                           attributes: {
                               attribute: [
                                   {name: 'person', value: PERSON_NAME},
                                   {name: 'mnt-by', value: MNTNER_NAME},
                                   {name: 'source', value: SOURCE}
                               ]
                           }
                       }
                   ]
               }
           });
            mntnerToDisplay = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'mntner', value: MNTNER_NAME}]},
                            attributes: {
                                attribute: [
                                    {name: 'mntner', value: MNTNER_NAME},
                                    {name: 'admin-c', value: PERSON_NAME},
                                    {name: 'mnt-by', value: MNTNER_NAME},
                                    {name: 'source', value: SOURCE}
                                ]
                            }
                        }
                    ]
                }
            });

            createController = function() {

                $stateParams.source = SOURCE;
                $stateParams.person = PERSON_NAME;
                $stateParams.mntner = MNTNER_NAME;

                _$controller_('DisplayPersonMntnerPairController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams,
                    WhoisResources:WhoisResources, MessageStore:MessageStore, RestService:RestService,  AlertService:AlertService
                });
            };

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should extract data from url', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();

        expect($scope.objectSource).toBe(SOURCE);
        expect($scope.personName).toBe(PERSON_NAME);
        expect($scope.mntnerName).toBe(MNTNER_NAME);
    });


    it('should populate the ui from message-store', function () {
        var stateBefore = $state.current.name;

        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();

        expect($scope.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($scope.personAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').value).toBe(MNTNER_NAME);
        expect($scope.mntnerAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual(PERSON_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe(stateBefore);

    });

    it('should populate the ui from rest ok', function () {
        // no objects in message store
        createController();

        $httpBackend.expectGET('api/whois/RIPE/person/dw-ripe?unfiltered=true').respond(function() {
            return [200, personToDisplay, {}];
        });
        $httpBackend.expectGET('api/whois/RIPE/mntner/aardvark-mnt?unfiltered=true').respond(function() {
            return [200, mntnerToDisplay, {}];
        });
        $httpBackend.flush();

        expect($scope.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($scope.personAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($scope.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($scope.mntnerAttributes.getSingleAttributeOnName('mntner').value).toBe(MNTNER_NAME);
        expect($scope.mntnerAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual(PERSON_NAME);
        expect($scope.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should populate the ui from rest failure', function () {
        // no objects in message store
        createController();

        $httpBackend.expectGET('api/whois/RIPE/person/dw-ripe?unfiltered=true').respond(function() {
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
        $httpBackend.expectGET('api/whois/RIPE/mntner/aardvark-mnt?unfiltered=true').respond(function() {
            return [200, mntnerToDisplay, {}];
        });
        $httpBackend.flush();

        expect($scope.errors[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($rootScope.warnings[0].plainText).toEqual('Not authenticated');

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should navigate to select screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();
        $httpBackend.whenGET(/.*.html/).respond(200);
        $scope.navigateToSelect().then(function() {
            expect($state.current.name).toBe('webupdates.select');
        });
    });

    it('should navigate to modify person screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();
        $httpBackend.whenGET(/.*.html/).respond(200);
        $scope.navigateToModifyPerson().then(function () {
            expect($state.current.name).toBe('webupdates.modify');
            expect($stateParams.source).toBe(SOURCE);
            expect($stateParams.objectType).toBe('person');
            expect($stateParams.name).toBe(PERSON_NAME);
        });

        // fragment of new target view will be fetched
        $httpBackend.flush();

    });


    it('should navigate to modify mntner screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();

        $httpBackend.whenGET(/.*.html/).respond(200);
        $scope.navigateToModifyMntner().then(function() {
            expect($state.current.name).toBe('webupdates.modify');
            expect($stateParams.source).toBe(SOURCE);
            expect($stateParams.objectType).toBe('mntner');
            expect($stateParams.name).toBe(MNTNER_NAME);
        });

        // fragment of new target view will be fetched
        $httpBackend.flush();
    });

});

