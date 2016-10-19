'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('updates: UserInfoService', function () {

    var $httpBackend;
    var userInfoService;
    var userInfo = {
            'username':'test@ripe.net',
            'displayName':'Test User',
            'expiryDate':'[2015,7,7,14,58,3,244]',
            'uuid':'aaaa-bbbb-cccc-dddd',
            'active':'true'
        };

    beforeEach(module('updates'));

    beforeEach(inject(function (_$httpBackend_, _UserInfoService_) {
        $httpBackend = _$httpBackend_;
        userInfoService = _UserInfoService_;

    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        //$httpBackend.verifyNoOutstandingRequest();
    });

    it('should provide user info on success',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(userInfo);
        $httpBackend.flush();

        userInfoService.getUserInfo().then(
            function(result) {
            expect(userInfoService.getUsername()).toEqual(userInfo.username);
            expect(userInfoService.getDisplayName()).toEqual(userInfo.displayName);
            }, function(error) {
                // NOT to be called
                expect(true).toBe(false);
            });
    });

    it('should not provide user-info on failure',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(function(method,url) {
            return [401, "", {}];
        });

        $httpBackend.flush();

        userInfoService.getUserInfo().then(
            function(result) {
                // NOT to be called
                expect(true).toBe(false);
            }, function( error) {
                expect(error.status).toBe(401);
                expect(userInfoService.getUsername()).toEqual(undefined);
                expect(userInfoService.getDisplayName()).toEqual(undefined);
            } );

    });

});
