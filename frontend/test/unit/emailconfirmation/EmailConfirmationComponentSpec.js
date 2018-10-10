'use strict';

describe('testing EmailConfirmation', function () {

    var $componentController;
    var $stateParams;
    var $httpBackend;
    var $state;

    beforeEach(module('fmp'));
    beforeEach(inject(function (_$componentController_, _$stateParams_, _$httpBackend_, _$state_) {
        $componentController = _$componentController_;
        $stateParams = _$stateParams_;
        $state = _$state_;
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Testing with logged in user', function () {
        var url = 'api/whois-internal/api/abuse-validation/validate-token?token=123456789012345678';
        var ctrl;

        beforeEach(function() {
            loggedIn();
            $stateParams.t = "123456789012345678";

            ctrl = $componentController('emailConfirmation', {
                $stateParams: $stateParams,
                $httpBackend: $httpBackend
            });

            expect(ctrl.loading).toEqual(true);
            expect(ctrl.validEmail).toEqual(false);
            expect(ctrl.token).toEqual("123456789012345678");
        });

        it('should show invalid link page', function () {
            $httpBackend.when('GET', url).respond(200);
            $httpBackend.flush();
            expect(ctrl.loading).toEqual(false);
            expect(ctrl.validEmail).toEqual(true);
        });
        it('should show confirmation page', function () {
            $httpBackend.when('GET', url).respond(404);
            $httpBackend.flush();
            expect(ctrl.loading).toEqual(false);
            expect(ctrl.validEmail).toEqual(false);
        });
    });

    describe('Testing Not logged in user', function () {
        var url = 'api/whois-internal/api/abuse-validation/validate-token?token=123456789012345678';
        var ctrl;

        beforeEach(function() {
            $stateParams.t = "123456789012345678";

            ctrl = $componentController('emailConfirmation', {
                $stateParams: $stateParams,
                $httpBackend: $httpBackend
            });

            expect(ctrl.loading).toEqual(true);
            expect(ctrl.validEmail).toEqual(false);
            expect(ctrl.token).toEqual("123456789012345678");
        });

        it('should show invalid link page', function () {
            $httpBackend.when('GET', url).respond(200);
            $httpBackend.flush();
            expect(ctrl.loading).toEqual(false);
            expect(ctrl.validEmail).toEqual(true);
        });
        it('should show confirmation page', function () {
            $httpBackend.when('GET', url).respond(404);
            $httpBackend.flush();
            expect(ctrl.loading).toEqual(false);
            expect(ctrl.validEmail).toEqual(false);
        });
    });

    function loggedIn(){
        $httpBackend.when('GET', 'api/user/info').respond(200);
    }
});
