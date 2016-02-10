'use strict';

describe('webUpdates: DeleteController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var ModalService;
    var AlertService;
    var OBJECT_TYPE = 'as-block';
    var SOURCE = 'RIPE';
    var ON_CANCEL = 'modify';
    var createDeleteController;
    var $rootScope;
    var objectToDisplay;
    var multipleObjectsToDisplay;
    var whoisObjectWithErrors;
    var $log;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_, _AlertService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            ModalService = _ModalService_;
            WhoisResources = _WhoisResources_;
            AlertService = _AlertService_;

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

            $log = {
                debug: function(msg) {
                    //console.log('debug:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
                    //console.log('error:'+msg);
                }
            };

            createDeleteController = function() {

                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = 'AS1 - AS2';
                $stateParams.onCancel = ON_CANCEL;

                $state.current.name = 'delete';

                _$controller_('DeleteController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams, $log: $log,
                    WhoisResources:WhoisResources, ModalService:ModalService,  AlertService:AlertService

                });

            };

            $httpBackend.whenGET(/.*.html/).respond(200);
            $httpBackend.flush();
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should display delete object modal', function() {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then:function(a,b){}});

        createDeleteController();

        expect(ModalService.openDeleteObjectModal).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name, $scope.onCancel);
    });

    it('should display errors if delete object fail', function() {
        var error = {
            data:whoisObjectWithErrors
        };

        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(WhoisResources.wrapError(error)); }});

        createDeleteController();

        expect(AlertService.getErrors()).toEqual( [ { severity: 'Error', text: 'Unrecognized source: %s', args: [ { value: 'INVALID_SOURCE' } ], plainText: 'Unrecognized source: INVALID_SOURCE' } ]);

        expect($state.current.name).toBe('delete');
    });


    it('should display generic errors if delete object fail without returning a whois object', function() {
        var error = {
            data:'just text'
        };

        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(WhoisResources.wrapError(error)); }});

        createDeleteController();

        expect(AlertService.getErrors()).toEqual([{ severity: 'Error', text:'Unexpected error: please retry later', plainText:'Unexpected error: please retry later'}]);

        expect($state.current.name).toBe('delete');
    });

    it('should populate the ui after delete with 1 object', function () {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { a(objectToDisplay); }})

        createDeleteController();

        expect($scope.deletedObjects.length).toBe(1);

        var whoisobject = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
        expect(whoisobject.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');

        expect($state.current.name).toBe('delete');
    });

    it('should populate the ui from message-store - Multiple objects', function () {
        spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { a(multipleObjectsToDisplay); }})

        createDeleteController();

        expect($scope.deletedObjects.length).toBe(2);

        var asblock1 = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
        var asblock2 = WhoisResources.wrapAttributes($scope.deletedObjects[1].attributes.attribute);

        expect(asblock1.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');
        expect(asblock2.getSingleAttributeOnName('as-block').value).toBe('AS10 - AS20');

        expect($state.current.name).toBe('delete');
    });
});
