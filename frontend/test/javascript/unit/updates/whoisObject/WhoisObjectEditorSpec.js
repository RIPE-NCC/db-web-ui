/*global afterEach, beforeEach, describe, expect, inject, it*/

'use strict';

function inetnum() {
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

describe('The whois object editor', function () {

    var $httpBackend;
    var $componentController;

    beforeEach(module('updates'));

    beforeEach(inject(function (_$httpBackend_, _$componentController_) {
        $httpBackend = _$httpBackend_;
        $componentController = _$componentController_;
        $httpBackend.when('GET', /.*\.html/).respond(200);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be able to submit attributes', function () {
        $httpBackend.when('GET', 'api/whois/RIPE/inetnum/1.2.3.4?unfiltered=true&unformatted=false').respond({
            'objects': {'object': [inetnum()]},
            'terms-and-conditions': {'type': 'locator', 'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'}
        });
        var model;
        var ctrl = $componentController('whoisObjectEditor2', null, {
            ngModel: inetnum(), updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.btnSubmitClicked();
        $httpBackend.flush();

        expect(ctrl.attributes.length).toEqual(3);
        expect(model.type).toBe('inetnum');
    });

    it('should filter out empty attributes on submit', function () {
        $httpBackend.when('GET', 'api/whois/RIPE/inetnum/1.2.3.4?unfiltered=true&unformatted=false').respond({
            'objects': {'object': [inetnum()]},
            'terms-and-conditions': {'type': 'locator', 'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'}
        });
        var testModel = inetnum();
        testModel.attributes.attribute.push({name: 'descr', value: 'keep this one'});
        testModel.attributes.attribute.push({name: 'descr', value: ''}); // gets removed
        testModel.attributes.attribute.push({name: 'descr', value: null}); // gets removed
        testModel.attributes.attribute.push({name: 'descr'}); // gets removed
        var model;
        var ctrl = $componentController('whoisObjectEditor2', null, {
            ngModel: testModel, updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.btnSubmitClicked();
        $httpBackend.flush();

        expect(ctrl.attributes.length).toEqual(3);
        expect(ctrl.missingMandatoryAttributes.length).toBe(5);
        expect(model.type).toBe('inetnum');
    });

    it('should be able to suss out missing mandatory attributes', function () {
        $httpBackend.when('GET', 'api/whois/RIPE/inetnum/1.2.3.4?unfiltered=true&unformatted=false').respond({
            'objects': {'object': [inetnum()]},
            'terms-and-conditions': {'type': 'locator', 'href': 'http://www.ripe.net/db/support/db-terms-conditions.pdf'}
        });
        var testModel = inetnum();
        var model;
        var ctrl = $componentController('whoisObjectEditor2', null, {
            ngModel: testModel, updateClicked: function (o) {
                model = o;
            }
        });
        ctrl.btnSubmitClicked();
        $httpBackend.flush();

        expect(ctrl.attributes.length).toEqual(3);
        expect(ctrl.missingMandatoryAttributes.length).toBe(5);
        expect(model.type).toBe('inetnum');
    });

});
