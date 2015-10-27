'use strict';

describe('webUpdates: DeleteController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var objectToDisplay;
    var multipleObjectsToDisplay;
    var WhoisResources;
    var ModalService;
    var AlertService;
    var OBJECT_TYPE = 'route';
    var SOURCE = 'RIPE';
    var createDeleteController;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _ModalService_, _WhoisResources_, _AlertService_) {

            var $rootScope = _$rootScope_;
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

            createDeleteController = function() {

                _$controller_('DeleteController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams,
                    WhoisResources:WhoisResources, ModalService:ModalService,  AlertService:AlertService

                });
                $stateParams.source = SOURCE;
                $stateParams.objectType = OBJECT_TYPE;
                $stateParams.name = 'bla';

            };

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();

        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    //it('should display delete object modal', function() {
    //    spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then:function(a,b){}});
    //
    //    createDeleteController();
    //
    //    $scope.source = SOURCE;
    //    $scope.objectType = OBJECT_TYPE;
    //    $scope.name = 'route1';
    //    //
    //    //$scope.deleteObject();
    //
    //    expect(ModalService.openDeleteObjectModal).toHaveBeenCalledWith($scope.source, $scope.objectType, $scope.name);
    //});

    //it('should display errors if delete object fail', function() {
    //    spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b(whoisObjectWithErrors); }});
    //
    //    expect($scope.errors).toEqual( [ { severity: 'Error', text: 'Unrecognized source: %s', args: [ { value: 'INVALID_SOURCE' } ], plainText: 'Unrecognized source: INVALID_SOURCE' } ]);
    //});
    //
    //
    //it('should display generic errors if delete object fail without returning a whois object', function() {
    //    spyOn(ModalService, 'openDeleteObjectModal').and.returnValue({then: function(a, b) { b('just text'); }});
    //
    //    expect($scope.errors).toEqual([{ plainText:'Error deleting object. Please reload and try again.'}]);
    //});

    //it('should populate the ui from message-store - 1 object', function () {
    //    var stateBefore = $state.current.name;
    //
    //    MessageStore.add('DELETE_RESULT', objectToDisplay);
    //    createDeleteController();
    //
    //    expect($scope.deletedObjects.length).toBe(1);
    //
    //    var whoisobject = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
    //    expect(whoisobject.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');
    //
    //    expect($state.current.name).toBe(stateBefore);
    //
    //});
    //
    //it('should populate the ui from message-store - Multiple objects', function () {
    //    var stateBefore = $state.current.name;
    //
    //    MessageStore.add('DELETE_RESULT', multipleObjectsToDisplay);
    //    createDeleteController();
    //
    //    expect($scope.deletedObjects.length).toBe(2);
    //
    //    var asblock1 = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
    //    var asblock2 = WhoisResources.wrapAttributes($scope.deletedObjects[1].attributes.attribute);
    //
    //    expect(asblock1.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');
    //    expect(asblock2.getSingleAttributeOnName('as-block').value).toBe('AS10 - AS20');
    //
    //    expect($state.current.name).toBe(stateBefore);
    //
    //});
});
