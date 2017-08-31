/*global beforeEach,describe,inject,it*/
'use strict';

describe('testing UsageStatusComponent', function () {

    var $httpBackend;
    var service;
    var controller;
    var resource;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$log_, _ResourcesDataService_) {
        service = _ResourcesDataService_;

        //mock controller
        controller = function () {
            return _$componentController_('usageStatus', {
                $log: _$log_, myResourcesDataService: _ResourcesDataService_
            });
        };

    }));


    it('should calculate free space and percentages for inetnum', function () {
        spyOn(service, 'fetchIpv4Resource').and.returnValue({
            then: function (callback) {
                callback({data: {"resources":[{"resource":"195.176.128.0 - 195.176.159.255","status":"ALLOCATED PA","type":"inetnum","netname":"CH-UNISOURCE-971003","usage":{"total":8192,"used":4107,"blockSize":32}}],"totalNumberOfResources":1,"filteredSize":1,"pageSize":1}});
            }
        });

        var controllerInstance = controller();
        controllerInstance.resource = {orgName:"",resource:"194.54.96.0 - 194.54.127.255",type:"inetnum"};
        controllerInstance.$onChanges();
        expect(service.fetchIpv4Resource).toHaveBeenCalled();
        expect(controllerInstance.usage.free).toEqual(4085);
        expect(controllerInstance.percentageUsed).toEqual(50);
        expect(controllerInstance.percentageFree).toEqual(50);
    });

    it('should calculate free space and percentages for inet6num', function () {
        spyOn(service, 'fetchIpv6Resource').and.returnValue({
            then: function (callback) {
                callback({data: {"resources":[{"resource":"2001:610::/32","status":"ALLOCATED-BY-RIR","type":"inet6num","netname":"NL-SURFNET-19990819","usage":{"total":65536,"used":523,"blockSize":48}}],"totalNumberOfResources":1,"filteredSize":1,"pageSize":1}});
            }
        });

        var controllerInstance = controller();
        controllerInstance.resource = {"orgName":"","resource":"2001:610::/32","type":"inet6num"};
        controllerInstance.$onChanges();
        expect(service.fetchIpv6Resource).toHaveBeenCalled();
        expect(controllerInstance.usage.free).toEqual(65013);
        expect(controllerInstance.percentageUsed).toEqual(1);
        expect(controllerInstance.percentageFree).toEqual(99);
        expect(controllerInstance.ipv6CalcTotal).toEqual('64K');
        expect(controllerInstance.ipv6CalcUsed).toEqual('523');
        expect(controllerInstance.ipv6CalcFree).toEqual('63K');
    });
});
