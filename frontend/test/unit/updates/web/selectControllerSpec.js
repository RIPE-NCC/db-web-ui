/*globals afterEach, beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('webUpdates: SelectController', function () {
    var selectController;

    var $scope, $rootScope, $state, $stateParams, $window, $httpBackend, UserInfoService;
    var OBJECT_TYPE = 'as-set';
    var SOURCE = 'RIPE';

    beforeEach(function () {
        module('webUpdates');

        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$window_, _$httpBackend_, _UserInfoService_) {

            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();

            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            UserInfoService = _UserInfoService_;
            $window = _$window_;

            UserInfoService.clear();

            selectController = function() {
                _$controller_('SelectController', {
                    $scope: $scope, $state: $state, $stateParams: $stateParams, UserInfoService: UserInfoService
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

    it('should navigate to crowd if currently logged out', function () {
        selectController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [401, '', {}];
        });
        $httpBackend.flush();
        expect($scope.loggedIn).toBeUndefined();

        $scope.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
        // Note that the  error-interceptor is responsible for flagging redirect to crowd
    });

    it('should navigate to create screen when logged in', function () {
        selectController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });
        $httpBackend.flush();

        expect($scope.loggedIn).toBe(true);

        $scope.selected.objectType = OBJECT_TYPE; // simulate select as-set in drop down

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
    });

    it('should navigate to create person maintainer screen when logged in and selected', function () {
        selectController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });
        $httpBackend.flush();

        expect($scope.loggedIn).toBe(true);

        // person-mntnr pair is default selection (top of the drop down list)
        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.createPersonMntnerPair');
    });

    it('should navigate to create self maintained mntner screen when logged in', function () {
        selectController();

        $httpBackend.expectGET('api/whois-internal/api/user/info').respond(function() {
            return [200, { user: {
                username:'test@ripe.net',
                displayName:'Test User',
                uuid:'aaaa-bbbb-cccc-dddd',
                active:true}
            }, {}];
        });
        $httpBackend.flush();

        expect($scope.loggedIn).toBe(true);

        $scope.selected = {
            source: SOURCE,
            objectType: 'mntner'
        };

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.createSelfMnt');
        expect($stateParams.source).toBe(SOURCE);
    });

});
