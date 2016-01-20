'use strict';

describe('webUpdates: ForceDeleteSelectController', function () {
    var forceDeleteSelectController;

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

            forceDeleteSelectController = function() {
                _$controller_('ForceDeleteSelectController', {
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

    it('should navigate to force delete screen', function () {
        forceDeleteSelectController();

        $scope.selected = {
            source: 'RIPE',
            objectType: 'inetnum',
            name: '127.0.0.1 - 127.0.0.10'
        };

        $scope.navigateToForceDelete();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.forceDelete');
        expect($stateParams.source).toBe('RIPE');
        expect($stateParams.objectType).toBe('inetnum');
        expect($stateParams.name).toBe('127.0.0.1%20-%20127.0.0.10');
    });

});

