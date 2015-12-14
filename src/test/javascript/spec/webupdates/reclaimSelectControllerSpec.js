'use strict';

describe('webUpdates: ReclaimSelectController', function () {
    var reclaimSelectController;

    var $scope, $rootScope, $state, $stateParams, $window, $httpBackend;
    var OBJECT_TYPE = 'inetnum';
    var OBJECT_NAME = '127.0.0.1 - 127.0.0.10';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$window_, _$httpBackend_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;

            reclaimSelectController = function() {
                _$controller_('ReclaimSelectController', {
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

    it('should navigate to reclaim screen', function () {
        reclaimSelectController();

        $scope.selected = {
            source: SOURCE,
            objectType: OBJECT_TYPE,
            name: OBJECT_NAME
        };

        $scope.navigateToReclaim();

        $httpBackend.flush();

        expect($state.current.name).toBe('reclaim');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
        expect($stateParams.name).toBe(OBJECT_NAME);
    });

});

