/*global beforeEach,describe,expect,inject,it*/
'use strict';

describe('dbWebApp: ResourceStatus', function () {

    var $ResourceStatus;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (ResourceStatus) {
        $ResourceStatus = ResourceStatus;
    }));

    it('should not show status if type is not inet(6)num', function() {
        expect($ResourceStatus.isResourceWithUsage('organisation', 'some_status')).toEqual(false);
    });

    it('should show status if type is inetnum and status ALLOCATED PA', function() {
        expect($ResourceStatus.isResourceWithUsage('INETNUM', 'ALLOCATED PA')).toEqual(true);
        expect($ResourceStatus.isResourceWithUsage('inetnum', 'ALLOCATED PA')).toEqual(true);
    });

    it('should show status if type is inetnum and status SUB-ALLOCATED PA', function() {
        expect($ResourceStatus.isResourceWithUsage('INETNUM', 'SUB-ALLOCATED PA')).toEqual(true);
        expect($ResourceStatus.isResourceWithUsage('inetnum', 'SUB-ALLOCATED PA')).toEqual(true);
    });

    it('should show status if type is inetnum and status LIR-PARTITIONED PA', function() {
        expect($ResourceStatus.isResourceWithUsage('INETNUM', 'LIR-PARTITIONED PA')).toEqual(true);
        expect($ResourceStatus.isResourceWithUsage('inetnum', 'LIR-PARTITIONED PA')).toEqual(true);
    });

    it('should show status if type is inet6num and status ALLOCATED-BY-RIR', function() {
        expect($ResourceStatus.isResourceWithUsage('INET6NUM', 'ALLOCATED-BY-RIR')).toEqual(true);
        expect($ResourceStatus.isResourceWithUsage('inet6num', 'ALLOCATED-BY-RIR')).toEqual(true);
    });

    it('should show status if type is inet6num and status ALLOCATED-BY-LIR', function() {
        expect($ResourceStatus.isResourceWithUsage('INET6NUM', 'ALLOCATED-BY-LIR')).toEqual(true);
        expect($ResourceStatus.isResourceWithUsage('inet6num', 'ALLOCATED-BY-LIR')).toEqual(true);
    });

    it('should not show status if type is inet6num and status is not ALLOCATED-BY-RIR nor ALLOCATED-BY-LIR', function() {
        expect($ResourceStatus.isResourceWithUsage('INET6NUM', 'ASSIGNED ANYCAST')).toEqual(false);
        expect($ResourceStatus.isResourceWithUsage('inet6num', 'ASSIGNED ANYCAST')).toEqual(false);
    });

    it('should not show status if type is inetnum and status is not ALLOCATED PA, SUB-ALLOCATED PA nor LIR-PARTITIONED PA', function() {
        expect($ResourceStatus.isResourceWithUsage('INETNUM', 'ASSIGNED ANYCAST')).toEqual(false);
        expect($ResourceStatus.isResourceWithUsage('inetnum', 'ASSIGNED ANYCAST')).toEqual(false);
    });

});
