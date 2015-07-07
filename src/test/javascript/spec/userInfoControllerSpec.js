'use strict';

var RIPE = {};
var init_user_menu = function() {};
var display_user_menu = function() {};

describe('dbWebApp: UserInfoController', function () {

    var $scope, $stateParams, $state;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _$stateParams_) {

        var $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $state =  _$state_;
        $stateParams = _$stateParams_;

        var $UserInfoService = {
            init: function(callback) {
                if (typeof callback == "function"){
                    callback();
                }
            },
            getUsername: function() { return "test@ripe.net"; },
            getDisplayName: function() { return "Test User" },
            getUuid: function() { return "aaaa-bbbb-cccc-dddd" }
        };

        _$controller_('UserInfoController', {
            $scope: $scope, $stateParams: $stateParams, $state: $state, UserInfoService: $UserInfoService
        });

    }));

    afterEach(function() {});

    it('initial state',function() {
        expect(RIPE.username).toEqual('Test User');
    });

});