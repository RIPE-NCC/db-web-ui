/*global afterEach, beforeEach, describe, expect, inject, it*/

'use strict';

function createinetnum() {
    return {
        source: {
            id: 'RIPE'
        },
        type: 'inetnum',
        attributes: {
            attribute: [
                {name: 'inetnum', value: '1.2.3.4'},
                {name: 'netname', value: 'XYZ Net'},
                {name: 'source', value: 'RIPE'}
            ]
        }
    };
}

function modifyinetnum() {
    return {
        source: {
            id: 'RIPE'
        },
        type: 'inetnum',
        attributes: {
            attribute: [
                {name: 'inetnum', value: '1.2.3.4'},
                {name: 'netname', value: 'XYZ Net'},
                {name: 'source', value: 'RIPE'},
                {name: 'created', value: '1970-01-01T00:00:00Z'},
                {name: 'last-modified', value: '2014-05-26T13:28:47Z'}
            ]
        }
    };
}

describe('The whois object editor', function () {

    var $httpBackend;
    var $componentController;

    beforeEach(module('dbWebApp'));

    beforeEach(inject(function (_$httpBackend_, _$componentController_) {
        $httpBackend = _$httpBackend_;
        $componentController = _$componentController_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be able to submit attributes', function () {
        var model;
        var ctrl = $componentController('whoisObjectEditor', null, {
            ngModel: modifyinetnum(), updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.$onInit();
        ctrl.btnSubmitClicked();

        expect(ctrl.attributes.length).toEqual(5);
        expect(model.type).toBe('inetnum');
    });

    it('should filter out empty attributes on submit', function () {
        var testModel = modifyinetnum();
        testModel.attributes.attribute.push({name: 'descr', value: 'keep this one'});
        testModel.attributes.attribute.push({name: 'descr', value: ''}); // gets removed
        testModel.attributes.attribute.push({name: 'descr', value: null}); // gets removed
        testModel.attributes.attribute.push({name: 'descr'}); // gets removed
        var model;
        var ctrl = $componentController('whoisObjectEditor', null, {
            ngModel: testModel, updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.$onInit();
        ctrl.btnSubmitClicked();

        expect(model.attributes.attribute.length).toEqual(6);
        expect(ctrl.missingMandatoryAttributes.length).toBe(5);
        expect(model.type).toBe('inetnum');
    });

    it('should be able to suss out missing mandatory attributes', function () {
        var testModel = modifyinetnum();
        var model;
        var ctrl = $componentController('whoisObjectEditor', null, {
            ngModel: testModel, updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.$onInit();
        ctrl.btnSubmitClicked();

        expect(model.attributes.attribute.length).toEqual(5);
        expect(ctrl.missingMandatoryAttributes.length).toBe(5);
        expect(model.type).toBe('inetnum');
    });

});
