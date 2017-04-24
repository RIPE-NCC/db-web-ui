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

    it('should set shouldDisplayMyResources flag to true when LIRs are present', function () {
        rootScope.$broadcast('lirs-loaded-event',
            [{"membershipId":7347,"regId":"zz.example","organisationname":"Internet Provider BV","serviceLevel":"NORMAL","orgId":"ORG-EIP1-RIPE","billingPhase":0}]
        );
        expect(controller.shouldDisplayMyResources).toBe(true);
    });

    it('should not set shouldDisplayMyResources flag when LIRs are not present', function () {
        rootScope.$broadcast('lirs-loaded-event', []);
        expect(controller.shouldDisplayMyResources).toBe(false);
    });

});
