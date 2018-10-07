'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};
var init_sso_nav = function() {};

describe('updates: UserInfoService', function () {

    var $httpBackend;
    var userInfoService;
    var userInfo = {
        user: {
            'username': 'test@ripe.net',
            'displayName': 'Test User',
            'uuid': 'aaaa-bbbb-cccc-dddd',
            'active': 'true'
        },
        members: [
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": [
                    "admin",
                    "general",
                    "generalMeeting",
                    "resources",
                    "certification",
                    "ticketing",
                    "billing",
                    "LIR"
                ]
            },
            {
                "membershipId": 3629,
                "regId": "nl.surfnet",
                "orgObjectId": "ORG-Sb3-RIPE",
                "organisationName": "SURFnet bv",
                "roles": [
                    "admin",
                    "general",
                    "generalMeeting",
                    "resources",
                    "certification",
                    "ticketing",
                    "billing",
                    "LIR"
                ]
            }
        ]
    };
    var $cookies;

    beforeEach(module('updates'));

    beforeEach(inject(function (_$httpBackend_, _UserInfoService_, _$cookies_) {
        $httpBackend = _$httpBackend_;
        userInfoService = _UserInfoService_;
        $cookies = _$cookies_;
    }));

    beforeEach(function() {
        localStorage.clear();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should provide user info on success',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/user/info').respond(userInfo);

        userInfoService.getUserOrgsAndRoles().then(
            function(result) {
                expect(result.user.username).toEqual(userInfo.user.username);
                expect(result.user.displayName).toEqual(userInfo.user.displayName);
            }, function(error) {
                // NOT to be called
                expect(true).toBe(false);
            });

        $httpBackend.flush();

    });

    it('should not provide user-info on failure',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/user/info').respond(401);

        userInfoService.getUserOrgsAndRoles().then(
            function(result) {
                // NOT to be called
                expect(true).toBe(false);
            }, function( error) {
                expect(error.status).toBe(401);
            } );

        $httpBackend.flush();
    });

    it('should handle illegal selectedOrg value from cookie',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/user/info').respond(userInfo);

        $cookies.put('activeMembershipId',
                    'unparseableValue',
                    {path: "/", domain: ".ripe.net", secure: true});

        userInfoService.getSelectedOrganisation().then(
            function(result) {
                // first lir in the list should have been automatically selected:
                expect(result.membershipId).toEqual(7347);
            }, function( error) {
                // NOT to be called
                expect(true).toBe(false);
            } );

        $httpBackend.flush();
    });

    it('should preselect correct lir based on cookie selectedLir value',function() {
        $httpBackend.whenGET(/.*.html/).respond(200);
        $httpBackend.whenGET('api/whois-internal/api/user/info').respond(userInfo);

        $cookies.put("activeMembershipId",
            '3629',
            {path: "/", domain: ".ripe.net", secure: true});

        userInfoService.getSelectedOrganisation().then(
            function(result) {
                expect(result.organisationName).toEqual('Internet Provider BV');
            }, function( error) {
                // NOT to be called
                expect(true).toBe(false);
            } );

        $httpBackend.flush();
    });

});
