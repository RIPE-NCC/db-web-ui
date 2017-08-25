/*global beforeEach,describe,inject,it*/
'use strict';

describe('testing UsageStatusComponent', function () {

    var controller;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_) {

        //mock controller
        controller = function () {
            return _$componentController_('ip-usage', {});
        };

    }));

    it('should calculate free space and percentages for inetnum', function () {
        var controllerInstance = controller();
        controllerInstance.type = "inetnum";
        controllerInstance.usage = {"total":8192,"used":4107,"blockSize":32};
        controllerInstance.$onChanges();
        expect(controllerInstance.usage.free).toEqual(4085);
        expect(controllerInstance.percentageUsed).toEqual(50);
        expect(controllerInstance.percentageFree).toEqual(50);
    });

    it('should calculate free space and percentages for inet6num', function () {
        var controllerInstance = controller();
        controllerInstance.type = "inet6num";
        controllerInstance.usage = {"total":65536,"used":523,"blockSize":48};
        controllerInstance.$onChanges();
        expect(controllerInstance.usage.free).toEqual(65013);
        expect(controllerInstance.percentageUsed).toEqual(1);
        expect(controllerInstance.percentageFree).toEqual(99);
        expect(controllerInstance.ipv6CalcTotal).toEqual('64K');
        expect(controllerInstance.ipv6CalcUsed).toEqual('523');
        expect(controllerInstance.ipv6CalcFree).toEqual('63K');
    });
});
