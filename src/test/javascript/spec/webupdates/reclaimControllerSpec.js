'use strict';

describe('webUpdates: ReclaimController', function () {

    var $scope, $state, $stateParams, $httpBackend;
    var WhoisResources;
    var ModalService;
    var AlertService;
    var $rootScope;
    var $log;

    var INETNUM='111 - 255';
    var SOURCE='RIPE';

    var createReclaimController;

    var objectToDisplay;

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

            $log = {
                debug: function(msg) {
                    //console.log('info:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
                    //console.log('error:'+msg);
                }
            };

            objectToDisplay = WhoisResources.wrapWhoisResources(
                {
                    objects: {
                        object: [
                            {
                                'primary-key': {attribute: [{name: 'inetnum', value: INETNUM}]},
                                attributes: {
                                    attribute: [
                                        {name: 'inetnum', value: INETNUM},
                                        {name: 'mnt-by', value: 'TEST-MNT'},
                                        {name: 'descr', value: 'description'},
                                        {name: 'source', value: 'RIPE'}
                                    ]
                                }
                            }
                        ]
                    }

                });

            createReclaimController = function () {

                $httpBackend.whenGET(/.*.html/).respond(200);

                $httpBackend.expectGET('api/whois/RIPE/inetnum/111%20-%20255?unfiltered=true').respond(function(method,url) {
                    return [200, objectToDisplay, {}];
                });

                $stateParams.source = SOURCE;
                $stateParams.objectType = 'inetnum';
                $stateParams.name = '111%20-%20255';

                _$controller_('ReclaimController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams
                });

                $httpBackend.flush();
            };


        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get parameters from url', function () {

        createReclaimController();

        expect($scope.objectType).toBe('inetnum');
        expect($scope.objectSource).toBe(SOURCE);
        expect($scope.objectName).toBe(INETNUM);
    });

    it('should go to delete controler on reclaim', function() {

        createReclaimController();

        $scope.reclaim();
        $httpBackend.flush();

        expect($state.current.name).toBe('delete');
        expect($stateParams.onCancel).toBe('reclaim');
    });

    it('should populate the ui with attributes', function () {
        createReclaimController();

        expect($scope.attributes.getSingleAttributeOnName('inetnum').value).toBe(INETNUM);
        expect($scope.attributes.getSingleAttributeOnName('descr').value).toEqual('description');
        expect($scope.attributes.getSingleAttributeOnName('source').value).toEqual(SOURCE);
    });

});
