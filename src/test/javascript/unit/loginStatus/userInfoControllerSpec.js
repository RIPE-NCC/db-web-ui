'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('loginStatus: UserInfoController', function () {
    var createController;

    var $scope, $stateParams, $state, $httpBackend, UserInfoService, $log;

    beforeEach(function () {
        module('loginStatus');
        inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_, _$httpBackend_, _UserInfoService_) {

            var $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $state =  _$state_;
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            UserInfoService = _UserInfoService_;
            $log = {
                debug: function(msg) {
                    //console.log('info:'+msg);
                },
                info: function(msg) {
                    //console.log('info:'+msg);
                },
                error: function(msg) {
                    //console.log('error:'+msg);
                }
            }
            UserInfoService.clear();

            createController = function() {
                _$controller_('UserInfoController', {
                    $scope: $scope, $log:$log, UserInfoService: UserInfoService
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

    it('Do not populate upper-right upon authentication error',function() {

        createController();
        $httpBackend.expectGET('api/user/info').respond(function(method,url) {
            return [401, "", {}];
        });
        $httpBackend.flush();

        expect(RIPE.username).toBeUndefined();
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


});
