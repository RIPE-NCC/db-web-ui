/*global beforeEach,describe,expect,inject,it, spyOn*/
'use strict';

describe('LeftMenuComponent', function () {

    var $componentController;
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

    beforeEach(inject(function (_$rootScope_, _$componentController_, _$location_, _EnvironmentStatus_, _$window_) {
        rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        $location = _$location_;
        _$window_.init_portlet_menu = function(){};
        $componentController = _$componentController_('leftMenu', {
            $log: null,
            $rootScope: _$rootScope_,
            $scope: scope,
            EnvironmentStatus: _EnvironmentStatus_,
            $window: _$window_,
        });
        $componentController.orgDropDownStateService = orgDropDownStateService;
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
        expect($componentController.show.admin).toBe(true);
        expect($componentController.show.general).toBe(true);
        expect($componentController.show.generalMeeting).toBe(true);
        expect($componentController.show.ticketing).toBe(true);
        expect($componentController.show.certification).toBe(true);
        expect($componentController.show.billing).toBe(true);
        expect($componentController.show.testRcEnv).toBe(false);
        expect($componentController.show.trainingEnv).toBe(false);
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
        expect($componentController.show.testRcEnv).toBe(false);
        expect($componentController.show.trainingEnv).toBe(true);
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
        expect($componentController.show.testRcEnv).toBe(true);
        expect($componentController.show.trainingEnv).toBe(false);
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
        expect($componentController.show.testRcEnv).toBe(true);
        expect($componentController.show.trainingEnv).toBe(false);
    });

    it('should not set anything if user has no roles', function () {
        rootScope.$broadcast('selected-org-changed', null);
        expect($componentController.show.admin).toBe(false);
        expect($componentController.show.general).toBe(false);
        expect($componentController.show.generalMeeting).toBe(false);
        expect($componentController.show.ticketing).toBe(false);
        expect($componentController.show.certification).toBe(false);
        expect($componentController.show.billing).toBe(false);
        rootScope.$broadcast('selected-org-changed', {"roles": [] });
        expect($componentController.show.admin).toBe(false);
        expect($componentController.show.general).toBe(false);
        expect($componentController.show.generalMeeting).toBe(false);
        expect($componentController.show.ticketing).toBe(false);
        expect($componentController.show.certification).toBe(false);
        expect($componentController.show.billing).toBe(false);
    });

    it('should set menu for end user role', function () {
        rootScope.$broadcast('selected-org-changed',
            {
                "orgObjectId": "ORG-OOO2-RIPE",
                "organisationName": "Only One Org",
                "roles": ["certification", "NON-MEMBER"]
            }
        );
        expect($componentController.show.admin).toBe(false);
        expect($componentController.show.general).toBe(false);
        expect($componentController.show.generalMeeting).toBe(false);
        expect($componentController.show.ticketing).toBe(false);
        expect($componentController.show.certification).toBe(true);
        expect($componentController.show.billing).toBe(false);
    });

    it('should set menu for user role without lir or organisation', function () {
        rootScope.$broadcast('selected-org-changed',
            {}
        );
        expect($componentController.show.admin).toBe(false);
        expect($componentController.show.general).toBe(false);
        expect($componentController.show.generalMeeting).toBe(false);
        expect($componentController.show.ticketing).toBe(false);
        expect($componentController.show.certification).toBe(false);
        expect($componentController.show.billing).toBe(false);
    });
});
