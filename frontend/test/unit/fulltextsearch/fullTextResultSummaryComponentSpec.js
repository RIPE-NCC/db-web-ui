/*global afterEach,beforeEach,describe,expect,inject,it*/

'use strict';

describe('dbWebApp: FullTextResultSummaryComponent', function () {

    var $componentController;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    it('should show a lovely table', function () {
        var tabledata = [
            {
                name: "Fred",
                value: 99
            },
            {
                name: "Wilma",
                value: 7
            },
            {
                name: "Barney",
                value: 2
            }
        ];
        var $scope = {};
        $scope.$watch = function(f, g) {f(); g();};
        var ctrl = $componentController('fullTextResultSummary', {
            $scope: $scope
        }, {
            tabledata: tabledata
        });
        expect(ctrl.total).toEqual(108);
    });

});
