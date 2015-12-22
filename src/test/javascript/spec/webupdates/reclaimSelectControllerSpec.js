'use strict';

describe('webUpdates: ReclaimSelectController', function () {
    var reclaimSelectController;

    var $scope, $rootScope, $state, $stateParams, $window, $httpBackend;

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
            source: 'RIPE',
            objectType: 'inetnum',
            name: '127.0.0.1 - 127.0.0.10'
        };

        $scope.navigateToReclaim();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.reclaim');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('inetnum');
        expect($stateParams.name).toBe('127.0.0.1%20-%20127.0.0.10');
    });

});

