/*global afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: displayPersonMntnerPairComponent', function () {

    var $state, $stateParams, $httpBackend;
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
    var $ctrl;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _MessageStore_, _WhoisResources_, _AlertService_,_RestService_) {

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

                $ctrl = _$componentController_('displayPersonMntnerPairComponent', {
                    $state: $state, $stateParams: $stateParams,
                    WhoisResources:WhoisResources, MessageStore:MessageStore,
                    RestService:RestService,  AlertService:AlertService
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

        expect($ctrl.objectSource).toBe(SOURCE);
        expect($ctrl.personName).toBe(PERSON_NAME);
        expect($ctrl.mntnerName).toBe(MNTNER_NAME);
    });


    it('should populate the ui from message-store', function () {
        var stateBefore = $state.current.name;

        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();

        expect($ctrl.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($ctrl.personAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').value).toBe(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual(PERSON_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

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

        expect($ctrl.personAttributes.getSingleAttributeOnName('person').value).toBe(PERSON_NAME);
        expect($ctrl.personAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($ctrl.personAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('mntner').value).toBe(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('admin-c').value).toEqual(PERSON_NAME);
        expect($ctrl.mntnerAttributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

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

        expect($ctrl.AlertService.getErrors()[0].plainText).toEqual('Unrecognized source: INVALID_SOURCE');
        expect($ctrl.AlertService.getWarnings()[0].plainText).toEqual('Not authenticated');

        expect($state.current.name).toBe('webupdates.select');

    });

    it('should navigate to select screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();
        $httpBackend.whenGET(/.*.html/).respond(200);
        $ctrl.navigateToSelect().then(function() {
            expect($state.current.name).toBe('webupdates.select');
        });
    });

    it('should navigate to modify person screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();
        $httpBackend.whenGET(/.*.html/).respond(200);
        $ctrl.navigateToModifyPerson().then(function () {
            expect($state.current.name).toBe('webupdates.modify');
            expect($stateParams.source).toBe(SOURCE);
            expect($stateParams.objectType).toBe('person');
            expect($stateParams.name).toBe(PERSON_NAME);
        });
    });

    it('should navigate to modify mntner screen', function () {
        MessageStore.add(personToDisplay.getPrimaryKey(), personToDisplay);
        MessageStore.add(mntnerToDisplay.getPrimaryKey(), mntnerToDisplay);

        createController();

        $httpBackend.whenGET(/.*.html/).respond(200);
        $ctrl.navigateToModifyMntner().then(function() {
            expect($state.current.name).toBe('webupdates.modify');
            expect($stateParams.source).toBe(SOURCE);
            expect($stateParams.objectType).toBe('mntner');
            expect($stateParams.name).toBe(MNTNER_NAME);
        });
    });

});

