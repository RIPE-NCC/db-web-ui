/*global beforeEach, describe, expect, inject, it, module*/
'use strict';

describe('RequireLoginCtrl', function() {
    var $scope, $controller;

    beforeEach(module('fmp'));

    beforeEach(inject(function (_$rootScope_, _$controller_) {
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
    }));

    it('should extract email from url params', function() {

        $controller('RequireLoginCtrl', {
            $scope:$scope
        });
        expect($scope.loginUrl).toBe('https://access.prepdev.ripe.net/?originalUrl=http%3A%2F%2Fserver%2F%23%2Ffmp%2F');

    });
});
