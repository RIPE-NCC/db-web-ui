'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('dbWebApp: UserInfoService', function () {

    var httpBackend;
    var rootScope;
    var userInfoService;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _UserInfoService_) {
        httpBackend = _$httpBackend_;
        rootScope = _$rootScope_;
        userInfoService = _UserInfoService_;

        httpBackend.whenGET('api/user/info').respond(
            [
	            {
	                'username':'test@ripe.net',
	                'displayName':'Test User',
	                'expiryDate':'[2015,7,7,14,58,3,244]',
	                'uuid':'aaaa-bbbb-cccc-dddd',
	                'active':'true'
                }
            ]);
    }));

    afterEach(function() {});

    it('initial state is undefined',function() {
        expect(userInfoService.getUsername()).toBeUndefined();
    });

    it('init',function() {
        userInfoService.init(function() {
            expect(userInfoService.getUsername()).toEqual('Test User');
        });
    });

});