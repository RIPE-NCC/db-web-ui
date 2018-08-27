/*global afterEach, beforeEach, describe, expect, inject, it, module, spyOn*/
'use strict';

describe('webUpdates: DeleteController', function () {
    var $state, $stateParams, $httpBackend;
    var WhoisResources;
    var ModalService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var ON_CANCEL = 'modify';
    var createDeleteController;
    var objectToDisplay;
    var multipleObjectsToDisplay;
    var whoisObjectWithErrors;
    var $ctrl;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_) {

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            ModalService = _ModalService_;
            WhoisResources = _WhoisResources_;

            objectToDisplay = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: 'AS1 - AS2'}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'AS1 - AS2'},
                                    {name: 'mnt-by', value: 'TEST-MNT'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        }
                    ]
                }
            });

            multipleObjectsToDisplay = WhoisResources.wrapWhoisResources({
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: 'AS1 - AS2'}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'AS1 - AS2'},
                                    {name: 'mnt-by', value: 'TEST-MNT'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        },
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: 'AS10 - AS20'}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'AS10 - AS20'},
                                    {name: 'mnt-by', value: 'TEST-MNT'},
                                    {name: 'source', value: 'RIPE'}
                                ]
                            }
                        }
                    ]
                }
            });

            whoisObjectWithErrors = {
                objects: {
                    object: [
                        {
                            'primary-key': {attribute: [{name: 'as-block', value: 'MY-AS-BLOCK'}]},
                            attributes: {
                                attribute: [
                                    {name: 'as-block', value: 'MY-AS-BLOCK'},
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
                            text: 'Unrecognized source: %s',
                            'args': [{value: 'INVALID_SOURCE'}]
                        },
                        {
                            severity: 'Warning',
                            text: 'Not authenticated'
                        }, {
                            severity: 'Error',
                            attribute: {
                                name: 'as-block',
                                value: 'MY-AS-BLOCK'
                            },
                            text: '\'%s\' is not valid for this object type',
                            args: [{value: 'MY-AS-BLOCK'}]
                        }
                    ]
                }
            };

            createDeleteController = function() {

                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = 'AS1 - AS2';
                $stateParams.onCancel = ON_CANCEL;

                $state.current.name = 'delete';

                $ctrl = _$componentController_('deleteComponent');
            };

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should display delete object modal', function() {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then:function(){}});

        createDeleteController();

        expect($ctrl.ModalService.openDeleteObjectModal).toHaveBeenCalledWith($ctrl.source, $ctrl.objectType, $ctrl.name, $ctrl.onCancel);
    });

    it('should display errors if delete object fail', function() {
        var error = {
            data:whoisObjectWithErrors
        };

        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(WhoisResources.wrapError(error)); }});

        createDeleteController();

        expect($ctrl.AlertService.getErrors()).toEqual( [ { severity: 'Error', text: 'Unrecognized source: %s', args: [ { value: 'INVALID_SOURCE' } ], plainText: 'Unrecognized source: INVALID_SOURCE' } ]);

        expect($ctrl.$state.current.name).toBe('delete');
    });


    it('should display generic errors if delete object fail without returning a whois object', function() {
        var error = {
            data:'just text'
        };

        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(WhoisResources.wrapError(error)); }});

        createDeleteController();

        expect($ctrl.AlertService.getErrors()).toEqual([{ severity: 'Error', text:'Unexpected error: please retry later', plainText:'Unexpected error: please retry later'}]);

        expect($ctrl.$state.current.name).toBe('delete');
    });

    it('should populate the ui after delete with 1 object', function () {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a) { a(objectToDisplay); }});

        createDeleteController();

        expect($ctrl.deletedObjects.length).toBe(1);

        var whoisobject = $ctrl.WhoisResources.wrapAttributes($ctrl.deletedObjects[0].attributes.attribute);
        expect(whoisobject.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');

        expect($state.current.name).toBe('delete');
    });

    it('should populate the ui from message-store - Multiple objects', function () {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a) { a(multipleObjectsToDisplay); }});

        createDeleteController();

        expect($ctrl.deletedObjects.length).toBe(2);

        var asblock1 = $ctrl.WhoisResources.wrapAttributes($ctrl.deletedObjects[0].attributes.attribute);
        var asblock2 = $ctrl.WhoisResources.wrapAttributes($ctrl.deletedObjects[1].attributes.attribute);

        expect(asblock1.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');
        expect(asblock2.getSingleAttributeOnName('as-block').value).toBe('AS10 - AS20');

        expect($ctrl.$state.current.name).toBe('delete');
    });
});
