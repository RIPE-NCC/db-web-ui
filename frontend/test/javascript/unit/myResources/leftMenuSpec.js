/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('LeftMenuController', function () {

    var controller;
    var rootScope;
    var scope;
    var returnCode = '123';
    var orgDropDownStateService = {
        getSelectedOrg: function () {
            return {
                memberId: returnCode
            };
        }
    };

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$rootScope_, $controller) {
        rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        controller = $controller('LeftMenuController', {
            $log: null,
            $rootScope: _$rootScope_,
            $scope: scope
        });
        controller.orgDropDownStateService = orgDropDownStateService;
    }));

    it('should show all menu items for a user with all roles', function () {
        rootScope.$broadcast('selected-org-changed',
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(controller.show.admin).toBe(true);
        expect(controller.show.general).toBe(true);
        expect(controller.show.generalMeeting).toBe(true);
        expect(controller.show.ticketing).toBe(true);
        expect(controller.show.certification).toBe(true);
        expect(controller.show.billing).toBe(true);
    });

    it('should not set anything if user has no roles', function () {
        rootScope.$broadcast('selected-org-changed', null);
        expect(controller.show.admin).toBe(false);
        expect(controller.show.general).toBe(false);
        expect(controller.show.generalMeeting).toBe(false);
        expect(controller.show.ticketing).toBe(false);
        expect(controller.show.certification).toBe(false);
        expect(controller.show.billing).toBe(false);
        rootScope.$broadcast('selected-org-changed', {"roles": [] });
        expect(controller.show.admin).toBe(false);
        expect(controller.show.general).toBe(false);
        expect(controller.show.generalMeeting).toBe(false);
        expect(controller.show.ticketing).toBe(false);
        expect(controller.show.certification).toBe(false);
        expect(controller.show.billing).toBe(false);
    });

});
