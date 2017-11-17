'use strict';

describe('testing ForgotMaintainerPasswordComponent', function () {

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

    function getFmp(mntnerKey, voluntary){
        return {
            email: "",
            mntnerKey: mntnerKey,
            reason: "",
            voluntary: voluntary
        }
    }
    describe('Testing initialisation logged in', function () {
        beforeEach(function() {
            loggedIn();
        });

        it('should init controller with empty pdf url', function () {
            var ctrl = $componentController('fmp');
            $httpBackend.flush();
            expect(ctrl.generatedPDFUrl).toEqual("");
        });

        it('should init controller with ForgotMaintainerPassword', function () {
            $stateParams.mntnerKey = "mnt-key";
            $stateParams.voluntary = true;
            var ctrl = $componentController('fmp', {
                $stateParams: $stateParams
            });
            $httpBackend.flush();
            expect(ctrl.fmpModel).toEqual(getFmp("mnt-key",true));
        });

        it('should init controller with ForgotMaintainerPassword', function () {
            $stateParams.mntnerKey = "mnt-key";
            $stateParams.voluntary = false;
            var ctrl = $componentController('fmp', {
                $stateParams: $stateParams
            });
            $httpBackend.flush();
            expect(ctrl.fmpModel).toEqual(getFmp("mnt-key",false));
        });

        it('should init controller with ForgotMaintainerPassword with voluntary as false', function () {
            $stateParams.mntnerKey = "mnt-key";
            var ctrl = $componentController('fmp', {
                $stateParams: $stateParams
            });
            $httpBackend.flush();
            expect(ctrl.fmpModel).toEqual(getFmp("mnt-key",false));
        });
    });

    describe('Testing process after click', function () {
        beforeEach(function() {
            loggedIn();
        });
        it('should call backend and generate pdf url', function () {
            var url = "api/whois-internal/api/fmp-pub/forgotmntnerpassword";
            $stateParams.mntnerKey = "mnt-key";
            $stateParams.voluntary = true;

            var ctrl = $componentController('fmp', {
                $stateParams: $stateParams,
                $httpBackend: $httpBackend
            });

            expect(ctrl.fmpModel).toEqual(getFmp("mnt-key",true));
            ctrl.fmpModel.email = "test@test.com";
            ctrl.fmpModel.reason = "Testing reason";

            expect(ctrl.generatedPDFUrl).toEqual("");
            $httpBackend.when('POST', url, ctrl.fmpModel).respond(200);

            ctrl.next(ctrl.fmpModel, true);
            $httpBackend.flush();
            expect(ctrl.generatedPDFUrl).toEqual(url+"/"+btoa(JSON.stringify(ctrl.fmpModel)));
        });

        it('should not call backend and generate pdf url if form is invalid', function () {
            $stateParams.mntnerKey = "mnt-key";
            $stateParams.voluntary = true;

            var ctrl = $componentController('fmp', {
                $stateParams: $stateParams,
                $httpBackend: $httpBackend
            });

            expect(ctrl.fmpModel).toEqual(getFmp("mnt-key",true));
            expect(ctrl.generatedPDFUrl).toEqual("");
            ctrl.next(ctrl.fmpModel, false);
            $httpBackend.flush();
            expect(ctrl.generatedPDFUrl).toEqual("");
        });
    });

    describe('Testing Not logged in user', function () {
        it('Not logged in user', function () {
            $httpBackend.when('GET', 'api/user/info').respond(403);
            $componentController('fmp');
            $httpBackend.flush();
            expect($state.current.name).toBe('fmp.requireLogin');
        });
    });

    function loggedIn(){
        $httpBackend.when('GET', 'api/user/info').respond(200);
    }
});
