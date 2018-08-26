'use strict';

describe('webUpdates: ForceDeleteSelectComponent', function () {
    var forceDeleteSelectController, $ctrl;

    var $state, $stateParams, $window, $httpBackend;

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$state_, _$stateParams_, _$window_, _$httpBackend_) {

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;

            forceDeleteSelectController = function() {
                return _$componentController_('forceDeleteSelect', {
                    $state: $state, $stateParams: $stateParams
                });
            };

            $httpBackend.whenGET(/.*.html/).respond(200);
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should navigate to force delete screen', function () {
        $ctrl = forceDeleteSelectController();

        $ctrl.selected = {
            source: 'RIPE',
            objectType: 'inetnum',
            name: '127.0.0.1 - 127.0.0.10'
        };

        $ctrl.navigateToForceDelete().then(function() {
            expect($state.current.name).toBe('webupdates.forceDelete');
            expect($stateParams.source).toBe('RIPE');
            expect($stateParams.objectType).toBe('inetnum');
            expect($stateParams.name).toBe('127.0.0.1%20-%20127.0.0.10');
        });

        $httpBackend.flush();
    });

});

