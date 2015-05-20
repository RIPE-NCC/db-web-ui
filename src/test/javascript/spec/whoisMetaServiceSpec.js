'use strict';

describe('dbWebuiApp: whoisMetaService', function () {
    var $rootScope, $scope, $window, $controller, $httpBackend;

    beforeEach(module('dbWebuiApp'));

    //beforeEach(inject(function (_$rootScope_, _$controller_, _$window_, _$httpBackend_) {
    //    $rootScope = _$rootScope_;
    //    $scope = $rootScope.$new();
    //    $window = _$window_;
    //    $controller = _$controller_;
    //    $httpBackend = _$httpBackend_;
    //
    //    //$controller('FindMaintainerCtrl', {$scope: $scope, $window: $window, Maintainer: Maintainer, Validate: Validate, SendMail: SendMail});
    //}));

    afterEach(function() {

    });

    it('should make true equals true', function() {
        expect(true).toBe(true)
    });

});
