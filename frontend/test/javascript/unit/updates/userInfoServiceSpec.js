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
    var lirs = {
        response: {
            status: 200,
            results: [{
                membershipId: 3629,
                regId: 'nl.surfnet',
                organisationname: 'SURFnet bv',
                serviceLevel: 'NORMAL',
                orgId: 'ORG-Sb3-RIPE',
                billingPhase: 0
            }, {
                membershipId: 7347,
                regId: 'zz.example',
                organisationname: 'Internet Provider BV',
                serviceLevel: 'NORMAL',
                orgId: 'ORG-EIP1-RIPE',
                billingPhase: 0
            }]
        }
    };
    var $cookies;

    beforeEach(module('updates'));

    beforeEach(inject(function (_$httpBackend_, _UserInfoService_, _$cookies_) {
        $httpBackend = _$httpBackend_;
        userInfoService = _UserInfoService_;
        $cookies = _$cookies_;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should provide user info on success',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(userInfo);
        $httpBackend.whenGET('api/ba-apps/lirs').respond(lirs);
        expectGetOrganisations();

        userInfoService.getUserInfo().then(
            function(result) {
                expect(result.username).toEqual(userInfo.username);
                expect(result.displayName).toEqual(userInfo.displayName);
            }, function(error) {
                // NOT to be called
                expect(true).toBe(false);
            });

        $httpBackend.flush();

    });

    it('should not provide user-info on failure',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(401);

        userInfoService.getUserInfo().then(
            function(result) {
                // NOT to be called
                expect(true).toBe(false);
            }, function( error) {
                expect(error.status).toBe(401);
                expect(userInfoService.getUsername()).toEqual(undefined);
                expect(userInfoService.getDisplayName()).toEqual(undefined);
            } );

        $httpBackend.flush();
    });

    it('should handle illegal selectedOrg value from cookie',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(userInfo);
        $httpBackend.whenGET('api/ba-apps/lirs').respond(lirs);
        expectGetOrganisations();

        $cookies.put("activeMembershipId",
                    'unparseableValue',
                    {path: "/", domain: ".ripe.net", secure: true});
        //localStorage.setItem('selectedLir', 'unparseableValue');

        userInfoService.getUserInfo().then(
            function(result) {
                // first lir in the list should have been automatically selected:
                expect(userInfoService.getSelectedLir().memberId).toEqual('7347');
            }, function( error) {
                // NOT to be called
                expect(true).toBe(false);
            } );

        $httpBackend.flush();
    });

    it('should preselect correct lir based on cookie selectedLir value',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/user/info').respond(userInfo);
        $httpBackend.whenGET('api/ba-apps/lirs').respond(lirs);
        expectGetOrganisations();

        $cookies.put("activeMembershipId",
            '3629',
            {path: "/", domain: ".ripe.net", secure: true});

        userInfoService.getUserInfo().then(
            function(result) {
                expect(userInfoService.getSelectedLir().orgName).toEqual('Internet Provider BV');
            }, function( error) {
                // NOT to be called
                expect(true).toBe(false);
            } );

        $httpBackend.flush();
    });

});
