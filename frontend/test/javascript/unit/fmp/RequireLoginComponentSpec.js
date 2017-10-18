/*globals beforeEach, describe, expect, inject, it, module */
'use strict';

describe('RequireLoginController', function() {
    beforeEach(module('fmp'));

    var $componentController;
    var $location;

    beforeEach(module('fmp'));
    beforeEach(inject(function (_$componentController_, _$location_) {
        $componentController = _$componentController_;
        $location = _$location_;
    }));

    describe('Testing login url', function () {
        it('should extract return url', function() {
            var ctrl = $componentController('requireLogin');
            expect(ctrl.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2F');

        });

        it('should not extract return url for forgot maintainer page', function() {
            spyOn($location, 'search').and.returnValue({ voluntary: true });
            var ctrl = $componentController('requireLogin');
            expect(ctrl.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2F');

        });

        it('should extract return url for forgot maintainer page', function() {
            spyOn($location, 'search').and.returnValue({ mntnerKey: "mnt-key", voluntary: true });
            var ctrl = $componentController('requireLogin');
            expect(ctrl.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2Fchange-auth%3FmntnerKey%3Dmnt-key%26voluntary%3Dtrue');

        });

        it('should extract return url for forgot maintainer page with voluntary undefined', function() {
            spyOn($location, 'search').and.returnValue({ mntnerKey: "mnt-key" });
            var ctrl = $componentController('requireLogin');
            expect(ctrl.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2Fchange-auth%3FmntnerKey%3Dmnt-key%26voluntary%3Dfalse');

        });

        it('should extract return url for forgot maintainer page with voluntary false', function() {
            spyOn($location, 'search').and.returnValue({ mntnerKey: "mnt-key", voluntary: false });
            var ctrl = $componentController('requireLogin');
            expect(ctrl.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2Fchange-auth%3FmntnerKey%3Dmnt-key%26voluntary%3Dfalse');

        });
    });

});
