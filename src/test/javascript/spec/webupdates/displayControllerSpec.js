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

            $httpBackend.whenGET(/.*.html/).respond(200);

            $httpBackend.flush();


        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get source from url', function () {
        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        expect($scope.objectSource).toBe(SOURCE);
    });

    it('should get objectType from url', function () {
        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        expect($scope.objectType).toBe(OBJECT_TYPE);
    });

    it('should get objectName from url', function () {
        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        expect($scope.objectName).toBe(OBJECT_NAME);
    });

    it('should populate the ui from message-store', function () {
        var stateBefore = $state.current.name;

        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBe(OBJECT_NAME);
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER);
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe(stateBefore);

    });

    it('should populate the ui from rest ok', function () {
        var stateBefore = $state.current.name;

        // no objects in message store
        createDisplayController();

        $httpBackend.expectGET('api/whois/RIPE/as-block/MY-AS-BLOCK').respond(function(method,url) {
            return [200, objectToDisplay, {}];
        });
        $httpBackend.flush();

        expect($scope.attributes.getSingleAttributeOnName('as-block').value).toBe(OBJECT_NAME);
        expect($scope.attributes.getAllAttributesOnName('mnt-by')[0].value).toEqual(MNTNER);
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);

        expect($state.current.name).toBe(stateBefore);

    });

    it('should populate the ui from rest failure', function () {
        var stateBefore = $state.current.name;

        // no objects in message store
        createDisplayController();

        $httpBackend.expectGET('api/whois/RIPE/as-block/MY-AS-BLOCK').respond(function(method,url) {
            return [404, {
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

        expect($state.current.name).toBe(stateBefore);

    });

    it(' navigate to select screen', function () {
        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        $scope.navigateToSelect();

        expect($state.current.name).toBe('select');

    });

    it('should navigate to modify screen', function () {
        MessageStore.add(objectToDisplay.getObjectUid(), objectToDisplay);
        createDisplayController();

        // TODO fix
        //$scope.navigateToModify();

        //expect($state.current.name).toBe('modify');
        //expect($stateParams.source).toBe(SOURCE);
        //expect($stateParams.objectType).toBe(OBJECT_TYPE);
        //expect($stateParams.name).toBe(OBJECT_NAME);
    });


});

