/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('LeftMenuController', function () {

    var controller;
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
        controller = $controller('LeftMenuController', {
            $log: null,
            $rootScope: _$rootScope_
        });
        controller.orgDropDownStateService = orgDropDownStateService;
    }));

    it('should check if is LIR user in cookie', function () {
        expect(controller.isLirUser()).toBe(true);
        returnCode = 'org:123123';
        expect(controller.isLirUser()).toBe(false);
    });

    it('should initialized all menu items', function () {
        controller.clearStates();
        expect(controller.myResourcesChosen).toBe(false);
        expect(controller.webUpdatesExpanded).toBe(false);
        expect(controller.passwordsExpanded).toBe(false);
    });
});
