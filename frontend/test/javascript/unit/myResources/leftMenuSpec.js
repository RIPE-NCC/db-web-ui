/*global beforeEach,describe,expect,inject,it, spyOn*/
'use strict';

describe('LeftMenuController', function () {

    var controller;
    var rootScope;
    var scope;
    var returnCode = '123';
    var $location;
    var orgDropDownStateService = {
        getSelectedOrg: function () {
            return {
                memberId: returnCode
            };
        }
    };

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$rootScope_, $controller, _$location_) {
        rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        $location = _$location_;
        controller = $controller('LeftMenuController', {
            $log: null,
            $rootScope: _$rootScope_,
            $scope: scope,
            $location: $location,
        });
        controller.orgDropDownStateService = orgDropDownStateService;
    }));

    it('should show all menu items for a user with all roles', function () {
        spyOn($location, 'host').and.returnValue('prepdev.db.ripe.net');
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
        expect(controller.show.testTrainingEnv).toBe(false);
    });

    it('should show just Resource/My Resources and RIPE Database for Training environment', function () {
        spyOn($location, 'host').and.returnValue('training.db.ripe.net');
        rootScope.$broadcast('selected-org-changed',
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(controller.show.testTrainingEnv).toBe(true);
    });

    it('should show just Resource/My Resources and RIPE Database for Production Test environment', function () {
        spyOn($location, 'host').and.returnValue('apps-test.db.ripe.net');
        rootScope.$broadcast('selected-org-changed',
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(controller.show.testTrainingEnv).toBe(true);
    });

    it('should show just Resource/My Resources and RIPE Database for Production Test environment', function () {
        spyOn($location, 'host').and.returnValue('rc.db.ripe.net');
        rootScope.$broadcast('selected-org-changed',
            {
                "membershipId": 7347,
                "regId": "zz.example",
                "orgObjectId": "ORG-EIP1-RIPE",
                "organisationName": "Internet Provider BV",
                "roles": ["admin", "general", "generalMeeting", "resources", "certification", "ticketing", "billing", "LIR"]
            }
        );
        expect(controller.show.testTrainingEnv).toBe(true);
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

    it('should set menu for end user role', function () {
        rootScope.$broadcast('selected-org-changed',
            {
                "orgObjectId": "ORG-OOO2-RIPE",
                "organisationName": "Only One Org",
                "roles": ["certification", "NON-MEMBER"]
            }
        );
        expect(controller.show.admin).toBe(false);
        expect(controller.show.general).toBe(false);
        expect(controller.show.generalMeeting).toBe(false);
        expect(controller.show.ticketing).toBe(false);
        expect(controller.show.certification).toBe(true);
        expect(controller.show.billing).toBe(false);
    });

    it('should set menu for user role without lir or organisation', function () {
        rootScope.$broadcast('selected-org-changed',
            {}
        );
        expect(controller.show.admin).toBe(false);
        expect(controller.show.general).toBe(false);
        expect(controller.show.generalMeeting).toBe(false);
        expect(controller.show.ticketing).toBe(false);
        expect(controller.show.certification).toBe(false);
        expect(controller.show.billing).toBe(false);
    });
});
