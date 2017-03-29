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

    it('should check if is LIR user in cookie', function () {
        rootScope.$broadcast('organisation-changed-event', { memberId: '123'});
        expect(controller.isLirSelected).toBe(true);
        rootScope.$broadcast('organisation-changed-event', { memberId: 'org:123123'});
        expect(controller.isLirSelected).toBe(false);
    });

});
