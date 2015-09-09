'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('dbWebApp: UserInfoController', function () {
    var createController;

    var $scope, $stateParams, $state, $httpBackend, UserInfoService, $location, $window, $log, fakeWindow;

    beforeEach(function () {
        module('dbWebApp');
        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _$location_, _$window_, _UserInfoService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $window = _$window_;
            UserInfoService = _UserInfoService_;
            $log = {
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
                    //console.log('error:'+msg);
                }
            }
            fakeWindow = {
                location: {
                    href: ''
                }
            }
            UserInfoService.clear();

            createController = function() {
                _$controller_('UserInfoController', {
                    $scope: $scope, $location: $location, $window:fakeWindow, $log:$log, UserInfoService: UserInfoService, 'LOGIN_URL': 'http://access.ripe.net'
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

    it('Successful population of upper right corner',function() {
        createController();
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

        expect(RIPE.username).toEqual('Test User');

    });

    it('Redirect to crowd upon authentication error',function() {

        createController();
        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [401, "", {}];
        });
        $httpBackend.flush();

        var redirectUrl =  'http://access.ripe.net?originalUrl=' + $location.absUrl();

        expect(fakeWindow.location.href).toBe(redirectUrl);


    });
});
