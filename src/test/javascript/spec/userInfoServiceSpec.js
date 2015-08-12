'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('dbWebApp: UserInfoService', function () {

    var $httpBackend;
    var userInfoService;
    var userInfo;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$httpBackend_, _UserInfoService_) {
        $httpBackend = _$httpBackend_;
        userInfoService = _UserInfoService_;

        userInfo = {
            'username':'test@ripe.net',
            'displayName':'Test User',
            'expiryDate':'[2015,7,7,14,58,3,244]',
            'uuid':'aaaa-bbbb-cccc-dddd',
            'active':'true'
        };

        $httpBackend.whenGET('api/user/info').respond(userInfo);

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

    it('should provide user info',function() {
        userInfoService.init(function() {
            expect(userInfoService.getUserInfo()).toEqual(userInfo);
        });
    });

});
