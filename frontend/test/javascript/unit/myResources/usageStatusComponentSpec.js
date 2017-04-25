/*global beforeEach,describe,inject,it*/
'use strict';

describe('testing UsageStatusComponent', function () {

    var $httpBackend;
    var service;
    var controller;
    var state;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$componentController_, _$log_, _$state_, _MyResourcesDataService_, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        service = _MyResourcesDataService_;
        state = _$state_;

        //mock controller
        controller = function () {
            return _$componentController_('usageStatus', {
                $log: _$log_, $state: state, myResourcesDataService: _MyResourcesDataService_
            });
        };

    }));


    it('should calculate free space and percentages for inetnum', function () {
        state.params.objectType = 'inetnum';
        spyOn(service, 'fetchIpv4Resource').and.returnValue({
            then: function (callback) {
                callback({data: {"resources":[{"resource":"195.176.128.0 - 195.176.159.255","status":"ALLOCATED PA","type":"inetnum","netname":"CH-UNISOURCE-971003","usage":{"total":8192,"used":4107,"blockSize":32}}],"totalNumberOfResources":1,"filteredSize":1,"pageSize":1}});
            }
        });

        var controllerInstance = controller();

        expect(service.fetchIpv4Resource).toHaveBeenCalled();
        expect(controllerInstance.usage.free).toEqual(4085);
        expect(controllerInstance.percentageUsed).toEqual(50.13427734375);
        expect(controllerInstance.percentageFree).toEqual(49.86572265625);
    });

    it('should calculate free space and percentages for inet6num', function () {
        state.params.objectType = 'inet6num';
        spyOn(service, 'fetchIpv6Resource').and.returnValue({
            then: function (callback) {
                callback({data: {"resources":[{"resource":"2001:610::/32","status":"ALLOCATED-BY-RIR","type":"inet6num","netname":"NL-SURFNET-19990819","usage":{"total":65536,"used":523,"blockSize":48}}],"totalNumberOfResources":1,"filteredSize":1,"pageSize":1}});
            }
        });

        var controllerInstance = controller();

        expect(service.fetchIpv6Resource).toHaveBeenCalled();
        expect(controllerInstance.usage.free).toEqual(65013);
        expect(controllerInstance.percentageUsed).toEqual(0.79803466796875);
        expect(controllerInstance.percentageFree).toEqual(99.20196533203125);
        expect(controllerInstance.ipv6CalcTotal).toEqual('64K');
        expect(controllerInstance.ipv6CalcUsed).toEqual('523');
        expect(controllerInstance.ipv6CalcFree).toEqual('63K');
    });
});
