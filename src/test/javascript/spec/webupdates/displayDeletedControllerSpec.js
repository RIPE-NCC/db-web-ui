'use strict';

describe('webUpdates: DisplayDeletedController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var MessageStore;
    var WhoisResources;
    var objectToDisplay;
    var multipleObjectsToDisplay;
    var createDisplayDeletedController;

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

            createDisplayDeletedController = function() {

                _$controller_('DisplayDeletedController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });
                $stateParams.source = 'ripe';
                $stateParams.objectType = 'bla';
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

    it('should populate the ui from message-store - 1 object', function () {
        var stateBefore = $state.current.name;

        MessageStore.add('DELETE_RESULT', objectToDisplay);
        createDisplayDeletedController();

        expect($scope.deletedObjects.length).toBe(1);

        var whoisobject = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
        expect(whoisobject.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');

        expect($state.current.name).toBe(stateBefore);

    });

    it('should populate the ui from message-store - Multiple objects', function () {
        var stateBefore = $state.current.name;

        MessageStore.add('DELETE_RESULT', multipleObjectsToDisplay);
        createDisplayDeletedController();

        expect($scope.deletedObjects.length).toBe(2);

        var asblock1 = WhoisResources.wrapAttributes($scope.deletedObjects[0].attributes.attribute);
        var asblock2 = WhoisResources.wrapAttributes($scope.deletedObjects[1].attributes.attribute);

        expect(asblock1.getSingleAttributeOnName('as-block').value).toBe('AS1 - AS2');
        expect(asblock2.getSingleAttributeOnName('as-block').value).toBe('AS10 - AS20');

        expect($state.current.name).toBe(stateBefore);

    });
});
