/*globals afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: SelectController', function () {
    var $componentController;

    var $stateParams, $httpBackend, UserInfoService;
    var OBJECT_TYPE = 'as-set';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$componentController_, _$stateParams_, _$httpBackend_, _UserInfoService_) {
            $componentController = _$componentController_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            UserInfoService = _UserInfoService_;
            UserInfoService.clear();

            $httpBackend.whenGET(/.*.html/).respond(200);
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should navigate to crowd if currently logged out', function () {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [401, '', {}];
        });

        var $ctrl = $componentController('selectComponent');
        // $ctrl.$onInit();

        $httpBackend.flush();
        expect($ctrl.loggedIn).toBeUndefined();

        $ctrl.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        $ctrl.navigateToCreate();

        $httpBackend.flush();

        expect($ctrl.$state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
        // Note that the  error-interceptor is responsible for flagging redirect to crowd
    });


    it('should navigate to create screen when logged in', function () {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });

        var $ctrl = $componentController('selectComponent');
        // $ctrl.$onInit();

        $httpBackend.flush();

        expect($ctrl.loggedIn).toBe(true);

        $ctrl.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        $ctrl.navigateToCreate();

        $httpBackend.flush();

        expect($ctrl.$state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
    });

    it('should navigate to create person maintainer screen when logged in and selected', function () {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });

        var $ctrl = $componentController('selectComponent');
        // $ctrl.$onInit();
        $httpBackend.flush();

        expect($ctrl.loggedIn).toBe(true);

        // person-mntnr pair is default selection (top of the drop down list)
        $ctrl.navigateToCreate();
        // FIXME [IS]
        // $httpBackend.flush();
        //
        // expect($ctrl.$state.current.name).toBe('webupdates.createPersonMntnerPair');

    });

    it('should navigate to create self maintained mntner screen when logged in', function () {
        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });
        var $ctrl = $componentController('selectComponent');
        // $ctrl.$onInit();
        $httpBackend.flush();

        expect($ctrl.loggedIn).toBe(true);

        $ctrl.selected = {
            source: SOURCE,
            objectType: 'mntner'
        };

        $ctrl.navigateToCreate();

        // $httpBackend.flush();

        // expect($ctrl.$state.current.name).toBe('webupdates.createSelfMnt');
        expect($ctrl.selected.source).toBe(SOURCE);
    });

});
