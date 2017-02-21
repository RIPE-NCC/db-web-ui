'use strict';

describe('LeftMenuController', function() {

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$rootScope_, $controller) {

        this.cookiesMock = {
            value: '123',
            get: function(attribute) {
                return this.value;
            }
        };
        this.controller = $controller('LeftMenuController', {
            $log: null,
            $rootScope: _$rootScope_,
            $cookies: this.cookiesMock
        });
    }));

    it('should check if is LIR user in cookie', function() {
        expect(this.controller.isLirUser()).toBe(true);
        this.cookiesMock.value = 'ORG';
        expect(this.controller.isLirUser()).toBe(false);
    });

    it('should initialized all menu items', function() {
        this.controller.clearStates();
        expect(this.controller.myResourcesChosen).toBe(false);
        expect(this.controller.webUpdatesExpanded).toBe(false);
        expect(this.controller.passwordsExpanded).toBe(false);
    });
});
