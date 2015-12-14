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
                    $scope: $scope, $state: $state, $stateParams: $stateParams, UserInfoService:UserInfoService
                });
            }

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

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [401, "", {}];
        });
        $httpBackend.flush();
        expect($scope.loggedIn).toBeUndefined();

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
        // Note that the  error-interceptor is responsible for flagging redirect to crowd
    });

    it('should navigate to create screen when logged in', function () {
        selectController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, {
                username:"test@ripe.net",
                displayName:"Test User",
                expiryDate:[2015,9,9,14,9,27,863],
                uuid:"aaaa-bbbb-cccc-dddd",
                active:true
            }, {}];
        });
        $httpBackend.flush();

        expect($scope.loggedIn).toBe(true);

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.create');
        expect($stateParams.source).toBe(SOURCE);
        expect($stateParams.objectType).toBe(OBJECT_TYPE);
    });

    it('should navigate to create self maintained mntner screen when logged in', function () {
        selectController();

        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [200, {
                username:"test@ripe.net",
                displayName:"Test User",
                expiryDate:[2015,9,9,14,9,27,863],
                uuid:"aaaa-bbbb-cccc-dddd",
                active:true
            }, {}];
        });
        $httpBackend.flush();

        expect($scope.loggedIn).toBe(true);

        $scope.selected = {
            source: SOURCE,
            objectType: "mntner"
        };

        $scope.navigateToCreate();

        $httpBackend.flush();

        expect($state.current.name).toBe('webupdates.createSelfMnt');
        expect($stateParams.source).toBe(SOURCE);
    });

});

